import { syntaxTree } from "@codemirror/language";
import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder, type EditorState } from "@codemirror/state";

// Marker node names mapped to the CSS class applied to their payload
// (see buildDecorations below). The same class is reused for the
// "editing" state: a marker whose raw "[X text]" syntax is currently
// revealed still gets styled bold/italic, it's just not collapsed.
//
// Reveal-on-touch behavior mirrors the previous ProseMirror editor's
// emphasisRevealPlugin.ts.old (see prose-mirror.old/), which did the
// same thing for "*text*" markdown emphasis: a marker collapses to
// just its styled inner text while the caret is elsewhere, and
// expands back to its raw source while the caret is inside it so it
// can actually be edited (Obsidian-style live preview).
const MARKER_CLASS: Record<string, string> = {
  BoldMarker: "cm-bracket-bold",
  ItalicMarker: "cm-bracket-italic",
};

// Fixed prefix length for every marker: "[" + one marker char ("*"
// or "/") + one space = 3 characters, per the grammar's
// `OpenBracket marker Space` shape.
const PREFIX_LENGTH = 3;

// A marker is "touching" the selection when the (empty) cursor sits
// anywhere from its opening "[" through its closing "]", inclusive of
// both edges -- same rule as emphasisRevealPlugin.ts.old. A non-empty
// (range) selection never touches, so selecting text always shows the
// collapsed form.
function touchesSelection(
  state: EditorState,
  from: number,
  to: number,
): boolean {
  const { main } = state.selection;
  return main.empty && main.from >= from && main.from <= to;
}

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

        if (touchesSelection(view.state, node.from, node.to)) {
          // Caret is inside this marker: keep the raw "[X text]"
          // source visible (and editable) but still styled, so it
          // reads as what it's about to become.
          entries.push({
            from: node.from,
            to: node.to,
            deco: Decoration.mark({ class: cls }),
          });
          return;
        }

        // Caret is elsewhere: hide the "[X " prefix and trailing "]",
        // showing only the styled inner text.
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
      // Recomputed on selection changes too, not just doc/viewport
      // changes: whether a marker is collapsed or revealed depends on
      // caret position (see touchesSelection above), so moving the
      // caret into or out of a marker must re-run this even when the
      // document itself hasn't changed.
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);
