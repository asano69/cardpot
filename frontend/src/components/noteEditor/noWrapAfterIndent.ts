import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";

// EXPERIMENT: inverted approach. editorTheme.ts sets `.cm-line` to
// word-break: break-all by default, so any run of non-whitespace text
// can wrap at any character. This plugin marks every "short" run
// (under 30 chars) with word-break: normal, restoring ordinary
// word-boundary wrapping for it -- only a run of 30+ chars (a long
// URL, hash, token, ...) is left to break-all's arbitrary mid-run
// wrapping.
//
// Deliberately does NOT set white-space here (unlike the previous
// long-run-marking version): word-break works fine under the ambient
// white-space: pre-wrap, and setting white-space: normal would
// collapse consecutive spaces, which this app relies on distinguishing
// (see collapseGridTitleWhitespace / titleToSlug's one-to-one space
// mapping).
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

export const noWrapAfterIndent = ViewPlugin.fromClass(
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
