import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { revealStyle, isMark } from "./parser/cardpot";

// Hides a delimiter/mark node (e.g. "[*" or "]") by collapsing it to
// zero width, the same technique hangingIndent.ts uses for hidden tabs.
const hiddenMark = Decoration.mark({ class: "cm-mark-hidden" });

// Generic Obsidian-style live preview: any node type tagged with
// revealStyle (see parser/cardpot) gets its full range styled with
// that CSS class at all times. While the cursor is NOT touching the
// node, its direct mark children (tagged with isMark) are hidden --
// so only the styled content shows. The instant the cursor enters the
// node, marks reappear so the raw syntax can be edited; they inherit
// the same style class since it's applied to the whole node range,
// not just the content sub-range.
//
// Adding a new revealable syntax (wikilinks, tags, ...) needs no
// change here -- only new node types in parser/cardpot tagged with
// revealStyle/isMark, plus their own scan logic in parseDocument.
function buildDecorations(view: EditorView): DecorationSet {
  const decorations = [];
  const { main } = view.state.selection;

  syntaxTree(view.state).iterate({
    enter(node) {
      const styleClass = node.type.prop(revealStyle);
      if (!styleClass) return; // not a revealable node type

      const { from, to } = node;
      decorations.push(Decoration.mark({ class: styleClass }).range(from, to));

      // "Touching" means the (empty) cursor sits anywhere from the
      // node's start through its end, inclusive of both edges.
      const touching = main.empty && main.from >= from && main.from <= to;
      if (touching) return; // leave marks visible for editing

      for (let child = node.node.firstChild; child; child = child.nextSibling) {
        if (child.type.prop(isMark)) {
          decorations.push(hiddenMark.range(child.from, child.to));
        }
      }
    },
  });

  return Decoration.set(decorations, true);
}

export const syntaxReveal = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);
