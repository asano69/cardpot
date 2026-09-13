import { parser } from "./bracket.grammar";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

// Maps grammar node names to highlight tags. Bracket itself has no
// fixed style -- its depth-dependent styling is applied separately
// (see bracketDepthStyle.ts), not via static tag mapping here.
const highlighting = styleTags({
  BoldMarker: t.strong,
  ItalicMarker: t.emphasis,
});

export const bracketLanguage = LRLanguage.define({
  parser,
  languageData: { commentTokens: {} },
});

export function bracketSyntax(): LanguageSupport {
  return new LanguageSupport(bracketLanguage);
}
