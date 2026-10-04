import { EditorView } from "@codemirror/view";
import { convert } from "@/features/md2sb";
import { skipContexts } from "./context";
import { looksLikeMarkdown } from "./detect";

// Converts pasted Markdown to Scrapbox notation before inserting it. Text that
// is not clearly Markdown (see detect.ts), or that is pasted somewhere
// conversion makes no sense (see context.ts), falls through to the default
// paste.
export function pasteMarkdown() {
  return EditorView.domEventHandlers({
    paste(event, view) {
      const text = event.clipboardData?.getData("text/plain");
      if (!text || !looksLikeMarkdown(text)) return false;

      const { state } = view;
      if (skipContexts.some((context) => context.test(state))) return false;

      let converted: string;
      try {
        // The converter ends its output with a newline; a paste must not.
        converted = convert(text).replace(/\n+$/, "");
      } catch (err) {
        console.error("[paste-markdown] failed to convert:", err);
        return false; // keep the default paste rather than lose the text
      }

      event.preventDefault();
      const { from, to } = state.selection.main;
      view.dispatch(
        state.update({
          changes: { from, to, insert: converted },
          selection: { anchor: from + converted.length },
          scrollIntoView: true,
          userEvent: "input.paste",
        }),
      );
      return true;
    },
  });
}
