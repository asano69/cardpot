import { EditorState, type Extension, type Text } from "@codemirror/state";
import { isBlankLine } from "../../parser/cardpot/indent";
import { isUserTransaction } from "../../userEdit";

// Whether `doc` needs a blank line appended: its last line holds text. The
// first line is the card's title (see parser/cardpot/rules/title.ts) and is
// never extended: adding a line right after the first keystroke would count
// as confirming the title (see titleCandidatePlugin.ts's headerJustCommitted).
export function needsTrailingLine(doc: Text): boolean {
  return doc.lines > 1 && !isBlankLine(doc.line(doc.lines).text);
}

// Keeps the document ending with a blank line, so there is always an empty
// line to continue writing on. The newline is added to the very transaction
// of the user's edit, so y-codemirror.next sends both to the Y.Text at once.
// Remote and synthetic transactions are left alone: a change added to them
// would exist in the editor only, not in the Y.Text.
export const trailingBlankLine: Extension = EditorState.transactionFilter.of(
  (tr) => {
    if (!isUserTransaction(tr) || !needsTrailingLine(tr.newDoc)) return tr;
    return [
      tr,
      { changes: { from: tr.newDoc.length, insert: "\n" }, sequential: true },
    ];
  },
);
