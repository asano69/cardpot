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

export const Code = NodeType.define({
  id: 3,
  name: "Code",
  props: [[revealStyle, "cm-inline-code"]],
});

export const CodeMark = NodeType.define({
  id: 4,
  name: "CodeMark",
  props: [[isMark, true]],
});

// This regular expression matches text enclosed in `[* ...]` with the following rules:
// - The sequence must start with `[* ` (an opening bracket, an asterisk, and a space).
// - It must contain at least one character after the space.
// - The content cannot contain `[`, `]`, or a newline character.
// - It must end with a closing `]`.
const BOLD_RE = /\[\* ([^[\]\n]+)\]/g;

// This regular expression matches an inline code span enclosed in a
// pair of backticks. The content may be empty and must not contain a
// backtick or a newline character, so a code span never spans
// multiple lines.
const CODE_RE = /`([^`\n]*)`/g;

// A single regex match, tagged with which syntax produced it and how
// many characters its open/close delimiters occupy -- enough
// information for parseDocument below to build the matching node
// without caring which regex the match came from.
interface SyntaxMatch {
  from: number;
  length: number;
  nodeType: NodeType;
  markType: NodeType;
  openLen: number;
  closeLen: number;
}

function findMatches(
  regex: RegExp,
  text: string,
  nodeType: NodeType,
  markType: NodeType,
  openLen: number,
  closeLen: number,
): SyntaxMatch[] {
  const matches: SyntaxMatch[] = [];
  regex.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text))) {
    matches.push({
      from: match.index,
      length: match[0].length,
      nodeType,
      markType,
      openLen,
      closeLen,
    });
  }
  return matches;
}

function parseDocument(text: string): Tree {
  // Bold's open mark is always 3 chars ("[* ", including the required
  // space); code's open mark is always 1 char ("`"). Both syntaxes'
  // close marks are a single character ("]" or "`").
  const matches = [
    ...findMatches(BOLD_RE, text, Bold, BoldMark, 3, 1),
    ...findMatches(CODE_RE, text, Code, CodeMark, 1, 1),
  ].sort((a, b) => a.from - b.from);

  const children: Tree[] = [];
  const positions: number[] = [];
  // End position of the last accepted match, used to skip any later
  // match that overlaps it. Nesting (e.g. code inside bold) isn't
  // supported -- whichever match comes first simply wins.
  let cursor = 0;

  for (const match of matches) {
    if (match.from < cursor) continue;

    // A node's own two children are positioned relative to the
    // node's own start (0), per Tree's constructor contract -- not
    // absolute document positions.
    const openMark = new Tree(match.markType, [], [], match.openLen);
    const closeMark = new Tree(match.markType, [], [], match.closeLen);
    const node = new Tree(
      match.nodeType,
      [openMark, closeMark],
      [0, match.length - match.closeLen],
      match.length,
    );

    children.push(node);
    positions.push(match.from); // absolute -- Document itself starts at 0
    cursor = match.from + match.length;
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
