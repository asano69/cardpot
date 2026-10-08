import { Annotation } from "@codemirror/state";
import type { ViewUpdate } from "@codemirror/view";
import { ySyncAnnotation } from "y-codemirror.next";

// Tags a transaction NoteEditor dispatches itself programmatically (seeding a
// brand-new draft's header, or filling a blank "Untitled" header), so
// hasUserEdit below does not count it as a real user edit.
export const syntheticAnnotation = Annotation.define<boolean>();

// Whether any transaction in `update` reflects an actual user edit -- excludes
// the synthetic transactions above and y-codemirror.next's remote-sync
// transactions (tagged with ySyncAnnotation whenever a change comes from Yjs
// itself: another peer's edit, or the initial doc <- ytext seed on mount).
export function hasUserEdit(update: ViewUpdate): boolean {
  return update.transactions.some(
    (tr) =>
      tr.docChanged &&
      tr.annotation(syntheticAnnotation) === undefined &&
      tr.annotation(ySyncAnnotation) === undefined,
  );
}
