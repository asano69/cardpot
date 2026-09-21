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

import { codeLanguageWrap } from "./codeLanguages";
import { hideContent, isIndent, isMark, revealStyle } from "./nodeProps";
import { parseBlank } from "./rules/blank";
import { parseBracket } from "./rules/bracket";
import { parseDecoration } from "./rules/decoration";
import { parseCodeBlock } from "./rules/codeBlock";
import { parseHashTag } from "./rules/hashTag";
import { parseInlineCode } from "./rules/inlineCode";
import { startsIndentedBlock } from "./rules/indentedBlock";
import { parseParagraph } from "./rules/paragraph";
import { parseQuote } from "./rules/quote";
import { parseTable } from "./rules/table";
import { parseTitle } from "./rules/title";

export { hideContent, isIndent, isMark, revealStyle };

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
    { name: "Title", block: true },
    { name: "CodeBlock", block: true },
    "CodeBlockMark",
    { name: "Table", block: true },
    "TableMark",
    { name: "TableRow", block: true },
    "TableCell",
    { name: "Quote", block: true },
    "QuoteMark",
    "Bold",
    "BoldMark",
    "Italic",
    "ItalicMark",
    "Code",
    "CodeMark",
    "WikiLink",
    "WikiLinkMark",
    "ExternalLink",
    "ExternalLinkMark",
    "Image",
    "LinkedImage",
    "Icon",
    "ProjectLink",
    "ProjectLinkMark",
    "GoogleMap",
    "Math",
    "Strong",
    "StrongMark",
    "StrongImage",
    "StrongIcon",
    "HashTag",
    "Blank",
    "Indent",
  ],
  props: [
    revealStyle.add({
      // Rendered as a <strong> element with a level class (see
      // syntaxReveal.ts), so this class only marks the node as revealable.
      Bold: "cm-strong",
      Italic: "cm-italic",
      Code: "cm-inline-code",
      WikiLink: "cm-wikilink",
      ExternalLink: "cm-wikilink",
      ProjectLink: "cm-wikilink",
      Strong: "cm-bold",
      HashTag: "cm-hashtag",
      Blank: "cm-blank",
      // Whole-line node, not a delimiter pair: only the leading ">"
      // is an isMark child (see rules/quote.ts), so syntaxReveal
      // hides just that prefix while the cursor is elsewhere on the
      // line -- the same live-preview behavior as every other
      // revealable node here.
      Quote: "cm-quote",
      // Image/LinkedImage have no mark children of their own (see
      // rules/bracket.ts), so this class only ever shows while the
      // cursor is actively editing the raw "[url]" text -- see the
      // hideContent registration below for what happens otherwise.
      Image: "cm-image-syntax",
      LinkedImage: "cm-image-syntax",
    }),
    isMark.add({
      BoldMark: true,
      ItalicMark: true,
      CodeMark: true,
      WikiLinkMark: true,
      ExternalLinkMark: true,
      ProjectLinkMark: true,
      StrongMark: true,
      QuoteMark: true,
    }),
    isIndent.add({
      Indent: true,
    }),
    // Image/LinkedImage's raw bracketed URL is only shown while the
    // cursor touches it; otherwise it's hidden entirely, since the
    // actual image is already rendered as a widget (see
    // imageWidget.ts) and the raw text would just be noise.
    hideContent.add({
      Image: true,
      LinkedImage: true,
    }),
  ],
  parseBlock: [
    // Must stay first: the title line is plain text, so no other block rule
    // may see it (see rules/title.ts).
    { name: "CardpotTitle", parse: parseTitle },
    {
      name: "CardpotCodeBlock",
      parse: parseCodeBlock,
      endLeaf: (_, line) => startsIndentedBlock(line, "code:") !== null,
    },
    {
      name: "CardpotTable",
      parse: parseTable,
      endLeaf: (_, line) => startsIndentedBlock(line, "table:") !== null,
    },
    { name: "CardpotQuote", parse: parseQuote },
    { name: "CardpotParagraph", parse: parseParagraph },
  ],
  parseInline: [
    { name: "CardpotDecoration", parse: parseDecoration },
    { name: "CardpotBlank", parse: parseBlank },
    { name: "CardpotBracket", parse: parseBracket },
    { name: "CardpotInlineCode", parse: parseInlineCode },
    { name: "CardpotHashTag", parse: parseHashTag },
  ],
  // Nests a `code:` block's content in whatever language its metadata
  // (e.g. "code:ts") resolves to, loaded on demand -- see
  // codeLanguages.ts.
  wrap: codeLanguageWrap,
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
export const Italic = node("Italic");
export const ItalicMark = node("ItalicMark");
export const Code = node("Code");
export const CodeMark = node("CodeMark");
export const WikiLink = node("WikiLink");
export const WikiLinkMark = node("WikiLinkMark");
export const ExternalLink = node("ExternalLink");
export const ExternalLinkMark = node("ExternalLinkMark");
export const Image = node("Image");
export const LinkedImage = node("LinkedImage");
export const Icon = node("Icon");
export const ProjectLink = node("ProjectLink");
export const ProjectLinkMark = node("ProjectLinkMark");
export const GoogleMap = node("GoogleMap");
export const Math = node("Math");
export const Strong = node("Strong");
export const StrongMark = node("StrongMark");
export const StrongImage = node("StrongImage");
export const StrongIcon = node("StrongIcon");
export const HashTag = node("HashTag");
export const Blank = node("Blank");
export const CodeBlock = node("CodeBlock");
export const CodeBlockMark = node("CodeBlockMark");
export const Table = node("Table");
export const TableMark = node("TableMark");
export const TableRow = node("TableRow");
export const TableCell = node("TableCell");
export const Indent = node("Indent");
export const Title = node("Title");

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
