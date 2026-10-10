import { createMemo, createSignal } from "solid-js";

import { convert } from "./convert";

// POC converter: Markdown in, Scrapbox notation out, recomputed on every
// keystroke.
export default function Md2sb() {
  const [input, setInput] = createSignal("");
  const [copied, setCopied] = createSignal(false);
  const [copyError, setCopyError] = createSignal("");

  const result = createMemo(() => {
    try {
      return { text: convert(input()), error: "" };
    } catch (err) {
      console.error("[md2sb] failed to convert:", err);
      return { text: "", error: "Failed to convert the Markdown." };
    }
  });

  const copy = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(result().text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopyError("Failed to copy to the clipboard.");
    }
  };

  const error = () => result().error || copyError();

  return (
    // Fixed between TopBar and Footer (see .md2sb) so the two panes fill the
    // whole screen, instead of sitting inside the app content column.
    <div class="md2sb">
      <div class="md2sb-header">
        <h1 class="admin-title">Markdown to Scrapbox</h1>
        {error() && <p class="form-error">{error()}</p>}
        <button type="button" class="btn" onClick={copy}>
          {copied() ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Stacked on narrow screens, side by side from md up (see
          .md2sb-panes). */}
      <div class="md2sb-panes">
        <textarea
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          placeholder="Markdown"
          spellcheck={false}
          class="input input-mono"
        />

        <textarea
          value={result().text}
          readOnly
          placeholder="Scrapbox"
          spellcheck={false}
          class="input input-mono"
        />
      </div>
    </div>
  );
}
