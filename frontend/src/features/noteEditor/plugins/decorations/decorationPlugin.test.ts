import { describe, expect, it, vi } from "vitest";
import { ChangeSet } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { stepDecorations, type DecorationState } from "./decorationPlugin";

const mark = Decoration.mark({ class: "x" });

function stateAt(from: number, to: number, stale = false): DecorationState {
  return { decorations: Decoration.set([mark.range(from, to)]), stale };
}

function ranges(state: DecorationState): [number, number][] {
  const out: [number, number][] = [];
  const cursor = state.decorations.iter();
  for (; cursor.value; cursor.next()) out.push([cursor.from, cursor.to]);
  return out;
}

const noChanges = ChangeSet.empty(10);

describe("stepDecorations", () => {
  it("does not rebuild while composing, and maps the old decorations", () => {
    // Regression test: rebuilding during an IME composition dropped text.
    const build = vi.fn(() => Decoration.none);
    const changes = ChangeSet.of({ from: 0, insert: "ab" }, 10);

    const next = stepDecorations(
      stateAt(2, 3),
      { composing: true, changes, rebuild: true },
      build,
    );

    expect(build).not.toHaveBeenCalled();
    expect(ranges(next)).toEqual([[4, 5]]);
    expect(next.stale).toBe(true);
  });

  it("rebuilds after the composition even when nothing else triggered it", () => {
    const build = vi.fn(() => Decoration.set([mark.range(0, 1)]));

    const next = stepDecorations(
      stateAt(2, 3, true),
      { composing: false, changes: noChanges, rebuild: false },
      build,
    );

    expect(build).toHaveBeenCalledTimes(1);
    expect(ranges(next)).toEqual([[0, 1]]);
    expect(next.stale).toBe(false);
  });

  it("rebuilds when triggered", () => {
    const build = vi.fn(() => Decoration.none);
    stepDecorations(
      stateAt(0, 1),
      { composing: false, changes: noChanges, rebuild: true },
      build,
    );
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("keeps the previous state when nothing is owed or triggered", () => {
    const build = vi.fn(() => Decoration.none);
    const prev = stateAt(0, 1);

    const next = stepDecorations(
      prev,
      { composing: false, changes: noChanges, rebuild: false },
      build,
    );

    expect(build).not.toHaveBeenCalled();
    expect(next).toBe(prev);
  });
});
