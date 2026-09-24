# RxDB 導入 進捗ノート

計画は `docs/rxdb-offline-sync-plan.md`。この文書は実施ごとの記録で、回ごとに追記する。

## 第1回: バックエンド pull API

### やったこと
- `GET /api/pages/{potId}/cards/pull` を追加した（`internal/serve/replication.go`、`pages` グループなので superuser 認証）。
- テストを追加した（`internal/serve/replication_test.go`）。`updated` が同一の複数件で漏れないこと、soft delete 済みが含まれること、`limit`、クエリの検証を見ている。
- `slug_test.go` 87行目の構文エラー（`; err != nil {` の欠落）を修正した。第1回とは無関係の既存のバグで、`internal/serve` のテスト全体がビルドできなくなっていた。
- 計画書のスケッチと実装の差分を、計画書 §2.2 に反映した。

### 確認状況
- 実データでの確認（§2.1）: 概ね問題なし（ユーザー確認）。
- `go test ./internal/serve/` と `make lint` の修正後の結果は未確認。次回着手前に通すこと。

### 注意点
- `{potId}` は pot の **id**。既存の `{pot}`（links1hop など）は pot の name なので混同しない。
- `limit` は既定 200、最大 1000。フロントの `batchSize` 以上にしておくこと。サーバの上限のほうが小さいと、RxDB は短いページを見て「続きなし」と誤認する。
- checkpoint は `updatedAt` と `id` の組。両方指定するか両方省略し、片方だけなら 400 を返す。
- `updatedAt` は PocketBase が返した文字列をそのまま送り返す。空白区切りの `2026-01-01 00:00:00.000Z` 形式のままで、`T` 区切りに変換しない。リアルタイムイベントの `record.updated` も同じ形式なので、`pullStream$` の checkpoint にもそのまま使える。
- pull は `notDeleted` で絞らない。RxDB は削除を `_deleted` の書類として受け取る必要がある。
- テストでは `updated` を text フィールドで代用している。本物の autodate での動作を保証するのは、実データでの手動確認のほうである。

## 次の予定

### 第2回: フロントの RxDB 土台（段階 A の前半）

#### やったこと
- 新規: `frontend/src/lib/rxdb/checkpoint.ts`（`CardCheckpoint` 型）
- 新規: `frontend/src/lib/rxdb/cardsSchema.ts`（RxDB スキーマ、`CardRxDoc` 型）
- 新規: `frontend/src/lib/rxdb/database.ts`（`getDb()`。cards は全ポット共通の単一コレクション）
- 新規: `frontend/src/lib/rxdb/cardsReplication.ts`（`startCardsReplication(collection, potId)`）
  - pull ハンドラは `pb.send()` を使用（`fetch` を直接呼ばない。認証ヘッダと 401/403 での `authStore` クリアが自動で効く）。
  - `live: false`。`pull.stream$` 用の `Subject` は用意したが、まだ誰も `.next()` しない（Centrifuge 未接続）。第3回でこの Subject に Centrifuge のイベントを流し込む予定で、その時に `pull.stream$` の配線自体は変えずに済むようにしてある。
- `cardsStore.ts` と画面コンポーネントは一切変更していない（計画通り）。

#### 未確認・注意点
- RxDB 17 系の実際の import パス（`rxdb/plugins/replication`、`rxdb/plugins/storage-dexie`、`rxdb/plugins/query-builder`）と `replicateRxCollection` / `RxReplicationPullStreamItem` の型シグネチャは、公式ドキュメント／型定義で未検証。`bun run typecheck` を最初に実行して確認すること。
- `pb.send()` に渡す URL 末尾のクエリ文字列（`?limit=...&updatedAt=...`）が SDK 側でそのまま素通りするか未確認。素通りしない場合は `pb.send` の `query` オプション（あれば）に切り替える。
- ブラウザの IndexedDB devtools で `getDb()` → `startCardsReplication()` を手動実行し、実際に `cards` テーブルにレコードが溜まることを目視確認するのが第3回着手前の前提。

### 第3回以降
- 第3回: Centrifuge を `pullStream$` に接続し、§5.1 の実測（10万件の初回 sync の時間、UI のブロック、メモリ）を行う。ここで致命的なら移行を見送る。
- 第4回: `cardsStore.ts` の読み取りを RxDB の reactive query に置き換える（段階 B）。`resyncPot` とページングを削除する。
- 第5回: 楽観的更新の pending オーバーレイ（段階 C）。
