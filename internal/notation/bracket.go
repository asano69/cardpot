// Package notation classifies fragments of Cardpot's Scrapbox-compatible
// note syntax -- currently just bracket content (see BracketKind and
// DecideBracketKind below). This is deliberately NOT a parser: it takes
// already-delimited text (e.g. the content between a matched "[" and "]")
// and returns what kind of notation it represents, the same judgment
// frontend/src/features/noteEditor/parser/cardpot/rules/bracket.ts makes
// via decideBracketNodeType. Both implementations must stay in lockstep;
// add a test here whenever bracket.ts's test suite gains one, and vice
// versa (see internal/slug's own comment for this same pattern).

// decideBracketNodeTypeのGo名はDecideBracketKindのように、値の意味を表す語（Kind）にしておくと、後続処理（WikiLink抽出、装飾剥がし）がswitch kind { case WikiLink: ... }のように自然に書けます。
package notation
