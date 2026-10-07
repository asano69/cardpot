# 行ID

カード本文の各行を識別するIDを、Yjs（`Y.Text`）自身が持つ文字IDから導出する仕組みの設計。

## 1. 要点

- 行IDは**その行の直前の `\n` 文字のYjs ID**（`client:clock`）。先頭行だけは直前の改行がないので、固定のセンチネル `"head"` を使う。
- IDはCRDTのIDなので、全クライアントで同一、編集に対して安定、オフラインでも成立する。サーバーは関与しない。
- 実装は `frontend/src/lib/models/lineId.ts` の純関数 `lineIdAt(ytext, lineStart)` だけ。`lineStart` には CodeMirror の `line.from` をそのまま渡す（y-codemirror.next が CodeMirror の位置と `Y.Text` のindexを一致させている）。
- 保存・複製するものはない。DB、Dexie、realtime のどこにも行IDのコレクションは存在しない。

## 2. 操作ごとの結果

| 操作 | 結果 |
| --- | --- |
| 行内の文字編集 | IDは変わらない |
| 行の途中で Enter | 前半は元のIDを維持し、後半が新しい `\n` のIDを得る |
| 行頭で Enter | 上に挿入された空行が元のIDを保ち、元の内容の行は新しいIDになる |
| 行の結合（行頭の改行を削除） | 後ろの行のIDが消え、前の行のIDが残る |
| 同時編集 | どのクライアントでも同じIDになる |
| Undo | 復元された改行は新しい文字なので、**新しいID**になる |
| 本文の全置換（インポートの上書き） | **全行が新しいID**になる |
| カット&ペースト、行の置換 | 新しいIDになる |

`rename_links` は該当リンクの中だけを編集するので、他の行のIDは保たれる。

## 3. 制約

- **Undoで行IDが変わる。** 将来、行ごとの履歴を `Y.Map` に持たせる場合、Undoでその行の履歴が切れる。許容する前提とし、必要になった時点で再検討する。
- **行頭でのEnterは、元の内容の行が新IDになる。** 「直後の `\n` のID」方式なら逆になるが、その場合は行の途中でのEnterで上の行が新IDになる。行の途中でのEnterを自然な挙動とみなし、現方式を採用した。
- **サーバー側では使えない。** 現状の消費者はクライアントだけ。行パーマリンクや通知などでサーバーが行IDを必要とする場合は、サーバーのygo（`crdt`）で同じItem IDを取れるか確認する。取れなければ、その時点で別途設計する。
- **計算量は定数ではない。** `createRelativePositionFromTypeIndex` はItemの連結リストを辿るので、O(Item数)。連続入力はItemにまとまるため通常は小さい。呼び出し側は表示中の行だけを計算する。遅ければキャッシュを検討する。
- **ytextとCodeMirrorの文書が一時的にずれることがある。** `lineIdAt` は対応する文字がなければ `null` を返す。呼び出し側（`telomere.ts`）は `ytext.length !== state.doc.length` のときIDを出さない。

## 4. 使われ方

- `plugins/decorations/telomere.ts`：ガターのツールチップに行IDを表示する。`telomere(ytext)` が `lineMarker` 内で `lineIdAt` を呼ぶ。
- `lib/stores/telomereStore.ts`：現在はダミーデータで、行番号をキーにしている。履歴を実装する際に、キーを `LineId` に移す。

## 5. 以前の方式（廃止）

サーバーが本文を300msデバウンスで監視し、行のハッシュのLCSでIDを推測して `card_lines` コレクションに保存し、pull/realtimeでDexieに複製していた。IDがテキストに遅れること、クライアント間で結果が一致する保証がないこと、ドラフトにIDがないこと、用途に対して仕組みが大きすぎることから廃止した。`card_lines` コレクション、`line_watch.go`、`line_assign.go`、`cardLinesCollection.ts` はすべて削除済み。

## 6. 変更時のチェックリスト

- 行IDの規則を変える：`lineId.test.ts` にケースを足してから `lineId.ts` を変更する。
- 行IDをDBやDexieに保存しない。保存すると、サーバーのミラーとクライアントの導出値が二重になり、以前の問題が再発する。
- サーバーで行IDが必要になったら、まず本書の §3 の確認から始める。
