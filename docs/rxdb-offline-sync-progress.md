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

## 第3回: Centrifuge を pullStream$ に接続

### やったこと
- `cardsReplication.ts` に `startCentrifugeStream` を追加し、`subscribeToCards` のイベントを `pullStream$.next(...)` に変換して流し込むようにした。
  - 対象ポット以外のイベントは無視（cards コレクションは全ポット共通の単一コレクションのため）。
  - `onResync`（ギャップ検出）は `pullStream$.next("RESYNC")` に変換し、RxDB 標準の再pullに委ねる。
- `startCardsReplication` の `live` を `false` → `true` に変更。
- 返す cleanup 関数で `replication.cancel()` と Centrifuge の unsubscribe の両方を呼ぶようにした。

### 意図的にスキップしたこと
- **10万件データでの実測（§5.1: 初回フルsyncのレイテンシ、UIブロック時間、メモリ）はユーザー指示によりスキップ。** 致命的な問題の有無は未確認のまま次段階に進む。問題が出た場合は段階Bの途中でも計測に戻ること。

### 未確認・注意点（次回着手前に確認すること）
- `bun run typecheck` / `bun run test` は未実行。特に `RxReplicationPullStreamItem` に "RESYNC" 文字列リテラルを渡す型が RxDB 17 の型定義上正しいか要確認。
- `subscribeToCards` は呼び出しごとに新しい Centrifuge subscription (`connection.newSubscription("cards")`) を作る実装（`realtime.ts`）。複数ポットのレプリケーションを同時に開くと、その数だけ独立した "cards" 購読が立つ。今のところ同時に開くポットは1つの想定（段階Bで `cardsStore.ts` に統合する際に、シングルトン化するかどうか再検討する）。
- ブラウザの IndexedDB devtools で `startCardsReplication` を実行し、Centrifuge 経由のイベントが実際に IndexedDB へ反映されることを目視確認する作業はまだ行っていない。

## 第4回: cardsStore.ts を RxDB ベースに置き換え（段階 B）

### やったこと
- `cardsStore.ts` を全面的に書き直し。`ensurePotLoaded(potId)` / `releasePot(potId)` を新しい公開APIの中心に据え、RxDB の reactive query (`collection.find({selector:{pot}}).subscribe(...)`) が `cardsById`/`windows` を直接更新する。
  - `windows` (`PotWindow`) は「ページ」の概念を廃止。`ensurePotLoaded` が解決すれば、そのポットの全カードがローカルにある前提になった。
  - `resyncPot`・`watchCards`・`fetchCardsPage` 経由のページングは削除。ギャップ検出時の再取得は RxDB の RESYNC（第3回で配線済み）に一本化。
  - `moveCard` から `PERSIST_DELAY_MS` の遅延トリックを削除した。この遅延は「ローカル楽観更新とリアルタイムechoのFLIPアニメーション競合」を避けるためのものだったが、新設計では `cardsById` が RxDB の reactive query の単純なミラーになったため、その競合自体が発生しなくなった。
  - `setCardPinned` / `removeCard` は元の挙動をほぼ踏襲（成功時にサーバのレスポンスを直接反映）。段階C（pending オーバーレイ）はまだ実装していない。
- `openCardBySlug`（サーバ問い合わせ）を廃止し、`findCardByPotAndSlug`（`cardsById` をローカルで `titleToSlug` 走査するだけの純関数）に置き換えた。`cardApi.ts` の `fetchCardBySlug` / `fetchCardsPage` / `CardsPage` / `CARDS_SORT` は死んだコードとして削除。
- `PotLayout.tsx` がポットのロード開始（`ensurePotLoaded`）を一元的に担うようにした。`CardList` 単体の effect ではなく親レイアウトに置いたのは、`CardForm` が単独でマウントされるケース（URL直打ちでカードを開く）でも同じロードが必要なため。
- `CardList.tsx` から `IntersectionObserver` による無限スクロールと、それに紐づく `createEffect` を撤去した。全カードが常にローカルにある前提になったため、`handleDragEnd` の「未ロードの末尾」を考慮したクランプ処理（`moreUnloaded`/`isWindowTail`）も削除。
- `AppShell.tsx` からアプリ全体で1本張っていた `watchCards()`（Centrifugeの "cards" チャンネル購読）の呼び出しを削除。今は各ポットの `ensurePotLoaded` が自分のレプリケーション用に独立した Centrifuge 購読を持つ。
- `cardsStore.test.ts` を削除した（旧実装＝ページング・`resyncPot`・`watchCards` を前提にしたテストで、新実装とは根本的に噛み合わないため）。

### 未確認・注意点（次回着手前に確認すること）
- `bun run typecheck` / `bun run test` は未実行。特に:
  - `replication.awaitInitialReplication()` が RxDB 17 の実際の型/挙動と一致するか。
  - `RxDocument.toJSON()` の戻り値の型と `CardRxDoc` の互換性。
- **cardsStore 用のテストが存在しない状態になっている。** 次回、RxDB を（fake-indexeddb 等で）モックした新しいテストスイートを用意する必要がある。優先度高。
- 「ポットを開くと全カードがローカルに落ちてくる」設計は、10万件規模のポットでの初回同期コスト（§5.1）が未検証のまま本流に乗った状態。段階Bが安定した後、または大きいポットでの体感が悪い報告があった時点で、実測と対策（バッチ分割の見直し、あるいは本当に必要な場合はページングの部分復活）を検討する。
- `PotLayout.tsx` の `ensurePotLoaded` 呼び出しは pot 切り替えのたびに `createEffect` から呼ばれるが、`ensurePotLoaded` 自体は同じ potId に対しては冪等（Map で二重起動を防止）。ポット間を素早く行き来した場合の `releasePot`→`ensurePotLoaded` の順序は Solid の `createEffect`/`onCleanup` の実行順（前のクリーンアップが先に走る）に依存している点は未検証。

### 次の予定

- 第5回: cardsStore 用の新しいテストスイート（RxDB モック）を用意する。
- 第6回: 楽観的更新の pending オーバーレイ（段階 C）。
- 10万件実データでの実測（§5.1）: 上記の注意点に記載の通り、必要になった時点で改めて実施する。
