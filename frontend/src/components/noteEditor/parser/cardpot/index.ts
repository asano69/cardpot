// Cardpot's own inline/block syntax parser, built from scratch on
// @lezer/common's Parser/Tree primitives -- NOT @lezer/markdown. This
// intentionally does not reuse CommonMark's grammar: Cardpot's bracket
// notation ("[* bold text]", wiki links, tags, icons, ...) is a
// different syntax entirely, and forcing it through a markdown grammar
// meant constantly subtracting CommonMark rules that were never wanted
// in the first place (see the old cardpotSyntax.ts's `disabledForNow`
// list, now deleted).
//
// Structure, loosely modeled on @lezer/markdown's own architecture:
//   - Each notation is a `Rule` (see nodeProps.ts): a NodeType/
//     markType pair plus a `match` function that checks whether that
//     notation starts at a given text position. Adding a new notation
//     means adding one Rule in its own file under rules/ and listing
//     it in the `rules` array below -- the scanning and tree-building
//     code in this file never needs to change.
//   - scanRange() does a single left-to-right pass over a range of
//     text, trying every rule at each position (first match wins) and
//     skipping over whatever it consumes -- no separate per-rule regex
//     passes to merge and de-overlap afterwards.
//   - buildTree() supports incremental reparsing: it reuses whichever
//     previously parsed nodes still fall inside a "safe" fragment (see
//     collectReusableMatches) and only calls scanRange() on the gaps
//     between them -- normally just the few characters actually
//     edited, not the whole document. A brand-new document (no
//     fragments yet) falls back to scanning start-to-end, same as
//     before.
import { NodeType, Parser, Tree } from "@lezer/common";
import type { Input, PartialParser, TreeFragment } from "@lezer/common";
import {
  Language,
  LanguageSupport,
  defineLanguageFacet,
} from "@codemirror/language";

import { revealStyle, isMark, type Rule } from "./nodeProps";
import { Bold, BoldMark, boldRule } from "./rules/bold";
import { Code, CodeMark, inlineCodeRule } from "./rules/inlineCode";
import { WikiLink, WikiLinkMark, wikiLinkRule } from "./rules/wikiLink";
import {
  FencedCode,
  FencedCodeMark,
  fencedCodeRule,
} from "./rules/fencedCode";

// Re-exported for callers outside this package: wikiLinkNavigation.ts
// needs WikiLink, syntaxReveal.ts needs revealStyle/isMark, and each
// NodeType is exported for completeness even where nothing outside
// this parser currently references it directly.
export {
  revealStyle,
  isMark,
  Bold,
  BoldMark,
  Code,
  CodeMark,
  WikiLink,
  WikiLinkMark,
  FencedCode,
  FencedCodeMark,
};

// The tree's root node. `top: true` is required by Lezer for whatever
// node type createParse's Tree is rooted at.
export const Document = NodeType.define({ id: 0, name: "Document", top: true });

// Every notation this language recognizes, in priority order: at a
// given position, the first rule whose match() succeeds wins.
//   - boldRule is tried before wikiLinkRule so "[* text]" is
//     recognized as Bold rather than a WikiLink.
//   - fencedCodeRule is tried before inlineCodeRule so an opening
//     "```" fence is recognized as a code block rather than falling
//     through to inline Code's single-backtick matching.
// Add a new notation by adding a NodeType/markType pair + match() in
// its own file under rules/, then listing its Rule here -- nothing
// else in this file needs to change.
const rules: Rule[] = [boldRule, wikiLinkRule, fencedCodeRule, inlineCodeRule];

// Looks up which Rule produced a given node type, used by
// collectReusableMatches below to rebuild a reused node's mark
// lengths without hardcoding a per-rule switch.
const ruleByNodeId = new Map(rules.map((rule) => [rule.nodeType.id, rule]));

// A single matched (or reused) node, positioned in the current
// document.
interface ScannedNode {
  from: number;
  to: number;
  tree: Tree;
}

function buildMatchTree(
  rule: Rule,
  match: { length: number; openLen: number; closeLen: number },
): Tree {
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
