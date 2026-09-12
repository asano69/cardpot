import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";

// Matches a run of 30 or more consecutive half-width alphanumeric
// characters (e.g. a long URL, hash, or token with no spaces to break
// at). Under `white-space: pre-wrap`, the browser only wraps at
// whitespace, so a run this long simply overflows the editor's width
// instead of wrapping. Marking it with `word-break: break-all` lets
// the browser insert a break anywhere inside the run, keeping it
// within the editor's width.
const LONG_ALNUM_RUN_RE = /[A-Za-z0-9]{30,}/g;

// A single shared mark spec: allows breaking anywhere inside the
// range it wraps, overriding the ambient `white-space: pre-wrap`
// (which never breaks mid-word) for just that range.
const breakAllMark = Decoration.mark({
  attributes: {
    style: "white-space: normal; word-break: break-all;",
  },
});

// Scans every visible line for runs matching LONG_ALNUM_RUN_RE and
// wraps each one in breakAllMark, so only those long runs gain
// break-all behavior -- everything else in the line still wraps
// normally at whitespace.
function buildDecorations(view: EditorView): DecorationSet {
  const decorations = [];
  for (const { from, to } of view.visibleRanges) {
    let pos = from;
    while (pos <= to) {
      const line = view.state.doc.lineAt(pos);
      for (const match of line.text.matchAll(LONG_ALNUM_RUN_RE)) {
        const start = line.from + match.index!;
        const end = start + match[0].length;
        decorations.push(breakAllMark.range(start, end));
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
