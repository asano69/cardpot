# IME 変換中に装飾を作り直すと、入力中のテキストが消える

## 症状

- テキストを選択して `` ` `` を入力すると、選択範囲がインラインコードで囲まれる。
- その状態で日本語 IME に切り替え、全角文字を入力した瞬間、囲んだ中身が消える。

## 原因

`syntaxReveal.ts` は、更新のたびに `Decoration.replace` でマーク（`` ` ``）を隠す装飾を作り直していた。

1. `` ` `` でラップした直後、キャレットは閉じ側の `` ` `` の直後（ノード末尾）にある。この位置は「触れている」扱いなので、マークは表示されたまま。
2. 全角入力の変換が始まると、未確定文字が文書に反映され、キャレットがノードの外へ進む。「触れていない」に変わり、`hiddenMark`（replace）が作り直される。
3. ブラウザが変換中の DOM の隣で、CodeMirror が DOM を差し替える。変換が中断され、周辺のテキストが失われる。

原因は「IME の変換中に、インライン DOM を差し替える装飾を作り直したこと」。
なお 3 の細かい経路は推測で、DOM 差し替えとテキスト消失の対応は確認していない。修正で症状が消えたことだけを確認済み。

## 対策

変換中は装飾を作り直さず、`map` で位置だけ追従させる。変換が終わったら作り直す。

- 判断ロジックを純粋関数 `stepDecorations` に切り出した（`plugins/decorations/decorationPlugin.ts`）。
- `decorationPlugin` が `ViewPlugin` の定型部分を引き受ける。各プラグインは `build`（装飾の生成）と `shouldRebuild`（再構築の条件）を渡すだけ。
- `compositionend` の後に空の dispatch を 1 回行う。変換確定後に別の更新が来なくても、保留した再構築が実行される。
- 純粋関数のテストは `decorationPlugin.test.ts`。

| プラグイン | 対応 | 理由 |
| --- | --- | --- |
| `syntaxReveal` | 適用 | `Decoration.replace` を作り直す（今回の原因） |
| `imageWidget` | 適用 | `Decoration.replace` を作り直す。`touching` 判定が同じ |
| `hangingIndent` | 適用 | インデント文字を `Decoration.replace` で置換する |
| `wordBreak` | 適用 | `mark` だが、1 打鍵ごとに変換中の語を別の `<span>` で包み直す |
| `codeBlockLines` | 不要 | 行要素の属性を変えるだけで、インライン DOM に触れない |
| `titleLineHighlight` | 不要 | 同上 |

## 教訓とルール

- **`Decoration.replace` と `Decoration.mark` は、IME の変換中に作り直してはいけない。** 特に、カーソル位置に応じて出し入れする装飾（`syntaxReveal` や `imageWidget`）が危険。
- 新しい装飾プラグインを足すときは、素の `ViewPlugin` ではなく `decorationPlugin` を使う。
- 行全体への `Decoration.line`（クラスや属性の付与）は、インライン DOM に触れないため対象外。
- ロジックは純粋関数に切り出す。jsdom では IME の composition を再現できないため、「変換中は作り直さない」という判断だけをテストで固定する。

## 検証

自動テストでは IME の実挙動を再現できないため、次の手動確認を行う。

1. テキストを選択して `` ` `` を押し、そのまま IME で全角文字を入力する。中身が消えないこと。
2. `[* 語]` の中で変換する。
3. 画像 `[url]` の隣で変換する。

1 は修正前に再現し、修正後に解消したことを確認済み。2 と 3、および `imageWidget`・`hangingIndent`・`wordBreak` へのガード適用は、同種の構造からの予防的な対応で、実際の再現は確認していない。

## 関連ファイル

- `frontend/src/features/noteEditor/plugins/decorations/decorationPlugin.ts`
- `frontend/src/features/noteEditor/plugins/decorations/decorationPlugin.test.ts`
- `frontend/src/features/noteEditor/plugins/decorations/syntaxReveal.ts`
- `frontend/src/features/noteEditor/plugins/decorations/imageWidget.ts`
- `frontend/src/features/noteEditor/plugins/decorations/hangingIndent.ts`
- `frontend/src/features/noteEditor/plugins/decorations/wordBreak.ts`
