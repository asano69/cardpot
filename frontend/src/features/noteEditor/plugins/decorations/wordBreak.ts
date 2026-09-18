import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";

// Word-break strategy for the editor's body text, built from two
// layers:
//
//   1. editorTheme.ts sets `.cm-line` to word-break: break-all as the
//      baseline. This makes every boundary in a line breakable --
//      including the boundary next to any atomic, non-text inline
//      element (the hanging-indent "pad" widgets today, or a future
//      inline image node) -- so an unbreakable boundary never forces
//      an unnatural wrap elsewhere in the line. No special-casing per
//      widget type is needed for this.
//   2. This plugin then marks every "ordinary" (short) run of
//      non-whitespace text back to word-break: normal, so regular
//      words still wrap at their natural boundaries instead of
//      breaking mid-word. Only a run of 30+ characters (a long URL,
//      hash, token, ...) is left at the break-all baseline, since
//      that's the case pre-wrap can't otherwise wrap at all.
//
// Deliberately does NOT set white-space here: word-break works fine
// under the ambient white-space: pre-wrap, and setting
// white-space: normal would collapse consecutive spaces, which this
// app relies on distinguishing (see collapseGridTitleWhitespace /
// titleToSlug's one-to-one space mapping).
const NON_WHITESPACE_RUN_RE = /\S+/g;
const NORMAL_BREAK_MAX_LENGTH = 30;

const normalBreakMark = Decoration.mark({
  attributes: { style: "word-break: normal;" },
});

function buildDecorations(view: EditorView): DecorationSet {
  const decorations = [];
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos);
      for (const match of line.text.matchAll(NON_WHITESPACE_RUN_RE)) {
        if (match[0].length >= NORMAL_BREAK_MAX_LENGTH) continue; // leave break-all
        const start = line.from + match.index!;
        const end = start + match[0].length;
        decorations.push(normalBreakMark.range(start, end));
      }
      pos = line.to + 1;
    }
  }
  return Decoration.set(decorations, true);
}

export const wordBreak = ViewPlugin.fromClass(
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
  {
    decorations: (plugin) => plugin.decorations,
  },
);
