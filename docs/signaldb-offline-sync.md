「SignalDBを完全な差分同期可能なローカルレプリカにする」という設計に転換すれば、position順のwindowという制約自体をなくせるので、ご指摘の通りresyncPotで全量再フェッチが原理的に不要になります。

## Stage 1: SignalDBを「キャッシュ」から「完全レプリカ＋checkpoint保持」に変える（UIは無変更）

**目的**：まずネットワーク層だけを差し替え、画面表示ロジックには一切触れない。リスクを最小化した土台作り。

**変更内容**
- `lib/api/replication.ts`（新規）：`/api/pages/{potId}/cards/pull`を`updatedAt`/`id`のcheckpointでループ呼び出しするクライアント。`pullCardsHandler`のコメント通り「返ってきたページがlimitより短ければ完了」というシンプルな終了条件。
- `lib/signaldb/cardsCollection.ts`を拡張：pot単位のカードcollectionに加えて、同じpotの`checkpoint`（`{updatedAt, id}`）を保存する小さなキーだけのcollectionかkey-value的な仕組みを追加。
- pot初回オープン時、既存の`readCache`によるペイントはそのまま残しつつ、バックグラウンドで「checkpointから現在までpullし切る」処理を追加。checkpointがnull（初回同期）なら結果的にフル取得になるが、これは避けようがない（差分の起点が存在しないため）。

**影響範囲**：`cardsById`/`windows`（既存のUI用Solidストア）はまだ触らない。既存の`fetchCardsPage`ベースの表示ロジックと並行して動くだけ。

**確認できること**：pull→SignalDB反映→checkpoint更新、が単体で正しく動くこと。UI側の回帰リスクはほぼゼロ。

---

## Stage 2: UIのデータソースをREST pagingからSignalDBに切り替える

**目的**：ここで初めて「windowという概念」を捨て、SignalDBを唯一のUIソースにする。

**変更内容**
- `cardsStore.ts`の内部実装を書き換え：`fetchCardsPage`によるページ送りをやめ、SignalDBの`collection.find({pot: potId}, {sort: {pin: -1, position: -1, id: 1}, reactive: true})`から直接取得する形に。
- ただし外部に見せるAPI（`potWindow`, `cardsById`, `loadNextCardsPage`など）のシグネチャは変えない方針を推奨。CardItem/CardForm/CardListなど呼び出し側を一斉に書き換えずに済み、変更をこのファイル内に閉じ込められる。
- Centrifugeのリアルタイムイベント（`handleCardEvent`）も、直接Solidストアを書き換えるのではなく、まずSignalDBの該当collectionに`replaceOne`/`removeOne`し、その変化がSignalDBのreactive queryを通じて自動的にUIへ伝播する形にする（`@signaldb/solid`はすでに依存に入っている）。

**影響範囲**：`cardsStore.ts`のみ。外部インターフェースが変わらないので、コンシューマー側の変更は不要。

**注意点**：Stage 1のpull同期がまだ終わっていないpotについては、「ロード中」表示を維持する必要がある（`loaded`フラグの意味を「pull完了」に寄せる）。

---

## Stage 3: `resyncPot`をcheckpoint差分に置き換える（本題）

**目的**：ここでようやく「全量再フェッチをやめる」が実現する。

**なぜ今なら可能か**：SignalDBがそのpotの**全カード**をローカルに持つようになったため、並び替え（position順）はクライアント側で毎回計算し直せる。これまでの「window（上位N件だけ）」方式だと、サーバの`updated`差分だけでは「今の上位N件」を再構成できなかった（他カードとの相対順位が分からないため）が、全件複製なら問題にならない。

**変更内容**
- Centrifugeの`onResync`（履歴切れ検知）で呼んでいた`resyncPot`の中身を、`fetchCardsPage`によるページ再取得から、保存済みcheckpointを使った`pullCards`差分適用に置き換える。
- 差分適用：`pullCards`が返す各レコードについて、`deleted`が立っていればSignalDBから削除、そうでなければ`upsert`。適用後にcheckpointを最新の`(updated, id)`に更新。
- 「久しぶりにオンラインに戻った」ケース（タブを開いたまま長時間オフライン→復帰）も、この同じ経路（保存済みcheckpoint→差分pull→SignalDB反映）で処理できる。ユーザーが要望していた「SignalDBに差分を反映してからハイドレーション」がここで実現する：pull適用が終わるまでは既存のSignalDBの中身（＝多少古いが一貫性のあるデータ）をそのまま表示し続け、適用完了後に新しい状態へ自然に再レンダリングされる（reactive queryなので明示的な「ハイドレーション」処理を書く必要すらない）。

**影響範囲**：`resyncPot`関数のみ。Stage 2で既にSignalDBがUIソースになっているため、この変更はデータ取得経路の差し替えだけで、UIコードには触れない。

---

## Stage 4: 旧ページング経路の削除と整理

**目的**：もう使われなくなった古いコードパスを消して、実装をシンプルに保つ（CLAUDE.mdの方針通り）。

**変更内容**
- `fetchCardsPage`、`PotWindow.total`をREST由来で持つロジック、`PAGE_SIZE`定数など、REST pagingに紐づくコードを削除。
- `readCache`による「まず古いキャッシュを一瞬見せてから上書き」という二段階ペイントも不要になる（SignalDB自体がreactiveにUIへ流れるので、pull完了を待つだけで済む）。関連コメントも整理。
- ドキュメント（`docs/dexie-offline-sync.md`）は今回Dexie前提で参考にならなかった旨を踏まえ、SignalDB版の設計として書き直すか、もしくは新規ドキュメントに置き換える。

---

## 全体を通しての留意点

- **初回同期（checkpoint未保有）は依然としてフル取得になる**。これは「差分の起点がない」以上避けられません。「2回目以降の再接続」で不要になる、というのが正確な言い方です。
- 1ポット最大10万件（CLAUDE.md記載）を前提とすると、SignalDBが全件をIndexedDBに持つことになるため、初回同期のコストとストレージ使用量は増えます。ここは「シンプルさ」とのトレードオフとして許容するかどうかの判断が要ります。
- 各Stageは独立してmerge可能な粒度にしてあるので、Stage 1だけ入れて様子を見る、Stage 2で問題が出たらStage 3を保留する、といった段階的なロールバックがしやすい構成です。
