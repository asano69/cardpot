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
import { NodeType, Parser, Tree, NodeProp } from "@lezer/common";
import type { Input, PartialParser, TreeFragment } from "@lezer/common";
import {
  Language,
  LanguageSupport,
  defineLanguageFacet,
} from "@codemirror/language";

// Applied to a "container" node type (Bold, future WikiLink, ...) to
// mark it as revealable: shown as styled text with its delimiter
// marks hidden, until the cursor touches it, at which point the raw
// markup is shown instead. The prop's value is the CSS class applied
// to the node's full range at all times (see syntaxReveal.ts).
export const revealStyle = new NodeProp<string>();

// Applied to a delimiter/mark node type (BoldMark, future
// WikiLinkMark, ...) so syntaxReveal.ts can find and hide it
// generically, without knowing which specific syntax it belongs to.
export const isMark = new NodeProp<true>();

// The tree's root node. `top: true` is required by Lezer for whatever
// node type createParse's Tree is rooted at.
export const Document = NodeType.define({ id: 0, name: "Document", top: true });

export const Bold = NodeType.define({
  id: 1,
  name: "Bold",
  props: [[revealStyle, "cm-bold"]],
});

export const BoldMark = NodeType.define({
  id: 2,
  name: "BoldMark",
  props: [[isMark, true]],
});

// This regular expression matches text enclosed in `[* ...]` with the following rules:
// - The sequence must start with `[* ` (an opening bracket, an asterisk, and a space).
// - It must contain at least one character after the space.
// - The content cannot contain `[`, `]`, or a newline character.
// - It must end with a closing `]`.
const BOLD_RE = /\[\* ([^[\]\n]+)\]/g;

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
