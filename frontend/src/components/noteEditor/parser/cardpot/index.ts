// Cardpot's own inline syntax parser, built from scratch on
// @lezer/common's Parser/Tree primitives -- NOT @lezer/markdown. This
// intentionally does not reuse CommonMark's grammar: Cardpot's bracket
// notation ("[* bold text]", eventually wiki links, tags, icons, ...)
// is a different syntax entirely, and forcing it through a markdown
// grammar meant constantly subtracting CommonMark rules that were
// never wanted in the first place (see the old cardpotSyntax.ts's
// `disabledForNow` list, now deleted).
//
// Structure, loosely modeled on @lezer/markdown's own architecture:
//   - Each notation is a `Rule`: a NodeType/markType pair plus a
//     `match` function that checks whether that notation starts at a
//     given text position. Adding a new notation (wiki links, tags,
//     ...) means adding one Rule to the `rules` array below -- the
//     scanning and tree-building code never needs to change.
//   - scanRange() does a single left-to-right pass over a range of
//     text, trying every rule at each position (first match wins) and
//     skipping over whatever it consumes -- no separate per-rule
//     regex passes to merge and de-overlap afterwards.
//   - buildTree() supports incremental reparsing: it reuses whichever
//     previously parsed nodes still fall inside a "safe" fragment (see
//     collectReusableMatches) and only calls scanRange() on the gaps
//     between them -- normally just the few characters actually
//     edited, not the whole document. A brand-new document (no
//     fragments yet) falls back to scanning start-to-end, same as
//     before.
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

export const WikiLink = NodeType.define({
  id: 5,
  name: "WikiLink",
  props: [[revealStyle, "cm-wikilink"]],
});

export const WikiLinkMark = NodeType.define({
  id: 6,
  name: "WikiLinkMark",
  props: [[isMark, true]],
});

// What a Rule's match() returns: how many characters the whole match
// consumes, split into its opening and closing delimiter lengths (the
// content in between is everything else). Kept separate from the
// actual Tree-building code below, so a Rule only ever has to answer
// "does my notation start here, and how long is it" -- nothing about
// NodeType/Tree construction leaks into individual rules.
interface RuleMatch {
  length: number;
  openLen: number;
  closeLen: number;
}

interface Rule {
  nodeType: NodeType;
  markType: NodeType;
  // Checks whether this rule's notation starts at exactly `pos` in
  // `text`. Must not look at any text before `pos`, and must not
  // match across a newline -- both scanRange's gap-splitting and
  // collectReusableMatches's fragment-boundary checks below assume a
  // match never straddles those.
  match(text: string, pos: number): RuleMatch | null;
}

// "[* text]": an opening "[* " (bracket, asterisk, space), one or
// more characters that aren't "[", "]", or a newline, then a closing
// "]".
function matchBold(text: string, pos: number): RuleMatch | null {
  if (!text.startsWith("[* ", pos)) return null;
  let i = pos + 3;
  const contentStart = i;
  while (
    i < text.length &&
    text[i] !== "[" &&
    text[i] !== "]" &&
    text[i] !== "\n"
  ) {
    i++;
  }
  if (i === contentStart || text[i] !== "]") return null; // empty content, or ran off the line unterminated
  return { length: i + 1 - pos, openLen: 3, closeLen: 1 };
}

// "[title]": a "[", one or more characters that aren't "[", "]", or a
// newline, then a closing "]". Content that is empty or made up
// entirely of whitespace does not count as a title, so "[]" and
// "[ ]" don't match. Checked after matchBold above, so "[* text]"
// is still recognized as Bold rather than a WikiLink.
function matchWikiLink(text: string, pos: number): RuleMatch | null {
  if (text[pos] !== "[") return null;
  let i = pos + 1;
  const contentStart = i;
  while (
    i < text.length &&
    text[i] !== "[" &&
    text[i] !== "]" &&
    text[i] !== "\n"
  ) {
    i++;
  }
  if (text[i] !== "]") return null; // ran off the line unterminated
  if (text.slice(contentStart, i).trim() === "") return null; // whitespace-only content isn't a title
  return { length: i + 1 - pos, openLen: 1, closeLen: 1 };
}

// An inline code span enclosed in a pair of backticks. The content
// may be empty and must not contain a backtick or a newline, so a
// code span never spans multiple lines.
function matchCode(text: string, pos: number): RuleMatch | null {
  if (text[pos] !== "`") return null;
  let i = pos + 1;
  while (i < text.length && text[i] !== "`" && text[i] !== "\n") {
    i++;
  }
  if (text[i] !== "`") return null; // ran off the line unterminated
  return { length: i + 1 - pos, openLen: 1, closeLen: 1 };
}

// Every notation this language recognizes, in priority order: at a
// given position, the first rule whose match() succeeds wins. Add a
// new notation by adding a NodeType/markType pair above and one entry
// here -- nothing else in this file needs to change.
const rules: Rule[] = [
  { nodeType: Bold, markType: BoldMark, match: matchBold },
  { nodeType: WikiLink, markType: WikiLinkMark, match: matchWikiLink },
  { nodeType: Code, markType: CodeMark, match: matchCode },
];

// Looks up which Rule produced a given node type, used by
// collectReusableMatches below to rebuild a reused node's mark
// lengths without hardcoding a Bold/Code-specific switch.
const ruleByNodeId = new Map(rules.map((rule) => [rule.nodeType.id, rule]));

// A single matched (or reused) node, positioned in the current
// document.
interface ScannedNode {
  from: number;
  to: number;
  tree: Tree;
}

function buildMatchTree(rule: Rule, match: RuleMatch): Tree {
  const openMark = new Tree(rule.markType, [], [], match.openLen);
  const closeMark = new Tree(rule.markType, [], [], match.closeLen);
  return new Tree(
    rule.nodeType,
    [openMark, closeMark],
    [0, match.length - match.closeLen],
    match.length,
  );
}

// Scans exactly [from, to) of `text`, trying every rule at each
// position in turn. A match that would extend past `to` is rejected,
// so a caller can safely scan one gap and trust that no match
// straddles into whatever sits right after `to` (e.g. a reused node
// -- see buildTree).
function scanRange(text: string, from: number, to: number): ScannedNode[] {
  const results: ScannedNode[] = [];
  let pos = from;
  while (pos < to) {
    let consumed = false;
    for (const rule of rules) {
      const match = rule.match(text, pos);
      if (match && pos + match.length <= to) {
        results.push({
          from: pos,
          to: pos + match.length,
          tree: buildMatchTree(rule, match),
        });
        pos += match.length;
        consumed = true;
        break;
      }
    }
    if (!consumed) pos++;
  }
  return results;
}

// Walks every "safe" fragment from the previous parse and rebuilds
// its top-level nodes as fresh Trees at their current document
// positions, so buildTree can skip re-scanning that text entirely.
// Rebuilt from the TreeCursor API rather than lifted directly out of
// the old Tree object, since Lezer may have compacted small subtrees
// into an internal buffer representation that doesn't expose a plain
// Tree per node.
//
// A fragment is only used if:
//   - it has no open edge (openStart/openEnd): an open edge means the
//     previous parse couldn't guarantee a clean node boundary there,
//     so nothing touching it is safe to reuse.
//   - the candidate node's own span sits strictly inside the
//     fragment's [from, to) range: a node whose span was clipped by
//     the fragment boundary (because the edit landed inside it) fails
//     this check and is correctly dropped instead of reused.
function collectReusableMatches(
  fragments: readonly TreeFragment[],
): ScannedNode[] {
  const reused: ScannedNode[] = [];

  for (const fragment of fragments) {
    if (fragment.openStart || fragment.openEnd) continue;

    const cursor = fragment.tree.cursor();
    if (!cursor.firstChild()) continue; // this fragment's Document had no children

    do {
      const rule = ruleByNodeId.get(cursor.type.id);
      if (!rule) continue; // not a node type this parser produces -- skip defensively

      // fragment.offset translates a position in the fragment's own
      // (old) tree into the corresponding position in the current
      // document.
      const from = cursor.from + fragment.offset;
      const to = cursor.to + fragment.offset;
      if (from < fragment.from || to > fragment.to) continue;

      let openLen = 0;
      let closeLen = 0;
      if (cursor.firstChild()) {
        openLen = cursor.to - cursor.from;
        if (cursor.nextSibling()) closeLen = cursor.to - cursor.from;
        cursor.parent(); // back to the top-level node before continuing nextSibling() below
      }

      reused.push({
        from,
        to,
        tree: buildMatchTree(rule, { length: to - from, openLen, closeLen }),
      });
    } while (cursor.nextSibling());
  }

  return reused;
}

// Builds the Document tree for `text`. Reused nodes (see
// collectReusableMatches) are placed first, sorted by position; any
// gap before, between, or after them is filled in by scanning just
// that gap. On the very first parse (no fragments yet), there is
// nothing to reuse and this scans the whole document once, same as a
// plain non-incremental parser would.
function buildTree(text: string, fragments: readonly TreeFragment[]): Tree {
  const reused = collectReusableMatches(fragments).sort(
    (a, b) => a.from - b.from,
  );

  const children: Tree[] = [];
  const positions: number[] = [];
  let pos = 0;

  const place = (node: ScannedNode) => {
    children.push(node.tree);
    positions.push(node.from);
    pos = node.to;
  };

  for (const node of reused) {
    if (node.from < pos) continue; // overlaps something already placed -- drop it
    if (node.from > pos) {
      for (const scanned of scanRange(text, pos, node.from)) place(scanned);
    }
    place(node);
  }
  if (pos < text.length) {
    for (const scanned of scanRange(text, pos, text.length)) place(scanned);
  }

  return new Tree(Document, children, positions, text.length);
}

// Single-shot parser: buildTree() above already parses (and reuses)
// the whole document in one call, so advance() has nothing left to
// chunk across multiple ticks. That's a deliberate simplification --
// cards are only a few hundred lines at most, so even a full rescan
// is cheap; incremental reuse (see buildTree) is what actually keeps
// per-keystroke cost down, not chunked parsing.
class CardpotParser extends Parser {
  createParse(
    input: Input,
    fragments: readonly TreeFragment[],
    _ranges: readonly { from: number; to: number }[],
  ): PartialParser {
    let done = false;
    const parse: PartialParser = {
      parsedPos: 0,
      advance() {
        if (done) return null;
        done = true;
        const tree = buildTree(input.read(0, input.length), fragments);
        parse.parsedPos = input.length;
        return tree;
      },
      stopAt(_pos: number) {
        // Not supported: this parser always finishes in one
        // advance() call (see the class comment above), so there is
        // no partial-parse position to stop at.
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
