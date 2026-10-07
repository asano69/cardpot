# 行IDをYjs由来に置き換えるリファクタリング計画

いまは、サーバサイドで行IDを与える別の実装をしているが、yjsが提供している機能をつかうほうが、自然な設計な気がしてきたのでリファクタリングしたい。

## 考え方: 改行文字のYjs IDを行IDとして使う
 
行ごとに `Y.Text` を持たせる必要はありません。Yjsは文字(Item)ごとに `(client, clock)` という全クライアントで一意かつ編集に対して安定なIDを持っています。**行の直前の `\n` 文字のID**を行IDとみなせば、`Y.Text` 1本のまま行IDを実現できます。先頭行だけは直前の改行がないので、固定のセンチネルを使います。
 
| 操作 | 結果 |
|---|---|
| 行の途中で Enter | 前半は元のIDを維持し、後半は新しい `\n` のIDを得る |
| 行頭の改行を削除して行を結合 | 後ろの行のIDが消え、前の行のIDが残る |
| 行内の文字編集 | IDは変わらない |
| 同時編集 | IDはCRDTのIDなので、どのクライアントでも同じ |
 
## 実装
 
```ts
import * as Y from "yjs";
 
export type LineId = string; // "head" or "client:clock"
 
// The first line has no preceding newline, so it uses a fixed sentinel.
export const HEAD: LineId = "head";
 
// idx: index of a "\n" character in ytext
const newlineId = (ytext: Y.Text, idx: number): LineId => {
  const item = Y.createRelativePositionFromTypeIndex(ytext, idx).item!;
  return `${item.client}:${item.clock}`;
};
 
// lineStart: document offset where the line starts (CodeMirror's line.from).
// y-codemirror.next keeps CodeMirror offsets and Y.Text indices identical.
export const lineIdAt = (ytext: Y.Text, lineStart: number): LineId =>
  lineStart === 0 ? HEAD : newlineId(ytext, lineStart - 1);
 
// Returns the current start offset of the line, or null if the line is gone.
export const lineStartOf = (
  ydoc: Y.Doc,
  ytext: Y.Text,
  id: LineId,
): number | null => {
  if (id === HEAD) return 0;
  const [client, clock] = id.split(":").map(Number);
  const rpos = Y.createRelativePositionFromJSON({ item: { client, clock } });
  const abs = Y.createAbsolutePositionFromRelativePosition(rpos, ydoc);
  if (!abs || abs.type !== ytext) return null;
  // If the newline was deleted, abs.index points at a different character,
  // so comparing IDs tells us whether the original newline still exists.
  if (abs.index >= ytext.length || newlineId(ytext, abs.index) !== id) {
    return null;
  }
  return abs.index + 1;
};
```
 
CodeMirror側での使い方は次のとおりです。
 
```ts
const line = view.state.doc.lineAt(pos);
const id = lineIdAt(ytext, line.from);
```
 
## 行ごとのメタデータ
 
行に紐づく情報(コメント、ステータスなど)は、別の `Y.Map` に行IDをキーとして持たせるのが最も単純です。
 
```ts
const lineMeta = ydoc.getMap<{ note: string }>("lineMeta");
lineMeta.set(lineIdAt(ytext, line.from), { note: "..." });
```
 
行が削除されても対応するエントリは残るので、必要なら `lineStartOf` が `null` を返すキーを定期的に削除してください。
 
## 注意点
 
- **Undo/Redoでは行IDが変わります**。`Y.UndoManager` が復元した改行は新しいIDになります。メタデータを維持したい場合は、復元時にIDを付け替える処理が必要です。
- **カット&ペーストや行の置換でもIDは新規になります**。これは「内容を作り直した」という意味では自然な挙動です。
- **計算コストは `lineIdAt` が行ごとにほぼ定数時間、`lineStartOf` も同程度です**。全行のIDが必要でも、表示範囲の行だけ計算すれば十分です。
 
## 他の選択肢と非推奨の理由
 
- **`Y.Array<Y.Text>`(行ごとのText)**: 行が第一級の構造体であるべきなら有効ですが、y-codemirrorの標準バインディングが使えず、行の分割・結合を自前で扱う必要があり、保守コストが大きく上がります。
- **本文に不可視のマーカー文字でIDを埋め込む**: 本文が汚染され、コピー&ペーストや検索で問題が出るので避けるべきです。
 
行IDの用途(ガター表示、コメント、差分追跡など)を教えてもらえれば、それに合わせたCodeMirror拡張(`gutter` や `StateField` との組み合わせ)も具体的に書けます。


## 1. 結論

この方針は妥当で、実装コストに見合います。理由は次のとおりです。

- **現状の実装は行IDの用途に対して重すぎます。** 現在の行IDの消費者はtelomereガターのツールチップ(`id: ...`)だけです。それなのに、サーバーの`lineWatcher`(300msデバウンス)、`assignLineIDs`(LCSによる推測)、`card_lines`コレクション、pull/realtimeレプリケーション、Dexieテーブルと、仕組みが大きくなっています。
- **ID付与がテキストに遅れ、揺れます。** 現状のIDは「テキスト → サーバー → realtime → Dexie」を経由するため、入力中は`lineIds[lineIndex]`が実際の行とずれます。IDの付与も差分からの推測なので、クライアント間で結果が一致する保証はありません。Yjs方式ならCRDTのIDそのものなので、即時で、全クライアントで同一で、オフラインでも成立します。
- **将来の用途と整合します。** `telomereStore.ts`のTODOは、履歴をカードのY.Doc内のY.Mapに持たせると書いています。行IDがYjs由来なら、そのMapのキーに直接使えます。
- **ドラフトにも行IDが付きます。** サーバー方式ではカード作成前のドラフトに行IDがありません。

## 2. 添付案のレビュー(実装前に直す点)

| 項目 | 内容 |
|---|---|
| `.item!` | `idx >= ytext.length`のとき`item`は`null`になります。`lineStart - 1`は必ず`\n`のindexなので通常は起きませんが、ytextとCMの文書が一時的にずれた場合に備えてガードします。 |
| 計算量の記述 | 「ほぼ定数時間」は不正確です。`createRelativePositionFromTypeIndex`はItemの連結リストを先頭から辿るので、O(Item数)です。連続入力はItemにマージされるため通常は小さく、ガターは表示行だけを計算します。まず計測し、遅ければ後でキャッシュします。 |
| `lineStartOf` | 現時点で呼び出し側がありません。ユーザー方針(保守性優先・単純さ)に従い、消費者が現れるまで実装しません。 |
| Undo | `Y.UndoManager`が復元した改行は新IDになります。現状も推測なので同等以下ですが、将来Y.Mapに履歴を持たせると、Undoで行の履歴が消えます。受け入れる前提とし、文書に明記します。 |
| Enter(行頭) | 現行サーバー実装は「元の内容の行がIDを保持」します。直前の`\n`方式では、行頭でEnterすると元の内容の行が新IDになり、挙動が逆になります。行の途中でのEnter、行の結合、行内編集は現行と同じです。利用実績のない現状では許容できる差と判断します。 |

行頭でのEnterを現行と揃えたい場合は、「直後の`\n`のID、最終行は`tail`」方式が逆の性質になります。ただし、行の途中でのEnterで上の行が新IDになるので、現行に近いのは添付案のほうです。

## 3. 変更範囲

### 追加

- `frontend/src/lib/models/lineId.ts`(純関数。`lineIdAt`と`HEAD`のみ)
- `frontend/src/lib/models/lineId.test.ts`

### 削除

**サーバー**
- `internal/serve/line_watch.go`と`line_watch_test.go`
- `internal/serve/line_assign.go`と`line_assign_test.go`
- `ydoc.go`:`OnLoadDocument`内の`lineWatcherInstance.observe`、`forgetRoom`内の`lineWatcherInstance.forget`、`store()`内の古いTODOコメント(`card_lines`、`lines.go`への言及)
- `link_cleanup.go`:`markLinesDeleted`の呼び出しと、それに関するコメント
- `internal/replica/replica.go`:`card_lines`の行(pullルートとrealtimeチャネルは自動的に消えます)

**フロントエンド**
- `lib/dexie/cardLinesCollection.ts`
- `lib/models/cardLine.ts`
- `lib/dexie/dataReplicas.ts`:`tableReplica("card_lines", ...)`
- `lib/dexie/db.ts`:`card_lines`テーブルと型。`version(4).stores({ card_lines: null })`で既存ブラウザのテーブルを削除します。
- `noteEditor/index.tsx`:`lineEntries`(`createLiveQuery`と`readLineEntries`)、`setTelomere`に渡す`lineIds`

**DB・ドキュメント**
- PocketBase WEB UIで`card_lines`を削除し、`make migrate-collections`でスナップショットを再生成します。バックフィルは不要です(後方互換不要で、永続的な消費者もありません)。
- `docs/`内の`card_lines`と行IDに関する記述を更新し、`docs/architecture/line-id.md`を新設します(§2の仕様と制約を記載)。

### 変更

- `telomere.ts`:`TelomereData`から`lineIds`を除き、`telomere(ytext)`のファクトリにして、`lineMarker`内で`lineIdAt(ytext, line.from)`を呼びます。
  - `yCollab`は`telomere`より前に並んでいるため、ytextの更新が先に走ります。念のため`ytext.length !== state.doc.length`ならIDを出さないガードを入れ、実編集で確認します。
- `telomereStore.ts`のダミーデータ(行番号キー)は今回触りません。履歴を実装する際に`Record<LineId, TelomereEntry>`へ移行します。

## 4. 作業順序

各段階で`make test`と`make lint`が通る状態を保ちます。

1. **`lineId.ts`とテストを追加します**(既存コードに影響なし)。テストはDOM不要で、`Y.Doc`だけで書けます。
   - 先頭行は`HEAD`です。
   - 行内編集ではIDが不変です。
   - 行の途中でEnterすると、前半は元のID、後半は新IDになります。
   - 行頭の改行を削除して結合すると、上の行のIDが残ります。
   - 2つの`Y.Doc`を`applyUpdate`で同期した場合の同時編集と、リモート編集を検証します。
   - Undoでは新IDになることを仕様として固定します。
   - 末尾改行と空文書を検証します。
2. **telomereをYjs由来のIDに切り替えます**(フロントのみ。サーバー実装と一時的に併存します)。ツールチップでIDが入力中も行に追従することを手動確認します。
3. **フロントのレプリカ関連を削除します**(§3の削除項目とDexie version 4)。
4. **サーバー側を削除します**(§3の削除項目)。同一パッケージ内のテストヘルパー(`ids`、`entries`、`counter`など)は削除するテストファイルにしか使われていないことを確認します。
5. **PocketBaseのコレクションを削除し、スナップショットを再生成します。** フロントとサーバーは同時にデプロイします(旧フロントが`card_lines`をpullして404になるため)。
6. **ドキュメントを更新します。**

## 5. 以下すべてOK

1. **サーバー側で行IDが必要になる予定はない** 行パーマリンク(テーマに`--line-permalink-color`があります)や通知などです。その場合、サーバーのygo(`crdt`)で同じItem IDを取れるか確認が必要です。取れない場合も、サーバー側で必要になった時点で別途設計できます。現状の消費者はクライアントのみなので、今回の前提としては問題ありません。
2. **インポートの上書き(`replaceContent`)は全行が新IDになります。** 全削除→全挿入のためです。ルート単位の再インポートでは履歴が消える、という仕様で問題ないか確認させてください。`rename_links`は該当リンク内だけを編集するので、他の行のIDは保たれます。
3. **Undoで行IDが変わる件は許容でよい** 将来、履歴をY.Mapに持たせる段階で再検討できます。

