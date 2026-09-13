import { syntaxTree } from "@codemirror/language";
import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import type { SyntaxNode } from "@lezer/common";

// Styles a generic "Bracket" node (see bracket.grammar) purely from
// how deeply it's nested inside other "pure" single-bracket wrappers:
//
//   depth 1  "[text]"           -> wikilink
//   depth 2  "[[text]]"         -> bold
//   depth 3  "[[[text]]]"       -> bold wikilink
//   depth 4+ "[[[[text]]]]"...  -> plain, literal brackets
//
// Depth only advances through a "pure" chain: a Bracket node whose
// entire content is exactly one nested Bracket node and nothing else.
// A bracket that mixes words with a nested bracket (e.g. "[a [b] c]")
// breaks the chain and is always treated as depth 1 (a plain
// wikilink), same as a bracket holding nothing but words.
type BracketContent = "text" | "mixed" | SyntaxNode;

function bracketContent(node: SyntaxNode): BracketContent {
  const children: SyntaxNode[] = [];
  for (let child = node.firstChild; child; child = child.nextSibling) {
    if (child.name !== "OpenBracket" && child.name !== "CloseBracket") {
      children.push(child);
    }
  }
  if (children.length === 0) return "text"; // empty "[]"
  if (children.length === 1 && children[0].name === "Bracket") {
    return children[0];
  }
  if (children.every((c) => c.name === "Word" || c.name === "Space")) {
    return "text";
  }
  return "mixed";
}

function bracketDepth(node: SyntaxNode): number {
  const content = bracketContent(node);
  if (content === "text" || content === "mixed") return 1;
  return bracketDepth(content) + 1;
}

// True when `node` is the sole content of its immediate parent Bracket
// (a "pure chain" link, e.g. the inner Bracket in "[[text]]"). Such a
// node contributes no styling of its own -- the chain's head (the
// outermost non-absorbed Bracket) already accounts for it via
// bracketDepth and hides its bracket characters as part of the whole
// chain. Comparing by position (from/to) rather than node identity,
// since syntaxTree() can hand out fresh SyntaxNode wrappers on each
// call.
function isAbsorbedByParent(node: SyntaxNode): boolean {
  const parent = node.parent;
  if (!parent || parent.name !== "Bracket") return false;
  const content = bracketContent(parent);
  return (
    typeof content !== "string" &&
    content.from === node.from &&
    content.to === node.to
  );
}

// No entry for depth 4+: those stay fully unstyled, literal brackets.
const DEPTH_CLASS: Record<number, string> = {
  1: "cm-bracket-link",
  2: "cm-bracket-bold",
  3: "cm-bracket-bold cm-bracket-link",
};

function buildDecorations(view: EditorView): DecorationSet {
  const decorations = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (ref) => {
        if (ref.name !== "Bracket") return;
        // Absorbed nodes are pure-chain links (see isAbsorbedByParent):
        // their own bracket characters are hidden by the chain's head
        // below, so nothing to do here. Don't return false -- the walk
        // still needs to descend into this node's own children, since
        // a chain can terminate in "mixed" content holding independent
        // Brackets of its own (e.g. "[[a [b] c]]").
        if (isAbsorbedByParent(ref.node)) return;

        const depth = bracketDepth(ref.node);
        const cls = DEPTH_CLASS[depth];
        if (!cls) return; // depth 4+ -- nothing to hide or style

        // The head of a pure chain of length `depth` is wrapped by
        // exactly `depth` opening characters and `depth` closing
        // characters (one per absorbed layer -- see bracket.grammar),
        // so the whole chain's brackets are hidden in one go here
        // instead of the absorbed nodes hiding their own one-at-a-time.
        const openTo = ref.from + depth;
        const closeFrom = ref.to - depth;
        if (openTo >= closeFrom) return; // no content left to mark -- avoid an empty (crashing) mark range

        decorations.push(Decoration.replace({}).range(ref.from, openTo));
        decorations.push(
          Decoration.mark({ class: cls }).range(openTo, closeFrom),
        );
        decorations.push(Decoration.replace({}).range(closeFrom, ref.to));
      },
    });
  }

  // sort:true, since the ranges for nested layers legitimately overlap
  // (an outer layer's content span contains an inner layer's own
  // bracket-hiding ranges).
  return Decoration.set(decorations, true);
}

export const bracketDepthStyle = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
