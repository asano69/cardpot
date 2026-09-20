# `internal/notation` → `internal/parser`（goldmark v2 ベース）移行計画

## 0. 現状の整理

- `internal/notation/bracket.go` の `DecideBracketKind` は純粋関数で、frontend の `rules/bracket.ts` の `decideBracketNodeType` と1:1対応しており、テストも揃っている。これは**壊さず流用する**。
- `internal/notation/wikilink.go` の `ExtractWikiLinkTitles` は手書きのバイトスキャナで、`parseInline` の優先順位配列を模してはいるが実体は「AST を作らない再帰下降スキャン」。すでにコード中に "Known divergence: label of labelled external link not scanned" と明記されている通り、frontend の Lezer パーサに追随しきれていない。
- 新しい記法（Helpfeel、CommandLine、Decoration の組み合わせなど）を足すたびに、この場当たり的なスキャナを個別に拡張し続けるのは frontend がすでに卒業した段階（`docs/parser/plan.md` 参照）であり、backend も同じ理由で real parser に乗り換るべき。

## 1. goldmark v2 を選ぶ理由

- `BlockParser`（`Trigger/Open/Continue/Close`）と `InlineParser`（`Trigger/Parse`）は、frontend がすでに使っている `@lezer/markdown` の `parseBlock`/`parseInline` 配列とほぼ同じ設計（「配列内の順序＝優先順位」「先勝ち」）なので、frontend の rules を1ファイルずつ移植しやすい。
- `parser.New(parser.WithDefaultParsers(false), ...)` で CommonMark の既定パーサを丸ごと外せるので、frontend の `index.ts` がやっている「`@lezer/markdown` の grammar だけ全部 `remove` して自前の grammar を差し込む」戦略をそのまま踏襲できる。
- 実 AST（`ast.Node` / `ast.Walk`）が手に入るので、wikilink 抽出が「手書き再帰スキャン」から「AST 走査」に変わり、将来の記法追加が構造的に安全になる。
- 将来的に CommonMark の部分対応をしたくなった時、goldmark 本体の CommonMark extension を後から追加登録するだけで済む（今回のスコープ外だが、フレームワーク選定の理由としては効いている）。

## 2. 設計方針

1. `internal/parser` は frontend の `parser/cardpot/` と同じ構成でファイルを分ける（`rules/bracket.ts` ↔ `bracket.go` のように）。両者は今後も lockstep を要求されるので、対応が一目で分かる状態を保つ。
2. `DecideBracketKind` はロジックを書き直さず、**そのまま internal/parser に持ってくる**。新しい bracket 用 InlineParser の仕事は「深さを数えて対応する `]` を見つける」「見つけた content 文字列を `DecideBracketKind` に渡す」「結果に応じた AST ノードを作る」の3つだけにする。
3. タイトル行（1行目）は今まで通りパーサに渡さない。呼び出し側で先頭行を切り落としてから `internal/parser` に渡す（現行の `ExtractWikiLinkTitles` の `if i == 0 { continue }` と同じ扱い）。
4. インデント定義（ECMAScript `\s+` 1文字＝1レベル）は `internal/notation/wikilink.go` の `isJSSpace`/`measureIndent` をそのまま移設して使う。frontend/backend 双方で「1箇所に定義し、変更したら両方直す」という既存の `internal/slug` と同じ規約を維持する。

## 3. フェーズ

### Phase 0 — 依存追加とスケルトン（挙動は変えない）
- `go.mod` に `github.com/yuin/goldmark/v2` を追加。
- `internal/parser` を新設し、`parser.New(parser.WithDefaultParsers(false))` 相当の骨組みだけ置く。まだどこからも呼ばれない。
- 空の block/inline 設定でも `""` や `"a\nb"` がクラッシュせず Document を返すことだけを確認する最小テストを書く。
- **DoD**: ビルド・テストは通るが、`internal/wikilink` は依然として `internal/notation` を使っている。

### Phase 1 — ブロックレベル: Line / CodeBlock / Table / Quote
- goldmark 既定の Paragraph は複数行を1つに結合する（CommonMark 仕様）ため、frontend の「1行＝1ブロック」原則に反する。まず `Line` BlockParser を実装し、非空白行1行につき1ノードを作る（`Open` で即 `Close` する形）。
- `CodeBlock`：`code:` prefix + 宣言行より深いインデントが続く間継続、という既存ロジック（`internal/notation/wikilink.go` の code-block tracking）を `BlockParser.Continue` に移植。中身は raw text のまま保持し、inline パースしない。
- `Table`：`table:` prefix + 同様のインデント継続。タブでセル分割し、このフェーズではセルは raw text のまま（inline 委譲は Phase 2）。
- `Quote`：`>` prefix。残りは Phase 2 で inline パースに委譲。
- **DoD**: `internal/notation/wikilink_test.go` の "code block until indent returns" / "table cells" / "quote" 相当のケースが、正しいブロック構造（ノード種別の並び）としてテストできること。まだ WikiLink 抽出はしない。

### Phase 2 — インラインレベル: InlineCode / Bracket dispatcher / Decoration / Strong / Blank
- `InlineCode`（backtick span）を、中身を再帰パースしない葉ノードとして実装する。「インラインコードの中は無視する」の要になる部分。
- Bracket dispatcher：`internal/notation/wikilink.go` の `matchingBracket`（深さカウントで対応する `]` を探す処理）を移植 → content を `DecideBracketKind`（流用）で分類 → 種別ごとに AST ノードを生成。`WikiLink` の中身は frontend 仕様通り再帰パースしない。
- `Decoration`（`[* text]` 等）：前置文字を読み、残りを再帰的に inline パースして子にする（既存の `sc.decoration` ロジックを踏襲）。
- `Strong`（`[[...]]`）：中身が Image/Icon なら葉ノード、それ以外は再帰 inline パース。
- `Blank`（`[ ]`）：中身が空白のみの角括弧。
- **DoD**: `internal/notation/wikilink_test.go` の全ケースを `internal/parser` 版で再実行し、期待する AST 構造（ノード種別の並び）が一致すること。特に "nested brackets"（`"[a [b] c] [unterminated [page]"`）のようなネストケースを落とさないこと。

### Phase 3 — WikiLink 抽出関数の実装と切り替え
- `internal/parser.ExtractWikiLinkTitles(text string) []string` を `ast.Walk` で `WikiLink` ノードを集める形で実装する。
- `internal/wikilink/wikilink.go` の `Sync` を `notation.ExtractWikiLinkTitles` → `parser.ExtractWikiLinkTitles` に差し替える。呼び出しシグネチャは変えないので `internal/wikilink/wikilink_test.go` は無修正で通る想定。
- `internal/notation/wikilink_test.go` のケース一式を `internal/parser` 側のテストとして丸ごと移植する（回帰の唯一のオラクルとして使い切ったら元は削除）。
- **DoD**: `internal/wikilink` のテストが全て通り、`notation.ExtractWikiLinkTitles` の呼び出し箇所がゼロになる。

### Phase 4 — `internal/notation` の縮小・削除
- `DecideBracketKind` と付随する正規表現・`inferURL` を物理的に `internal/parser` 配下へ移す（この時点で `internal/notation` を独立パッケージとして残す理由がなくなる）。
- `internal/notation/bracket_test.go` のケースを `internal/parser` 側に移植。
- `internal/notation` パッケージを削除する。
- **DoD**: `grep -r "internal/notation"` がヒットしない。

### Phase 5（将来・今回のスコープ外）— 記法拡充とMarkdown部分対応
- `HashTag`/`Helpfeel`/`CommandLine`/`NumberList`/`GoogleMap` などを、frontend の `docs/parser/plan.md` のフェーズ表に合わせて backend にも追加していく。
- 標準 Markdown 記法を部分的に有効化したくなった時点で、goldmark 本体の CommonMark extension を `internal/parser` の block/inline 登録に追加する形で導入する。Cardpot 独自記法との優先順位（登録順）は、その時点で frontend 側の対応方針と揃える。

## 4. リスク・注意点

- **インデント定義の二重管理**：ECMAScript `\s+` 1文字＝1レベルという定義は frontend/backend 双方に存在する（`internal/slug` と同じ lockstep 規約）。どちらかを変えたら両方直す。
- **goldmark の `Continue`/`Close` のタイミング検証**：cosy の `parse_block`（1行ずつ前進し、インデントが浅くなったら終了）モデルと goldmark の `BlockParser.Continue` の呼ばれ方が本当に素直に対応するかは Phase 1 の早い段階で実地検証すること。相性が悪ければ、行ごとに前処理してから `ASTTransformer` で組み立てる代替案も検討する。
- **`DecideBracketKind` を純粋関数のまま保つ**：goldmark 固有の型（`ast.Node` 等）に依存させない。テスト容易性と frontend との対応関係を保つため。
