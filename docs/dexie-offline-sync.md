# Dexie による Cards オフライン同期


Cards のローカルミラーは `frontend/src/lib/dexie/database.ts` の Dexie
データベースである。`cards` テーブルはカード ID を主キーにし、pot ごとの
読み取りと並び替えのために `pot`、`[pot+position]`、`[pot+updated]` を
インデックスとして持つ。pull のチェックポイントは `cardCheckpoints` テーブル
に pot ごとに保存する。

`cardsReplication.ts` は既存の checkpoint pull API と Centrifuge イベントを
処理する。ライブのカードは `bulkPut`、ソフト削除レコードは `bulkDelete` して、
UI に削除済みカードを露出させない。ギャップ検出時は保存済みチェックポイント
から pull を再実行する。

複数タブでは Web Locks API の `cardpot:cards-replication:<potId>` を保持した
タブだけが Centrifuge と pull を実行する。ロックを取れなかったタブは書き込まず、
`liveQuery(() => db.cards.where("pot").equals(potId).toArray())` で同一
オリジンの IndexedDB 更新を読む。リーダータブが閉じると、待機中のタブがロックを
取得して同期を引き継ぐ。


# 現在のアーキテクチャ（Centrifuge + Dexie）

## 全体の流れ

```
PocketBase (cards collection, soft-delete)
   │ create/update/delete フック (internal/realtime/register.go)
   ▼
Centrifuge Node ("cards" channel, history 1000件/10分)
   │ WebSocket
   ▼
frontend/src/lib/api/realtime.ts (subscribeToCards)
   │ onEvent / onResync
   ▼
frontend/src/lib/dexie/cardsReplication.ts (startCardsReplication)
   │ bulkPut / bulkDelete
   ▼
frontend/src/lib/dexie/database.ts (IndexedDB: cards, cardCheckpoints)
   │ liveQuery
   ▼
frontend/src/lib/stores/cardsStore.ts (Solid store)
   ▼
UI (CardList / CardForm)
```

## 各層の役割

- **`internal/realtime`**: `cards` collection の create/update/delete を Centrifuge の `cards` チャンネルに publish するだけ。認証は superuser token のみ。
- **`internal/serve/replication.go`**: `GET /api/pages/{potId}/cards/pull?updatedAt=&id=&limit=` によるチェックポイント式の差分取得API。`(updated, id)` の複合ソートで tie-break し、`deleted` 済みカードも含めて返す（IndexedDB 側に `_deleted` 相当の削除イベントとして伝える必要があるため）。
- **`dexie/database.ts`**: `cards`（本体）と `cardCheckpoints`（pot ごとの `{updatedAt, id}`）の2テーブル。チェックポイントは IndexedDB に永続化されるので、タブを閉じても消えない。
- **`dexie/cardsReplication.ts`**: 本題の同期ロジック。pot ごとに Web Locks (`navigator.locks`) でリーダー選出し、リーダータブだけが Centrifuge 購読 + pull を実行。フォロワータブは `liveQuery` で同一オリジンの IndexedDB 変更を読むだけ。
- **`cardsStore.ts`**: `ensurePotLoaded(potId)` が呼ばれた時だけ上記の同期が起動する（オンデマンド、pot を開いている間だけ）。

## 「久しぶりにオンラインに戻った」ときの挙動

これは実はちゃんと考慮されている設計です:

1. **短い切断（Centrifuge の history TTL 内＝10分 / 1000イベント以内）**: 再接続時に `ctx.recovered = true` となり、欠けていたイベントが history から再送される（`onEvent` 経由で1件ずつ `applyRecords`）。
2. **長い切断（history からリカバリ不能）**: `subscription.on("subscribed")` で `recovered: false` が返り、`onResync()` → `pullPot(potId)` が起動。これは `cardCheckpoints` に保存された最後の `(updatedAt, id)` から `PULL_BATCH_SIZE=200` 件ずつバッチ取得を「短いページが返るまで」ループする。
3. **ブラウザ自体を閉じていた場合**: チェックポイントは IndexedDB に永続化されているので、次にそのタブ（またはPWA）でその pot を開いた瞬間 (`ensurePotLoaded` → `lead()`) に、必ず `pullPot` が最初に1回走る。Centrifuge の recovered/resync の結果を待たずに毎回これが走るので、差分取得の取りこぼしに対する保険になっている。

→ 結論としては、**「差分取得」の仕組み自体は成立しています**。ここは壊れていません。

## 設計上の気になる点

### 1. エラーの握りつぶし（`enqueue` の `.then(work, work)`）— 対応済み

`.then(onFulfilled, onRejected)` に同じ `work` を渡していたため、直前の書き込みが失敗してもエラー理由を見ずに次の `work` を実行し続け、ログも出ない状態だった。`onRejected` を専用のハンドラに分離し、失敗を `console.error` で記録してからチェーンを継続するよう修正した:
```ts
const enqueue = (work: () => Promise<void>) => {
  writeChain = writeChain.then(work, (err) => {
    console.error(`[cards-replication] step failed for pot ${potId}:`, err);
    return work();
  });
  return writeChain;
};
```
これにより `onEvent`/`onResync` 経由の失敗もコンソールに残るようになった。挙動そのもの（失敗しても次のイベントで回復を試みる）は変えていない。

### 2. `applyRecords` のコード重複（対応済み）

`applyRecords(records, checkpoint?)` に一本化し、pull 時はチェックポイント更新を同一トランザクションで行う。
`cardsReplication.ts` には module レベルの `applyRecords(records)` 関数があるのに、`pullPot` 内のバルク書き込みは（チェックポイント更新とのトランザクションを一体化するためか）ほぼ同じロジックを再度インライン実装しています。ロジックが2箇所に分散していて、片方だけ直しても気づきにくい典型的な保守性リスクです。`applyRecords` を「(records, checkpointUpdate?)」のように拡張して1本化するか、少なくともコメントで「意図的に重複させている理由」を書いておくべきです。

### 3. 順序保証がない（レース条件）
`applyRecords` は受け取ったレコードをそのまま `bulkPut` するだけで、**ローカルの既存データより古い `updated` かどうかをチェックしていません**。`writeChain` で直列化されてはいますが、それは「JS側でのキューの順序」を保証するだけで、「PocketBase 上の実際の更新順序」と一致する保証はありません（例: 初回 `pullPot` と、ほぼ同時に届いた Centrifuge のイベントが逆順で処理される可能性はゼロではない）。実害が出る可能性は低いですが、`updated` を比較して古いレコードでの上書きを弾く一行を足しておくと安全です。

### 4. カスケード削除がリアルタイムイベントを発火しない可能性
`pots` の削除は `cards.pot` の `cascadeDelete: true` で連鎖削除されますが、PocketBase のカスケード削除が個々の `cards` レコードに対して `OnRecordAfterDeleteSuccess` フックを発火させるかは要確認です。発火しない場合、`internal/realtime` の `cardHook("delete")` も呼ばれず、該当 pot のローカル IndexedDB にゴミが残る可能性があります（実害は「その pot を二度と開かなければ気づかない」程度なので緊急度は低い）。

### 5. バックグラウンド同期がない
同期は `ensurePotLoaded` が呼ばれた（＝ユーザーがその pot を開いた）ときにしか起動しません。Service Worker 等でのバックグラウンド pull は無いので、「アプリを開いていない間の差分」はアプリを開いた瞬間にまとめて取りに行く設計です。これは意図的な割り切りとして妥当だと思いますが、認識としてズレがないよう明記しておく価値はあります。

## まとめ

- 「久しぶりにオンラインになったときの差分取得」自体は **チェックポイント永続化 + 初回pull + Centrifugeのresync** の三重の仕組みで担保されており、設計として破綻はしていません。
- 一番深刻なのは **1のエラー握りつぶし** です。せっかく差分取得の仕組みがあっても、失敗時に何も分からないのは運用上のリスクなので、ここだけは早めに直すことをおすすめします。
- 2〜5 は保守性・エッジケースの話で、緊急度は低いです。

これをそのままファイル（`docs/dexie-offline-sync.md` の更新など）にまとめましょうか？

---


