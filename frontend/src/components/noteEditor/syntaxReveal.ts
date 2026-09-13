import {
  EditorView,
  ViewPlugin,
  Decoration,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { revealStyle, isMark } from "./parser/cardpot";

// Hides a delimiter/mark node (e.g. "[* " or "]") using a replacing
// decoration rather than a font-size:0 mark. Decoration.replace()
// collapses the range into a single atomic unit for cursor motion and
// selection, so arrow keys / shift-selection step over the whole
// delimiter at once instead of landing inside its individual
// (invisible) characters. A plain Decoration.mark only restyles the
// existing characters -- they stay non-atomic, which let a selection
// anchor land inside a hidden character, making selection look like
// it silently failed and shifting the copied text by the delimiter's
// own length.
const hiddenMark = Decoration.replace({});

// Placeholder for a revealable node whose content is entirely empty
// (e.g. an empty inline code span, "``"). Hiding both marks in that
// case would leave no visible character at all for the node's own
// Decoration.mark (see buildDecorations below) to style, so the
// background/padding that identifies the span would simply vanish.
// This widget renders a single empty, non-editable span carrying the
// node's own style class instead, so its CSS padding+background still
// draw a small box even with zero text content.
class EmptyRevealWidget extends WidgetType {
  constructor(private readonly styleClass: string) {
    super();
  }

  eq(other: EmptyRevealWidget) {
    return other.styleClass === this.styleClass;
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = this.styleClass;
    // Without this, the browser treats the widget as ordinary
    // editable content and can place a native caret inside it.
    span.contentEditable = "false";
    return span;
  }
}

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

      // "Touching" means the current selection overlaps the node's
      // range at all -- not just an empty cursor inside it. Without
      // this, extending a selection into the node (e.g. shift+Left)
      // makes the selection non-empty first, which used to hide the
      // marks mid-selection and desync the rendered content from the
      // document positions the browser's native selection was
      // tracking.
      const touching = main.from <= to && main.to >= from;
      if (touching) return; // leave marks visible for editing

      // Exactly two mark children (open/close) are expected per
      // revealable node (see parser/cardpot's parseDocument) -- the
      // node's content is whatever sits between them.
      const openMark = node.node.firstChild;
      const closeMark = node.node.lastChild;
      const contentIsEmpty =
        openMark && closeMark && openMark.to === closeMark.from;

      if (contentIsEmpty) {
        decorations.push(
          Decoration.replace({
            widget: new EmptyRevealWidget(styleClass),
          }).range(from, to),
        );
        return;
      }

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
