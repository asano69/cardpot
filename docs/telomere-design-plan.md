# テロメア設計: 行ID・最終更新・未読既読

各行の左に出る細いバー(テロメア)のデータを、本物にするための設計計画。現在は `telomereStore.ts` がダミー(行番号キー)を返している。これを次の3つの仕組みに置き換える。

## 1. 決定事項の要約

| 問題 | 持ち場 | 要点 |
| --- | --- | --- |
| 行の同一性 | `lineId.ts`(CRDT idから導出) | **opaque**。中身を解釈しない |
| 最終更新者・編集時刻 | docの `Y.Map("lineMeta")` | 行ID → `{userId, name, at}`。自己申告・表示専用 |
| 未読・既読 | `card_views.seen`(ユーザ単位)と現在のdocの差分 | 時刻を使わない。state vectorの差分 |

3つは独立している。行IDは更新者を知らず、更新者情報は未読判定に使わず、未読判定は時刻を使わない。

### 採らなかった案

- **clientIDとユーザIDの紐づけ(`card_clients`)**: 更新者を `lineMeta` に直接書くので不要。ygoの受信フックも要らない。
- **明示的なランダム行ID(Y.Textの書式属性)**: Enterで挿入された `\n` は左の書式を継承するため、行の分割でIDが複製される。補正用のobserverも要る。
- **未読を `at` と `card_views.left` の比較で判定**: `at` はクライアント時計で、オフライン編集は過去の時刻のままマージされ、取りこぼす。
- **state vectorを端末(IndexedDB)側だけに保存**: 端末をまたぐと、A端末で見た行がB端末で未読になる。

## 2. 行ID

### 現状と方針

`lib/models/lineId.ts` の `lineIdAt(ytext, lineStart)` は、行の直前の `\n` のCRDT id(`client:clock`)を行IDとする。先頭行は固定値 `HEAD`。この実装は変えない。

変えるのは扱い方だけ。

- `client:clock` の `client` は一意性のための名前空間であり、**作成者ではない**。`split(":")` などで解釈してはならない。
- `LineId` 型のコメントに「opaque. Never parse it」と明記する。
- UIに出すときは、そのまま見せない。ツールチップのデバッグ表示(現状の `id: ...`)に限る。

### 性質(既存テストで固定済み)

- 行内の編集ではIDが変わらない。
- Enterで行を分割すると、上の部分がIDを保ち、下の部分は新しい `\n` のIDになる。
- 行を結合すると、上の行のIDが残る。
- Undoで復元した行、全文置換(import)後の行は、新しいIDになる。これは仕様として受け入れる。

## 3. 最終更新情報: `Y.Map("lineMeta")`

### データ

```ts
// ydoc.getMap<LineMeta>("lineMeta"), keyed by LineId.
interface LineMeta {
  userId: string; // who edited the line last
  name: string;   // display name, copied at write time
  at: number;     // epoch ms, client clock
}
```

- **`name` を一緒に入れる理由**: `users` コレクションの `listRule` は `id = @request.auth.id` なので、他人の名前をクライアントが引けない。書き込み時に自分の名前を写しておく(awarenessの `setLocalUser` と同じ値)。
- `at` は**表示用(バーの太さ・ツールチップ)だけ**に使う。未読判定には使わない。未来の時刻は表示時に現在時刻に丸める(時計ずれ対策)。
- 自己申告であり、改ざん防止はしない(20人規模のチーム前提)。

### 書き込み(新規: `plugins/interactions/lineMetaWriter.ts`)

1. CodeMirrorの更新のうち、**ユーザの編集**だけを対象にする。条件は `titleCandidatePlugin.ts` の `hasUserEdit` と同じ(`ySyncAnnotation` と `syntheticAnnotation` を除く)。この判定は共有モジュールに切り出す。
2. `update.changes.iterChangedRanges` で、変更後の文書で変わった範囲を求め、触れた行の `line.from` を集める。
3. 行ごとに\*\*デバウンス(1〜2秒)\*\*してから `lineIdAt(ytext, line.from)` でIDを引き、Mapへ書く。変更の直後ではなくフラッシュ時に最新の位置で引き直す(行がずれているため)。
4. `ytext.length !== view.state.doc.length` のときはフラッシュを見送る(`telomere.ts` と同じ防御)。
5. 書き込みは `ydoc.transact(fn, LINE_META_ORIGIN)` で行う。`yCollab` のUndoManagerは `ySyncConfig` 由来の変更だけを追跡するので、独自のoriginを使えば**Undoでメタが巻き戻らない**。

分割・結合された行は、変更範囲が両側の行に触れるので、両方に書かれる。

### 読み取り

`ymap.observe` で変更を受け、Solidのストアに反映する(`lineMetaStore`)。この購読はドラフトでも動く(ドラフトのY.Docは `ExistingCardEditor` に引き継がれる)。

### 掃除

削除された行のエントリは残る。1エントリは100バイト前後なので、**当面は放置**する。サイズの監視だけ入れ、問題が出た時点でサーバの圧縮時に掃除する案を検討する(ygoのAPIは未確認)。

## 4. 未読・既読

### 定義

- **既読の基準**: ユーザが「見た」docの状態を、state vector(clientごとの次のclock)で表す。ユーザ単位でサーバに持つので、**端末をまたいで共有される**。
- **未読行**: 基準に含まれない文字(`clock >= seen[client]`)を持つ行。
- **行と文字の対応**: 行は「直前の `\n` から、その行のテキストの終わりまで」の文字を持つ(行IDの定義と同じ範囲)。そのどれかが未見なら、その行は未読。
- **自分の編集は既読**: 自分が書いた文字は自分のstate vectorに入るので、送信した `seen` に含まれる。

### 保存: `card_views.seen`

`card_views` は `(card, user)` 単位で既に存在する。フィールドを1つ足す(PocketBaseのWeb UIで追加。マイグレーションコードは不要)。

```
card_views.seen   json   { "<clientID>": <nextClock>, ... }
```

- バイナリのstate vectorではなく**JSONのmap**にする。サーバ(Go)でvarintを解析せずに、`max` のマージだけで済ませるため。
- `maxSize` を設定する(例: 1MB)。clientIDはセッションごとに増えるが、1カードあたりの数は限られる。
- マージは **clientごとに最大値**を取る。単調増加なので、複数端末が順不同・同時に送っても巻き戻らない。
- 読み書きは `RunInTransaction` 内で行う(同じユーザの端末間の競合を避ける)。

### API(`internal/api/types.go` に型を足し、tygoで生成)

```
GET  /api/admin/cards/{id}/seen   -> { seen: { [client: string]: number } }
POST /api/admin/cards/{id}/seen   body { seen: { [client: string]: number } }  -> 204
```

- ユーザは `e.Auth.Id` から取る。
- **スーパーユーザは何もしない**(GETは空、POSTは204)。`card_views.user` は `users` へのrelationで、`yjs_auth.go` もスーパーユーザを追跡していない。
- 未知のcard、削除済みのcardは404。

### クライアントの流れ(新規: `lib/stores/unreadStore.ts`)

```
1. y-indexeddb の whenSynced を待つ
   localSV = encodeStateVector(ydoc)         // what this device had before the network
2. GET /seen -> serverSeen                     // offline or failed: skip
3. WebSocketの初回 sync を待つ
4. baseline = merge(serverSeen, localSV)       // per-client max
5. unreadLineIds = linesWithUnseenChars(ytext, baseline)
   -> 以後カードを閉じるまで固定(スナップショット)
6. POST /seen with merge(baseline, encodeStateVector(ydoc))
   以後、定期(30秒程度)・visibilitychange(hidden)・pagehide でも送る
```

重要な順序: **6は5の後**。先に送ると全部が既読になる。

**`localSV` を足す理由**: このデバイスでオフライン編集した分(IndexedDBにだけある)は、まだサーバの `seen` に入っていない。足さないと、自分の編集が未読になる。このデバイスが以前受け取った他人の編集も既読に寄るが、割り切る。

**オフラインで開いた場合**: `serverSeen` が取れないので、基準は `localSV` だけになり、未読は出ない。接続後に再計算はしない(スナップショットは1回だけ)。

### `linesWithUnseenChars(ytext, baseline)`(新規: `lib/models/unseen.ts`)

Y.Textのitemを `_start` から `right` へ辿り、削除されていないitemごとに、未見の文字範囲を求める。

```ts
// An item covers clocks [id.clock, id.clock + length).
// Characters with clock >= baseline[client] are unseen.
const seen = baseline.get(item.id.client) ?? 0;
const unseenFrom = Math.max(seen, item.id.clock);
const unseenCount = item.id.clock + item.length - unseenFrom; // <= 0 means all seen
```

- 辿りながら文字のindexを数え、未見の範囲を集める。
- 範囲ごとに、含まれる行を求める。\*\*未見の文字が `\n` なら、その `\n` が先頭にある行(次の行)\*\*と、その `\n` で終わる行の両方を未読にする(分割で、どちらも変わったため)。
- 各行の先頭位置から `lineIdAt` でIDを引き、`LineId` の集合として返す。
- `Y.Text._start` は公開APIではない。**アクセスはこの関数1か所に閉じ込め**、Yjsのバージョンを上げたときにテストで検知する(`lineId.ts` の `createRelativePositionFromTypeIndex` は公開APIなので、そちらで書き換えられるなら寄せる)。

### 開いている間の変更

開いている間にリモートが加えた編集は、未読ではなく **`updated`** にする。`lineMeta` の `observe` で `transaction.local === false` の変更だけを `updatedLineIds` に入れる(時刻比較は使わない)。

## 5. 表示

`telomereStore.ts` を、行番号キーのダミーから、**LineIdキー**に替える。

```ts
status(lineId):
  updatedLineIds.has(lineId) -> "updated"
  unreadLineIds.has(lineId)  -> "unread"
  otherwise                  -> "read"
```

- `TelomereData.entries` を `Record<LineId, TelomereEntry>` にする。`telomere.ts` のgutterは、すでに `lineIdAt` でIDを引いているので、`entries[lineIndex]` を `entries[id]` に替えるだけ。
- バーの太さは `telomereThickness(now - min(at, now))`。
- ツールチップは `name` と、デバッグ時のみ行ID。
- エントリのない行(メタ未記録の古い行)は `read`、太さは最も細い値。
- 自分が書いた行(`meta.userId === 自分`)は、未読の集合に入っていても `read` にする(自分の編集は既読)。

## 6. 実装フェーズ

各フェーズは単独でテストとマージができる。

### Phase 1: 行IDの明文化と共有判定

- `lineId.ts` のコメントを更新(opaque)。
- `hasUserEdit` を `lib/models` か `plugins` の共通モジュールに切り出し、`titleCandidatePlugin.ts` から使う。

### Phase 2: `lineMeta` の書き込みと読み取り

- `lineMetaWriter.ts`、`lineMetaStore.ts`。
- `index.tsx` で拡張を登録。ユーザ情報は `currentUser()` から。
- `telomereStore.ts` の更新者・時刻を実データにする(未読はまだダミーでよい)。

### Phase 3: サーバ側 `seen`

- `card_views` に `seen` json フィールドを追加(Web UI)。
- `internal/serve/card_views.go` に `mergeSeen`、`GET`/`POST` ハンドラ。`handler.go` の `admin` グループに登録。
- `internal/api/types.go` にリクエスト・レスポンス型、`make generate`。

### Phase 4: クライアントの未読計算

- `lib/models/unseen.ts`、`lib/stores/unreadStore.ts`、`ExistingCardEditor.tsx` への組み込み。
- 送信タイミング(開いた直後・定期・`visibilitychange`・`pagehide`)。`pagehide` では `fetch` の `keepalive` を使う。

### Phase 5: 表示の統合

- `telomere.ts` のキーをLineIdに変更、状態の優先順位(§5)を実装。
- ダミーデータ(`dummyEntries`)を削除。

## 7. テスト

### フロントエンド(vitest)

- `unseen.test.ts`(`lineId.test.ts` と同じ形式でY.Docを使う)
  - baselineが空: 全行が未読。
  - baselineが現在のSV: 未読なし。
  - 行の途中に他人が文字を挿入: その行だけ未読。
  - Enterで分割: 上下の両行が未読。
  - 結合(`\n` の削除): 上の行が未読にならない(削除された文字は数えない)。
  - 2つのclientの文字が1つのitemにまたがる場合(itemの部分的な既読)。
  - 並行編集をマージした後でも、`replicate`/`sync` で両replicaが同じ結果になる。
- `lineMetaWriter.test.ts`: リモート由来・合成の変更では書かない、デバウンス、Undoで巻き戻らない。
- `unreadStore.test.ts`: 順序(5の後に6)、`localSV` で自分のオフライン編集が既読になる、オフライン時は未読なし。

### バックエンド(go test)

- `mergeSeen`: clientごとの最大、空の入力、単調性。
- ハンドラ: 他のユーザの `seen` に触れない、スーパーユーザは何もしない、削除済みカードは404、2端末の同時POSTで巻き戻らない。

## 8. 既知の制約・割り切り

- 更新者と時刻は自己申告。`at` は表示専用。
- Undoで復元した行と、importで置換した行は新しいIDを持つ。メタは失われ、`read` で表示される。
- 他端末で見た直後で、`seen` の送信前に別端末を開くと、短時間だけ未読に見えることがある(定期送信の間隔が上限)。
- 他人の編集を、バックグラウンドのタブが受け取っただけで開かなかった場合でも、`localSV` 経由で既読に寄る。
- 「自分の編集を他人が見たか」の管理(逆方向の既読)はしない。
- 削除された行のメタは掃除しない。

## 9. 変更するファイル

| ファイル | 変更 |
| --- | --- |
| `frontend/src/lib/models/lineId.ts` | opaqueの明記 |
| `frontend/src/lib/models/unseen.ts` (new) | 未見の文字を持つ行の算出 |
| `frontend/src/lib/stores/lineMetaStore.ts` (new) | `lineMeta` の購読、`updatedLineIds` |
| `frontend/src/lib/stores/unreadStore.ts` (new) | `seen` の取得・基準の合成・送信 |
| `frontend/src/lib/stores/telomereStore.ts` | ダミーを削除、LineIdキーの導出 |
| `frontend/src/features/noteEditor/plugins/interactions/lineMetaWriter.ts` (new) | 編集した行のメタ書き込み |
| `frontend/src/features/noteEditor/plugins/decorations/telomere.ts` | `entries` のキーをLineIdに |
| `frontend/src/features/noteEditor/titleCandidatePlugin.ts` | `hasUserEdit` の共有化 |
| `frontend/src/features/noteEditor/ExistingCardEditor.tsx` | `unreadStore` の起動と後始末 |
| `frontend/src/lib/api/cardApi.ts` | `fetchSeen` / `postSeen` |
| `internal/serve/card_views.go` | `mergeSeen` と `seen` のハンドラ |
| `internal/serve/handler.go` | ルート登録 |
| `internal/api/types.go` | 型の追加(tygoで生成) |
| PocketBase Web UI | `card_views.seen` の追加 |

サーバの `ydoc.go`・`title_watch.go`・`wikilink` は変更しない。`lineMeta` は別のY.Mapなので、テキスト(`content`)の処理には影響しない。

## 10. 実装前に確認すること

- `y-codemirror.next` のUndoManagerの `trackedOrigins` が `ySyncConfig` だけであること(独自originのMap書き込みがUndoされない前提)。
- `Y.Text._start` とitemの `id` / `length` / `deleted` が、使用中のYjs(13.6.x)で期待どおり読めること。
- `lineIdAt` を行数ぶん呼ぶコスト。未読の算出は行ごとではなく、未見の範囲を含む行だけに限る。

