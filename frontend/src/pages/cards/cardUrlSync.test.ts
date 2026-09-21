import { describe, expect, it } from "vitest";
import { isRenameOfOpenCard } from "./cardUrlSync";

describe("isRenameOfOpenCard", () => {
  it("is true when the open card's title changes", () => {
    expect(
      isRenameOfOpenCard({ id: "a", title: "Old" }, { id: "a", title: "New" }),
    ).toBe(true);
  });

  it("is false when nothing changed", () => {
    expect(
      isRenameOfOpenCard(
        { id: "a", title: "Same" },
        { id: "a", title: "Same" },
      ),
    ).toBe(false);
  });

  it("is false when another card is opened by navigation", () => {
    // Regression test: following a wiki link from card A to card B changes
    // both id and title. Rewriting the URL here overwrote A's history entry
    // and made the browser's back button need two presses.
    expect(
      isRenameOfOpenCard({ id: "a", title: "A" }, { id: "b", title: "B" }),
    ).toBe(false);
  });

  it("is false when a card is opened from the card list", () => {
    expect(isRenameOfOpenCard({}, { id: "a", title: "A" })).toBe(false);
  });

  it("is false when the open card's title was not known before", () => {
    expect(isRenameOfOpenCard({ id: "a" }, { id: "a", title: "A" })).toBe(
      false,
    );
  });

  it("is false when the title is not available", () => {
    expect(isRenameOfOpenCard({ id: "a", title: "A" }, { id: "a" })).toBe(
      false,
    );
  });

  it("is false when the card is closed", () => {
    expect(isRenameOfOpenCard({ id: "a", title: "A" }, {})).toBe(false);
  });
});
