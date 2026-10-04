import {
  autocompletion,
  type CompletionSource,
} from "@codemirror/autocomplete";
import { suggestTitles } from "@/lib/dexie/titleSuggestQuery";
import { titleToLowerKey } from "@/lib/models/slugify";
import { skipContexts } from "./pasteMarkdown/context";

// An unclosed "[" followed by text without brackets, up to the cursor. In a
// nested "[* [ap" only the inner bracket matches.
const OPEN_BRACKET_RE = /\[([^[\]\n]*)$/;

// "[* text]" and "[/ text]" are decorations, not links.
const DECORATION_RE = /^[*/]+ /;

// Suggests the titles of existing cards while a wiki link is being typed
// ("[ap" -> "apple", "application"). potId is read on every request, so it may
// still be unknown when the editor is created.
export function titleCompletion(potId: () => string | undefined) {
  const source: CompletionSource = async (context) => {
    const pot = potId();
    const match = context.matchBefore(OPEN_BRACKET_RE);
    if (!pot || !match) return null;
    // The title line, code and inline code are plain text.
    if (skipContexts.some((skip) => skip.test(context.state))) return null;

    const typed = match.text.slice(1);
    if (DECORATION_RE.test(typed)) return null;
    if (typed === "" && !context.explicit) return null;

    const titles = await suggestTitles(pot, titleToLowerKey(typed));
    return {
      from: match.from + 1,
      // The query already filtered. CodeMirror's own filter would drop
      // matches where the title differs from the typed text (case, "_").
      filter: false,
      options: titles.map((title) => ({
        label: title,
        // closeBrackets has usually inserted "]" already: step over it
        // instead of duplicating it.
        apply: (view, _completion, from, to) => {
          const closed = view.state.sliceDoc(to, to + 1) === "]";
          view.dispatch({
            changes: { from, to, insert: closed ? title : `${title}]` },
            selection: { anchor: from + title.length + 1 },
            userEvent: "input.complete",
          });
        },
      })),
    };
  };
  return autocompletion({ override: [source], icons: false });
}
