import { describe, expect, it } from "vitest";

// Mirrors the closest() check inlined in wikiLinkNavigation.ts's
// mousedown handler -- pulled out here just so it can be exercised
// without constructing a real EditorView/mousedown event.
function clickHitsClass(target: HTMLElement, className: string): boolean {
  return target.closest(`.${className}`) != null;
}

describe("wikiLinkNavigation click targeting", () => {
  it("accepts a click on the rendered link span itself", () => {
    const span = document.createElement("span");
    span.className = "cm-wikilink";
    expect(clickHitsClass(span, "cm-wikilink")).toBe(true);
  });

  it("accepts a click on a child of the rendered link span", () => {
    // Nested marks (e.g. Bold wrapping part of a WikiLink) still
    // resolve via closest() walking up to the ancestor span.
    const span = document.createElement("span");
    span.className = "cm-wikilink";
    const child = document.createElement("span");
    span.appendChild(child);
    expect(clickHitsClass(child, "cm-wikilink")).toBe(true);
  });

  it("rejects a click on the line but outside any link span", () => {
    // Regression test: this is exactly the "blank space to the right
    // of the link" case -- the click lands on .cm-line itself, which
    // carries no cm-wikilink ancestor.
    const line = document.createElement("div");
    line.className = "cm-line";
    expect(clickHitsClass(line, "cm-wikilink")).toBe(false);
  });
});
