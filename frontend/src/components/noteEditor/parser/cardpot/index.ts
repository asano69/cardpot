// Cardpot syntax is parsed by @lezer/markdown's line-oriented block
// pipeline. Its CommonMark parsers are all removed below: we retain only the
// incremental block/inline infrastructure and install Cardpot's own grammar.
import {
  Language,
  LanguageSupport,
  defineLanguageFacet,
} from "@codemirror/language";
import { NodeType } from "@lezer/common";
import { parser } from "@lezer/markdown";

import { isMark, revealStyle } from "./nodeProps";
import { parseBold } from "./rules/bold";
import { parseFencedCode } from "./rules/fencedCode";
import { parseInlineCode } from "./rules/inlineCode";
import { parseWikiLink } from "./rules/wikiLink";

export { isMark, revealStyle };

const defaultParsers = [
  "LinkReference",
  "IndentedCode",
  "FencedCode",
  "Blockquote",
  "HorizontalRule",
  "BulletList",
  "OrderedList",
  "ATXHeading",
  "HTMLBlock",
  "SetextHeading",
  "Escape",
  "Entity",
  "InlineCode",
  "HTMLTag",
  "Emphasis",
  "HardBreak",
  "Link",
  "Image",
] as const;

// `Paragraph` deliberately remains. It is the neutral leaf block provided by
// the markdown infrastructure and is where Cardpot's inline parsers run.
const cardpotParser = parser.configure({
  remove: defaultParsers,
  defineNodes: [
    { name: "FencedCode", block: true },
    "FencedCodeMark",
    "Bold",
    "BoldMark",
    "Code",
    "CodeMark",
    "WikiLink",
    "WikiLinkMark",
  ],
  props: [
    revealStyle.add({
      Bold: "cm-bold",
      Code: "cm-inline-code",
      WikiLink: "cm-wikilink",
    }),
    isMark.add({ BoldMark: true, CodeMark: true, WikiLinkMark: true }),
  ],
  parseBlock: [{ name: "CardpotFencedCode", parse: parseFencedCode }],
  parseInline: [
    { name: "CardpotBold", parse: parseBold },
    { name: "CardpotWikiLink", parse: parseWikiLink },
    { name: "CardpotInlineCode", parse: parseInlineCode },
  ],
});

function node(name: string): NodeType {
  const type = cardpotParser.nodeSet.types.find(
    (candidate) => candidate.name === name,
  );
  if (!type) throw new Error(`Cardpot parser is missing its ${name} node type`);
  return type;
}

// Export the exact node identities used by the configured parser. Consumers
// compare these by identity when decorating or navigating syntax nodes.
export const Bold = node("Bold");
export const BoldMark = node("BoldMark");
export const Code = node("Code");
export const CodeMark = node("CodeMark");
export const WikiLink = node("WikiLink");
export const WikiLinkMark = node("WikiLinkMark");
export const FencedCode = node("FencedCode");
export const FencedCodeMark = node("FencedCodeMark");

const cardpotLanguageData = defineLanguageFacet({});

export const cardpotSyntaxLanguage = new Language(
  cardpotLanguageData,
  cardpotParser,
  [],
  "cardpot",
);

export function cardpotSyntax(): LanguageSupport {
  return new LanguageSupport(cardpotSyntaxLanguage);
}
