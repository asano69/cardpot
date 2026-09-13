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

        const cls = DEPTH_CLASS[bracketDepth(ref.node)];
        if (!cls) return; // depth 4+ -- nothing to hide or style

        // A Bracket node's own opening/closing characters are always
        // its very first and last character (see bracket.grammar):
        // hide just those two, and style the text in between. A
        // nested layer hides its own bracket characters independently,
        // the next time this same walk reaches its own Bracket node.
        const openTo = ref.from + 1;
        const closeFrom = ref.to - 1;
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
