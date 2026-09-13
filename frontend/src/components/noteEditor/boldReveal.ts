import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";

import { Bold } from "./parser/cardpot";

// Obsidian-style live preview for Bold ("[* text]"): renders as plain
// bold text with its markup hidden, UNLESS the (empty) selection is
// touching it -- from the opening "[*" through the closing "]"
// inclusive of both edges -- in which case the raw markup is revealed
// (still bold) so it can be edited. Ported from the ProseMirror-era
// prose-mirror.old/emphasisRevealPlugin.ts.old, now reading Bold nodes
// off the cardpot syntax tree instead of scanning text with a regex
// directly.
const hiddenMark = Decoration.mark({ class: "cm-bold-mark" });
const boldText = Decoration.mark({ class: "cm-bold-text" });
const boldRaw = Decoration.mark({ class: "cm-bold-raw" });

function buildDecorations(view: EditorView): DecorationSet {
  const decorations = [];
  const { main } = view.state.selection;

  syntaxTree(view.state).iterate({
    enter(node) {
      if (node.type !== Bold) return;

      const { from, to } = node;
      // "Touching" means the (empty) cursor sits anywhere from the
      // node's start through its end, inclusive of both edges -- this
      // is what makes the marker reappear the instant the caret
      // enters, and hide again the instant it leaves.
      const touching = main.empty && main.from >= from && main.from <= to;

      if (touching) {
        decorations.push(boldRaw.range(from, to));
        return;
      }

      // Bold's own shape: two BoldMark children ("[*" and "]")
      // bracketing an untagged content range (see parser/cardpot).
      const open = node.node.firstChild;
      const close = node.node.lastChild;
      if (!open || !close) return; // shouldn't happen -- Bold always has both marks

      decorations.push(hiddenMark.range(open.from, open.to));
      decorations.push(boldText.range(open.to, close.from));
      decorations.push(hiddenMark.range(close.from, close.to));
    },
  });

  return Decoration.set(decorations, true);
}

export const boldReveal = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      // Bold node ranges only move when the doc changes; which node
      // counts as "touching" also depends on the current selection,
      // so both trigger a rebuild.
      if (update.docChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);
