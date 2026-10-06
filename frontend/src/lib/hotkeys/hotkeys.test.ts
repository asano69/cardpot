import { createRoot } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { runCommand, useHotkeys } from "./hotkeys";

// Runs `setup` in a reactive root, like a component would.
function mount(setup: () => void) {
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    setup();
  });
  return dispose;
}

describe("runCommand", () => {
  it("returns false when no mounted component handles the command", () => {
    expect(runCommand("search.focus")).toBe(false);
  });

  it("runs the handler of a mounted component, and stops after it unmounts", () => {
    const handler = vi.fn();
    const dispose = mount(() => useHotkeys({ "search.focus": handler }));

    expect(runCommand("search.focus")).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);

    dispose();
    expect(runCommand("search.focus")).toBe(false);
  });

  it("lets the most recently mounted handler win", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const disposeOuter = mount(() => useHotkeys({ "search.focus": outer }));
    const disposeInner = mount(() => useHotkeys({ "search.focus": inner }));

    runCommand("search.focus");
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();

    // Once the inner one is gone, the outer one handles it again.
    disposeInner();
    runCommand("search.focus");
    expect(outer).toHaveBeenCalledTimes(1);
    disposeOuter();
  });
});
