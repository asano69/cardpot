import type { Command } from "@codemirror/view";
import { EditorSelection, type EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { CodeBlock } from "../../parser/cardpot";

const LEADING_TABS_RE = /^\t+/;

// Whether `pos` falls inside a `code:` block (see
// codeBlockLines.ts / hangingIndent.ts for the same CodeBlock
// lookup). Leading whitespace there is code content, not a bullet to
// continue or release.
function isInCodeBlock(state: EditorState, pos: number): boolean {
  let node = syntaxTree(state).resolveInner(pos, -1);
  while (node) {
    if (node.type === CodeBlock) return true;
    node = node.parent;
  }
  return false;
}

// Enter behavior for bulleted (tab-indented) lines, mirroring common
// outliner UX (Workflowy/Scrapbox-style):
//
// - A bulleted line that already has text keeps its bullet depth on
//   the next line, so pressing Enter continues the list at the same
//   indent instead of resetting to depth 0 every time.
// - A bulleted line with nothing typed yet (just the leading tabs, no
//   real content) is "released" instead: its tabs are stripped in
//   place and no new line is inserted, exiting bullet mode rather
//   than nesting an empty bullet under another empty bullet.
export const insertNewlineKeepingBullet: Command = (view) => {
  const { state } = view;
  const changes = state.changeByRange((range) => {
    // Inside a `code:` block, Enter always inserts a plain
    // newline -- indentation here is code content, not a bullet to
    // continue or release (see hangingIndent.ts's own CodeBlock
    // guard for the display-side counterpart of this fix).
    if (isInCodeBlock(state, range.from)) {
      return {
        changes: { from: range.from, to: range.to, insert: "\n" },
        range: EditorSelection.cursor(range.from + 1),
      };
    }

    const line = state.doc.lineAt(range.from);
    const match = LEADING_TABS_RE.exec(line.text);
    const depth = match ? match[0].length : 0;
    const rest = line.text.slice(depth);

    if (depth > 0 && rest.trim() === "") {
      // Empty bullet: release bullet mode and still insert a newline,
      // so the cursor moves down to a fresh, unindented line rather
      // than staying on the now-flattened one. The whole line (not
      // just its leading tabs) is replaced, since `rest` may still
      // hold trailing whitespace after the tabs that must not survive
      // into the new line either.
      return {
        changes: { from: line.from, to: line.to, insert: "\n" },
        range: EditorSelection.cursor(line.from + 1),
      };
    }

    // Non-empty bulleted line (or depth 0): continue at the same
    // indent depth on the new line.
    const insert = "\n" + "\t".repeat(depth);
    return {
      changes: { from: range.from, to: range.to, insert },
      range: EditorSelection.cursor(range.from + insert.length),
    };
  });

  view.dispatch(
    state.update(changes, { scrollIntoView: true, userEvent: "input" }),
  );
  return true;
};
