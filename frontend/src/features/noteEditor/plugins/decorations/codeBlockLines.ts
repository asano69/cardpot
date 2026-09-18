import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
  type ViewUpdate,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { CodeBlock } from "../../parser/cardpot";

// Full-line background for a `code:` block (see
// parser/cardpot/rules/codeBlock.ts). A plain Decoration.mark only
// colors the actual text runs it covers, so a blank line inside the
// block -- or the gap past the last character of a line, out to the
// edge of the editor -- would show through with no background at all.
// Decoration.line() instead tags every line the block spans with a
// CSS class on the line's own DOM element (".cm-line"), which fills
// that line's full width regardless of how much text it holds -- the
// same technique titleLineHighlight.ts and hangingIndent.ts use for
// their own line-level styling.
function buildDecorations(view: EditorView): DecorationSet {
  const decorations = [];
  syntaxTree(view.state).iterate({
    enter(node) {
      if (node.type !== CodeBlock) return;
      const startLine = view.state.doc.lineAt(node.from).number;
      const endLine = view.state.doc.lineAt(node.to).number;
      for (let n = startLine; n <= endLine; n++) {
        const line = view.state.doc.line(n);
        decorations.push(
          Decoration.line({ class: "cm-code-block-line" }).range(line.from),
        );
      }
    },
  });
  return Decoration.set(decorations, true);
}

export const codeBlockLines = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      // The syntax tree only changes shape when the doc itself
      // changes -- a pure selection or viewport change never needs a
      // new set of code-block line ranges.
      if (update.docChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);
