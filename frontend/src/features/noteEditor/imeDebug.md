# CodeMirror IME input debugging

## 有効化

dev ビルドでは常に有効です。本番では、ブラウザコンソールで次を実行してからリロードします。

```js
localStorage.setItem("imeDebug", "1")
```

ログはすべて `[ime-debug] #<エディタ番号> <時刻>ms ...` の形式で出ます。

## 何を監視するか

| ログ | 見分けたいこと |
| --- | --- |
| `switch key` と直後3回の `key after switch` | 変換キー(`Convert`)をブラウザが受け取ったか。IME ON になっていれば次のキーは `key: "Process"`(keyCode 229)で届く。普通の英字のまま届くなら、CodeMirror より下の層(OS / IME)で ON になっていない。 |
| `created` / `destroyed` | エディタの寿命。`destroyed during composition` が出れば候補1(変換中の作り直し)が確定する。 |
| `compositionstart/update/end`、`beforeinput` | CodeMirror が IME をどう認識しているか。`viewComposing` と、DOM イベントから自前で追った `trackedComposing` の食い違いも出す。 |
| `update during composition` | 変換中の更新ごとの `userEvent` と `effects` 数。`setTelomere` などの effect-only dispatch(候補3)や、`trailingBlankLine` の追加変更(候補2)を拾う。 |
| `DOM mutation during composition` | 変換中に DOM から追加・削除されたノード数と対象要素(候補2)。 |
| `focus` / `blur` | フォーカスの移動先(`movedTo`)、ウィンドウのフォーカス、`document.activeElement`。 |
| `composition did not end` | 変換が 10 秒終わらない状態。 |

## バグが出たときの見方

1. 変換キーを押した後の `key after switch` が `Process` なら IME は ON で、CodeMirror 側の状態(`viewComposing`、フォーカス)を疑います。
2. 英字のままなら、ブラウザの入力コンテキストが壊れています。直前の `destroyed during composition` や `DOM mutation during composition` を遡ります。

候補1(2 秒デバウンスでの `createCard`)は、`created` / `destroyed` のログと変換中だったかの警告で判定できます。デバウンスのタイミング自体は記録していません。

注意点が1つあります。`DOM mutation during composition` は、CodeMirror が変換中の文字を更新するときの通常の変更も拾うので、少しうるさいです。見るのは `removed` が 0 でない行と、`targets` に `cm-line` 以外が出るものです。
