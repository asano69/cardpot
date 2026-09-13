// Cardpot's own inline syntax parser, built from scratch on
// @lezer/common's Parser/Tree primitives -- NOT @lezer/markdown. This
// intentionally does not reuse CommonMark's grammar: Cardpot's bracket
// notation ("[* bold text]", eventually wiki links, tags, icons, ...)
// is a different syntax entirely, and forcing it through a markdown
// grammar meant constantly subtracting CommonMark rules that were
// never wanted in the first place (see the old cardpotSyntax.ts's
// `disabledForNow` list, now deleted).
//
// Starting point: the single simplest rule, "[* text]" -> Bold.
// Future notations get added here the same way -- a new NodeType plus
// a scan function, wired into parseDocument.
//
// This parser ignores the `fragments` argument entirely and re-scans
// the whole document on every parse (see createParse below). That's a
// deliberate simplification for now, not a permanent constraint --
// Lezer's incremental reuse is a property of how `fragments` is
// consumed inside createParse, not of whether the parser was
// generated (lezer-generator) or hand-written. Cards are only a few
// hundred lines at most, so a full rescan on every keystroke is cheap
// enough to not matter yet. Revisit only if profiling shows otherwise.
import { NodeType, Parser, Tree } from "@lezer/common";
import type { Input, PartialParser, TreeFragment } from "@lezer/common";
import {
  Language,
  LanguageSupport,
  defineLanguageFacet,
} from "@codemirror/language";

// The tree's root node. `top: true` is required by Lezer for whatever
// node type createParse's Tree is rooted at.
export const Document = NodeType.define({ id: 0, name: "Document", top: true });

// "[* text]" as a whole, spanning from the opening "[" through the
// closing "]".
export const Bold = NodeType.define({ id: 1, name: "Bold" });

// One of Bold's two delimiters: the opening "[*" (2 chars) or the
// closing "]" (1 char). Not split into separate Open/Close node types
// -- callers that need to tell them apart use their position within
// Bold's children (first vs. last) instead, since nothing so far
// needs to style them differently.
export const BoldMark = NodeType.define({ id: 2, name: "BoldMark" });

// Matches "[* text]": no nested brackets, no newlines inside (bold
// never spans multiple lines). `text` may be empty ("[*]" still
// matches) -- an empty bold span is harmless and simpler to allow
// than to special-case out.
const BOLD_RE = /\[\*([^[\]\n]*)\]/g;

// Scans `text` for every BOLD_RE match and returns the resulting
// top-level nodes, in document order, as a Document tree. No nesting
// is attempted yet -- Bold is a leaf notation for now, so a "[*"
// inside another "[* ]" simply won't match (BOLD_RE's own
// [^[\]\n]* excludes brackets from the inner text).
function parseDocument(text: string): Tree {
  const children: Tree[] = [];
  const positions: number[] = [];

  BOLD_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = BOLD_RE.exec(text))) {
    const from = match.index;
    const length = match[0].length;

    // Bold's own two children are positioned relative to Bold's own
    // start (0), per Tree's constructor contract -- not absolute
    // document positions. The open mark is always 2 chars ("[*");
    // the close mark is always the last 1 char ("]").
    const openMark = new Tree(BoldMark, [], [], 2);
    const closeMark = new Tree(BoldMark, [], [], 1);
    const bold = new Tree(Bold, [openMark, closeMark], [0, length - 1], length);

    children.push(bold);
    positions.push(from); // absolute -- Document itself starts at 0
  }

  return new Tree(Document, children, positions, text.length);
}

// Non-incremental: every parse reads the whole document once and
// produces the whole tree in a single advance() call. See this file's
// own top comment for why fragments-based reuse is deferred rather
// than skipped for some structural reason.
class CardpotParser extends Parser {
  createParse(
    input: Input,
    _fragments: readonly TreeFragment[],
    _ranges: readonly { from: number; to: number }[],
  ): PartialParser {
    let done = false;
    const parse: PartialParser = {
      parsedPos: 0,
      advance() {
        if (done) return null;
        done = true;
        const tree = parseDocument(input.read(0, input.length));
        parse.parsedPos = input.length;
        return tree;
      },
      stopAt(_pos: number) {
        // Not supported yet -- this parser always parses the whole
        // document in one shot (see the class comment above), so
        // there's no partial-parse position to actually stop at.
      },
      stoppedAt: null,
    };
    return parse;
  }
}

const cardpotParser = new CardpotParser();

// No language-specific data (comment syntax, etc.) exists yet -- an
// empty facet config is enough to satisfy Language's constructor.
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
