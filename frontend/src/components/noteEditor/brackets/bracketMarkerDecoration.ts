import { syntaxTree } from "@codemirror/language";
import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

// Marker node names mapped to the CSS class applied to their inner
// payload (see buildDecorations below) -- not the "[X " prefix or
// trailing "]", which are hidden via Decoration.replace().
const MARKER_CLASS: Record<string, string> = {
  BoldMarker: "cm-bracket-bold",
  ItalicMarker: "cm-bracket-italic",
};

// Fixed prefix length for every marker: "[" + one marker char ("*"
// or "/") + one space = 3 characters, per the grammar's
// `OpenBracket marker Space` shape.
const PREFIX_LENGTH = 3;

function buildDecorations(view: EditorView): DecorationSet {
  // Collected first, then sorted, since RangeSetBuilder requires
  // strictly increasing `from` positions and syntaxTree.iterate()
  // doesn't guarantee that across nested/sibling marker nodes on its
  // own once multiple decorations per node are added.
  const entries: { from: number; to: number; deco: Decoration }[] = [];

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        const cls = MARKER_CLASS[node.name];
        if (!cls) return;

        const contentFrom = node.from + PREFIX_LENGTH;
        const contentTo = node.to - 1; // exclude trailing "]"

        entries.push({
          from: node.from,
          to: contentFrom,
          deco: Decoration.replace({}),
        });
        entries.push({
          from: contentFrom,
          to: contentTo,
          deco: Decoration.mark({ class: cls }),
        });
        entries.push({
          from: contentTo,
          to: node.to,
          deco: Decoration.replace({}),
        });
      },
    });
  }

  entries.sort((a, b) => a.from - b.from || a.to - b.to);

  const builder = new RangeSetBuilder<Decoration>();
  for (const { from, to, deco } of entries) {
    builder.add(from, to, deco);
  }
  return builder.finish();
}

export const bracketMarkerDecoration = ViewPlugin.fromClass(
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
