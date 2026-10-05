import { describe, expect, it, vi } from "vitest";
import { subscribeToChannel } from "../api/realtime";
import {
  mergeTargetOf,
  watchMergeAlerts,
  type MergeAlertEvent,
} from "./mergeAlertStore";

vi.mock("../api/realtime", () => ({
  subscribeToChannel: vi.fn(() => () => {}),
}));

// Starts watching and returns a function that delivers an alert the way the
// realtime module would.
function watch() {
  let onData: (event: MergeAlertEvent) => void = () => {};
  vi.mocked(subscribeToChannel).mockImplementationOnce((_name, handler) => {
    onData = handler as (event: MergeAlertEvent) => void;
    return () => {};
  });
  watchMergeAlerts();
  return (event: MergeAlertEvent) => onData(event);
}

describe("mergeAlertStore", () => {
  it("holds the title a card duplicates until it is cleared", () => {
    const emit = watch();

    emit({ cardId: "c1", mergeTarget: "p" });
    expect(mergeTargetOf("c1")).toBe("p");

    emit({ cardId: "c1", mergeTarget: null });
    expect(mergeTargetOf("c1")).toBeUndefined();
  });

  it("keeps cards apart", () => {
    const emit = watch();

    emit({ cardId: "c2", mergeTarget: "p" });
    expect(mergeTargetOf("c3")).toBeUndefined();
    expect(mergeTargetOf(undefined)).toBeUndefined();
  });
});
