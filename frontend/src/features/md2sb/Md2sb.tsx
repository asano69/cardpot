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
    // Fixed between TopBar (h-10) and Footer (20px) so the two panes fill
    // the whole screen, instead of sitting inside MainLayout's max-w-7xl
    // column.
    <div class="fixed inset-x-0 top-10 bottom-5 flex flex-col gap-2 p-2">
      <div class="flex items-center gap-3">
        <h1 class="font-sans text-xl font-bold">Markdown to Scrapbox</h1>
        {error() && <p class="text-sm text-[#dc3545]">{error()}</p>}
        <button type="button" class="btn ml-auto" onClick={copy}>
          {copied() ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Stacked on narrow screens, side by side from md up. min-h-0 lets
          the grid shrink to the available height instead of growing with
          its content. */}
      <div class="grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-2 md:grid-cols-2 md:grid-rows-1">
        <textarea
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          placeholder="Markdown"
          spellcheck={false}
          class="h-full w-full resize-none rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text"
        />

        <textarea
          value={result().text}
          readOnly
          placeholder="Scrapbox"
          spellcheck={false}
          class="h-full w-full resize-none rounded-md border border-border bg-field px-3 py-2 font-mono text-sm text-text"
        />
      </div>
    </div>
  );
}
