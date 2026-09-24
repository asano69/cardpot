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
- 新規: `frontend/src/lib/rxdb/{cardsSchema,checkpoint,database}.ts`
- 新規: pull のみの `cardsReplication.ts`（Centrifuge の `stream$` はまだ繋がない）
- `cardsStore.ts` と画面は触らない。

実装前に直す点は次の通り。
- 計画書 §3.3 のスニペットは `pb` を import していない。
- fetch を直接呼ばず `pb.send` を使う。認証ヘッダと、401/403 で `authStore` を消す `afterSend`（`pb.ts`）をそのまま使える。
- `rxdb` と `rxjs` は `package.json` に入っている。RxDB 17 の API（プラグインの import パスなど）は、実装時に公式ドキュメントで確認する。

### 第3回以降
- 第3回: Centrifuge を `pullStream$` に接続し、§5.1 の実測（10万件の初回 sync の時間、UI のブロック、メモリ）を行う。ここで致命的なら移行を見送る。
- 第4回: `cardsStore.ts` の読み取りを RxDB の reactive query に置き換える（段階 B）。`resyncPot` とページングを削除する。
- 第5回: 楽観的更新の pending オーバーレイ（段階 C）。
