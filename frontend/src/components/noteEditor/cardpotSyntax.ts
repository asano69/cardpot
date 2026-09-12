import { parser } from "@lezer/markdown";
import {
  Language,
  defineLanguageFacet,
  LanguageSupport,
} from "@codemirror/language";
import { cardpotBracketSyntax } from "./brackets/bracketInlineParser";
import { cardpotTagSyntax } from "./tags/tagInlineParser";
// Built on @lezer/markdown's CommonMark grammar, but most of
// CommonMark is stripped out (see disabledForNow below) and Cardpot's
// own bracket notations are the primary thing this actually parses.
// Named for what it does (Cardpot's own inline syntax), not for the
// library it happens to be built on.
const disabledForNow = [
  "ATXHeading1",
  "ATXHeading2",
  "ATXHeading3",
  "ATXHeading4",
  "ATXHeading5",
  "ATXHeading6",
  "SetextHeading1",
  "SetextHeading2",
  "Blockquote",
  "HorizontalRule",
  "BulletList",
  "OrderedList",
  "FencedCode",
  "CodeBlock",
  "HTMLBlock",
  "CommentBlock",
  "ProcessingInstructionBlock",
  "LinkReference",
];

const extendedParser = parser.configure([
  { remove: disabledForNow },
  cardpotBracketSyntax,
  cardpotTagSyntax,
]);

// @lezer/markdown's parser is a MarkdownParser, not an LRParser, so
// LRLanguage.define (which assumes an LRParser) silently produced a
// broken parser object here -- CodeMirror's own language-data lookup
// (used by closeBrackets' insertBracket) then crashed with
// "this.parser.hasWrappers is not a function". The plain Language
// class works with any @lezer/common Parser, including MarkdownParser,
// so it's the correct wrapper for this grammar.
const cardpotLanguageData = defineLanguageFacet({ commentTokens: {} });

export const cardpotSyntaxLanguage = new Language(
  cardpotLanguageData,
  extendedParser,
  [],
  "cardpot",
);

export function cardpotSyntax(): LanguageSupport {
  return new LanguageSupport(cardpotSyntaxLanguage);
}
