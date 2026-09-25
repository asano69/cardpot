# Dexie.js → SignalDB 移行計画

## 0. 前提・スコープ

対象は「cards のオフライン・リアルタイム同期レイヤー」のみ。以下の3ファイルが実質的な移行対象。

- `frontend/src/lib/dexie/database.ts`
- `frontend/src/lib/dexie/cardsReplication.ts`
- `frontend/src/lib/stores/cardsStore.ts`

サーバ側（`internal/serve/replication.go` の checkpoint pull API、`internal/realtime` の Centrifuge push）は **無変更**。フロント側の消費方法だけを変える。

`pots` は対象外（今もリアルタイム同期を持たず、`potsStore.ts` は単純な全件フェッチ + ローカル楽観更新のままで良い）。

参照ドキュメント: `docs/dexie-offline-sync.md`（現行設計）, `docs/dexie-offline-issue.md`（現行実装の既知の性能課題）。この移行はここに書かれた課題（O(n) 全件差分スキャン、二重ステート管理、エラー握りつぶしの再発リスク）を構造的に解消することが目的の一つ。

## 1. 依存関係

```
bun add @signaldb/core @signaldb/solid @signaldb/sync @signaldb/indexeddb
```

- `@signaldb/core`: `Collection`
- `@signaldb/solid`: Solid 用リアクティビティアダプタ（公式）
- `@signaldb/sync`: `SyncManager`（pull/push の抽象化）
- `@signaldb/indexeddb`: ローカル永続化アダプタ（IndexedDB）

`dexie` は最終フェーズまで残し、他機能（今後増える可能性のあるローカルキャッシュ）に影響しないことを確認してから外す。

## 2. 設計方針（移行後の姿）

### 2.1 責務の再配置

| 現行 | 移行後 |
|---|---|
| `dexie/database.ts` の `cards` テーブル定義 | `Collection<CardRecord>` 定義（1ファイル） |
| `cardsReplication.ts` の `applyRecords`/`pullPot` | `SyncManager` の `pull`/`push` オプションに集約 |
| `cardsReplication.ts` の Centrifuge 購読 → `applyRecords` 手動反映 | `SyncManager` の `registerRemoteChange` から再 pull をトリガー |
| `cardsStore.ts` の `cardsById`/`windows` 二重ステート + `liveQuery` 差分計算 | `Collection.find(...).fetch()` を直接コンポーネントから呼ぶ（リアクティブ、差分計算不要） |
| `cardsStore.ts` の `patchCard` による楽観更新 + ロールバック | `Collection` への直接 `updateOne`/`removeOne` → `SyncManager` が push 失敗時のリコンサイルを担う |
| `dexie/cardsReplication.ts` の Web Locks リーダー選出 | **そのまま残す**（SignalDB はタブ間排他を持たない） |

### 2.2 残る自前ロジック（誤解しないよう明記）

SignalDB に移行しても消えないもの:

- マルチタブでの Centrifuge 購読 + pull のリーダー選出（`navigator.locks`）
- pot 単位での「今どのpotを同期対象にするか」のライフサイクル管理（`ensurePotLoaded`/`releasePot` 相当の概念）

これらは SignalDB のスコープ外なので、`cardsReplication.ts` に薄いラッパーとして残す。ゼロにはならないが、責務は「リーダー選出とpot単位のon/off」だけに縮小する。

## 3. フェーズ分け

段階的に進める。各フェーズは独立にマージ可能で、フェーズ間で挙動を壊さないことを確認しながら進める。

### Phase 1 — Collection 定義とスキーマ整備

- `frontend/src/lib/signaldb/cardsCollection.ts`（仮）を新設し、`CardRecord`（既存の `lib/models/card.ts` の型をそのまま流用）を持つ `Collection` を定義。
- `reactivity: solidReactivityAdapter`, `persistence: createIndexedDBAdapter('cards')` を設定。
- この時点ではまだ何も配線しない（単体で `insert`/`find` が動くことをテストで確認するだけ）。
- 完了条件: vitest で `Collection` の CRUD が動作することを確認するテストが通る。

### Phase 2 — SyncManager の実装（pull/push/registerRemoteChange）

- `pull`: 既存の `pullPot` のロジック（`/api/pages/{potId}/cards/pull` を checkpoint 付きで叩き、`PULL_BATCH_SIZE` ごとにページング）をほぼそのまま移植。`lastFinishedSyncStart`/`lastFinishedSyncEnd` は SignalDB 側が管理するので、checkpoint（`updatedAt`/`id`）の永続化は `persistenceAdapter` オプションに任せるか、専用の小さな仕組みを検討する（既存の `cardCheckpoints` テーブル相当）。
- `push`: 既存の `updateCard`/`deleteCard`（`lib/api/cardApi.ts`）をそのまま呼ぶ薄いラッパー。
- `registerRemoteChange`: 既存の `subscribeToCards` の `onEvent` を「再 pull のトリガー」に置き換える。`onResync`（ギャップ検出時の再pull）はそのまま `registerRemoteChange` のコールバック発火に統合できる。
- 完了条件: サーバをローカルで起動し、1タブでの pull → 表示、他クライアントでの更新 → realtime 反映、が動くことを手動確認。

### Phase 3 — マルチタブ排他の統合

- `cardsReplication.ts` の Web Locks によるリーダー選出ロジックを、SyncManager の起動/停止を包む形にリファクタ。リーダータブのみ `syncManager.sync()` を呼び、フォロワータブは呼ばない（IndexedDB persistence adapter 経由でリーダーの書き込みを読むだけ）。
- 完了条件: 複数タブを開いた状態でリーダータブを閉じ、フォロワーが引き継ぐことを確認する既存相当のシナリオテスト。

### Phase 4 — `cardsStore.ts` の置き換え

- `cardsById`/`windows`/`patchCard`/`withCardsFlip` の呼び出しパターンを、`Collection.find({ pot: potId }, { sort: {...} })` ベースの読み取りに置き換える。
- `moveCard`/`setCardPinned`/`removeCard` は「ローカル `Collection` を直接更新 → SyncManager が push」という流れに寄せ、明示的なロールバックコードを削除できるか検証する（push 失敗時に SyncManager がどう振る舞うかは `@signaldb/sync` の挙動を先にテストで確認しておく）。
- 呼び出し側（`CardList.tsx`, `CardItem.tsx`, `CardForm.tsx`, `PotLayout.tsx`）のインポートを `cardsStore.ts` の新しい公開APIに向ける。**呼び出し側のシグネチャはなるべく変えない**（`ensurePotLoaded`, `findCardByPotAndSlug` などの関数名・型は維持し、内部実装だけ差し替える）ことで、このフェーズのレビュー範囲を絞る。
- 完了条件: 既存の `cardsStore.test.ts` を新実装向けに書き直し、全ケースがパスする。

### Phase 5 — カードの並び替え FLIP アニメーション

- `lib/cardFlip.ts`（`withCardsFlip`）は UI 層のアニメーションなので変更不要。Phase 4 で置き換えた `cardsStore.ts` の関数群から、これまで通り呼び出せることだけ確認する。

### Phase 6 — Dexie の除去

- `frontend/src/lib/dexie/` ディレクトリを削除。
- `package.json` から `dexie` を除去。
- 完了条件: `grep -r "from \"dexie\""` / `grep -r "from '@/lib/dexie"` が0件。

### Phase 7 — ドキュメント更新

- `docs/dexie-offline-sync.md` を `docs/signaldb-offline-sync.md` に置き換え、新アーキテクチャ図とフローを記述。
- `docs/dexie-offline-issue.md` は「解決済みの過去の課題記録」として残すか、末尾に「SignalDB移行により解消」の一文を追記して残す（履歴として有用なため削除はしない）。

## 4. リスクと対応

| リスク | 対応 |
|---|---|
| `@signaldb/sync` の push 失敗時リコンサイル挙動が、今の手動ロールバックと完全に同じ UX にならない | Phase 4 着手前に、意図的に push を失敗させるテストを書いて挙動を確認してから移行方針を固める |
| SignalDB は Dexie ほど実績がなく、破壊的変更のリスクがある | バージョンを固定し、`package.json` で明示的な範囲指定にする。single-user アプリなので影響範囲は限定的 |
| Centrifuge イベント → 再pullトリガーへの変更で、1件更新が今より重くなる（フルpullになる） | `registerRemoteChange` のコールバックに event の `record` を渡し、変更点が1件だけなら `collection.replaceOne` で直接反映し、ギャップ検出時のみ再pullする設計にする（`onResync` と同じ使い分け） |
| 10万件規模のpotでの性能（`docs/dexie-offline-issue.md` 参照） | Phase 4 の性能検証を、`scripts/load_test_cards.py` で生成した大規模データに対して実施し、旧実装との比較を取る |

## 5. ロールバック戦略

各フェーズは個別のPRとしてマージするため、問題が出た場合は直前のフェーズまで `git revert` で戻せる。Phase 4（`cardsStore.ts` 本体の置き換え）が最もリスクが高いため、このフェーズだけは機能フラグ等での段階的ロールアウトは行わず、代わりに Phase 4 用のテストカバレッジを厚くしてから一括で切り替える（フラグ分岐を残すこと自体がこのアプリの「シンプルさ重視」の方針に反するため）。

## 6. 完了の定義

- `dexie`, `dexie-solid` 等への依存が `package.json` から消えている
- `cardsStore.test.ts` が SignalDB ベースの実装に対して全てパスする
- 複数タブでのリーダー引き継ぎ、オフライン→オンライン復帰時の差分取得、10万件規模のpotでの表示性能、をそれぞれ手動確認済み
- `docs/signaldb-offline-sync.md` が最新実装を反映している
