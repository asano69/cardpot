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


## OS 側の IME が ON になっているのに、エディタの入力コンテキストだけ OFF のままになっている

変換キーが届かないのは関係なく、問題は変換キーを押した後の状態にあります。

## 考えられる仕組み

IME の ON/OFF は、フォーカス中の編集要素ごとの入力コンテキストが持っています。ブラウザは、その要素の DOM やフォーカス、選択範囲が外から変わったときに、このコンテキストを作り直すことがあります。作り直された後は、OS の IME 状態とブラウザ側の状態がずれます。

IME が ON なのに変換中ではない待機状態では、`decorationPlugin` の IME ガードが効きません。ガードは `view.composing` のときだけ働くためです。ずれる原因としては、次の3つが怪しいです。

1. **5秒ごとの dispatch。** `startTelomereClock` が `telomereNow` を更新するたびに、`setTelomere` の effect が dispatch されます。キャレットのある行のガターが書き換わるので、Firefox や ibus では入力コンテキストがリセットされる可能性があります。「たまに起きる」という頻度にも合います。
2. **キャレット位置の DOM 書き換え。** `syntaxReveal` や `hangingIndent` が、カーソル移動のたびに `Decoration.replace` の widget を作り直します。widget は `contentEditable=false` で、キャレットに隣接します。
3. **フォーカスの再設定。** `setTimeout(() => view.focus(), 0)` や、ドラフトからカードへのエディタ作り直しです。

## 切り分け(コード変更が小さい順)

1. **時計を止める。** `index.tsx` の `onCleanup(startTelomereClock());` を一時的にコメントアウトして、しばらく使います。症状が消えれば原因は1です。
2. **復旧方法を確認する。** 症状が出たときに、一度エディタの外をクリックしてから戻します。それで直るなら、コンテキストの再作成の問題だと確定します。
3. **症状が出た瞬間のログを見る。** 次のパッチで、変換中でなくても、フォーカス中の dispatch と DOM 変更を記録します。症状が出る直前に何が起きたかが分かります。
4. **届くキーを確認する。** OS の IME は ON なのに、エディタで英字が `key: "a"`、`isComposing: false` のまま届き、`compositionstart` も出なければ、ずれていると確定します。

```
frontend/src/features/noteEditor/imeDebug.ts
<<<<<<< SEARCH
    if (!update.view.composing && !this.composing) return;
    this.log("update during composition", {
=======
    // Also logged while idle with focus: an update at the caret can reset
    // the browser's IME state without any composition being active.
    if (!update.view.hasFocus && !this.composing) return;
    this.log("update during composition", {
>>>>>>> REPLACE
```

```
frontend/src/features/noteEditor/imeDebug.ts
<<<<<<< SEARCH
    if (!this.composing && !this.view.composing) return;
    let added = 0;
=======
    // Same reason as in update(): idle DOM rewrites matter too.
    if (!this.view.hasFocus && !this.composing) return;
    let added = 0;
>>>>>>> REPLACE
```

ログの文言は「during composition」のままですが、フォーカス中のものはすべて出ます。打鍵のたびに出るので、症状が出た時刻の直前だけを見てください。

## 結果の見方

症状が出た直前に `setTelomere` だけの update(`docChanged: false`、`effects: 1`)や、キャレット行の DOM 変更があれば、それが原因候補です。その場合の対策は、キャレットのある行の更新を避けるか、時計の更新頻度を下げるかのどちらかです。何も出ずに起きるなら、フォーカスやエディタの作り直しの問題として `created` / `destroyed` を遡ります。

1 と 2 の結果を教えてください。
