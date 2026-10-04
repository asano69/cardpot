import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchLinks1Hop, fetchRelatedCards } from "../api/cardApi";
import type { LinkedCard } from "../api/generated";
import {
  closeRelated,
  openRelated,
  related,
  setOwnLinks,
} from "./relatedStore";

vi.mock("../api/cardApi", () => ({
  fetchLinks1Hop: vi.fn(),
  fetchLinks2Hop: vi.fn(async () => []),
  fetchRelatedCards: vi.fn(async () => []),
}));

vi.mock("../dexie/cardLinksCollection", () => ({
  readOwnLinks: vi.fn(async () => []),
}));

function linked(id: string): LinkedCard {
  return {
    id,
    title: id,
    titleLc: id,
    description: [],
    image: "",
    pin: false,
    target_titleLc: [],
  } as LinkedCard;
}

beforeEach(() => {
  closeRelated();
  vi.mocked(fetchLinks1Hop).mockReset();
});

describe("relatedStore", () => {
  it("stores the loaded cards with their ids", async () => {
    vi.mocked(fetchLinks1Hop).mockResolvedValueOnce([linked("a")]);
    await openRelated("pot", "A");
    expect(related.oneHop.map((c) => c.id)).toEqual(["a"]);
    expect(related.error).toBe(false);
    expect(related.loaded).toBe(true);
  });

  it("drops a stale response that arrives after a newer load", async () => {
    let resolveFirst!: (cards: LinkedCard[]) => void;
    vi.mocked(fetchLinks1Hop)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockResolvedValueOnce([linked("b")]);

    const first = openRelated("pot", "A");
    await openRelated("pot", "B");
    resolveFirst([linked("a")]);
    await first;

    expect(related.oneHop.map((c) => c.id)).toEqual(["b"]);
  });

  it("empties the store on close and ignores a load still in flight", async () => {
    let resolve!: (cards: LinkedCard[]) => void;
    vi.mocked(fetchLinks1Hop).mockReturnValueOnce(
      new Promise((r) => {
        resolve = r;
      }),
    );

    const loading = openRelated("pot", "A");
    closeRelated();
    resolve([linked("a")]);
    await loading;

    expect(related.oneHop).toEqual([]);
    expect(related.loaded).toBe(false);
  });

  it("keeps every list an array when a response has no cards", async () => {
    // Regression test: Solid's store deletes a property set to undefined, so
    // a missing list used to crash the view and show the error message.
    vi.mocked(fetchLinks1Hop).mockResolvedValueOnce([linked("a")]);
    vi.mocked(fetchRelatedCards).mockResolvedValueOnce(
      undefined as unknown as [],
    );
    await openRelated("pot", "A", "card1");
    expect(related.query).toEqual([]);
    expect(related.error).toBe(false);
  });

  it("keeps the live links when a load finishes after them", async () => {
    vi.mocked(fetchLinks1Hop).mockResolvedValueOnce([]);
    const loading = openRelated("pot", "A", "card1");
    setOwnLinks("p", [{ title: "X", titleLc: "x" }]);
    await loading;
    expect(related.ownLinks.map((l) => l.target_titleLc)).toEqual(["x"]);
  });

  it("goes back to the replica after the card is closed", async () => {
    setOwnLinks("p", [{ title: "X", titleLc: "x" }]);
    closeRelated();
    expect(related.ownLinks).toEqual([]);
    vi.mocked(fetchLinks1Hop).mockResolvedValueOnce([]);
    await openRelated("pot", "A", "card1"); // the mocked replica has no rows
    expect(related.ownLinks).toEqual([]);
  });

  it("flags an error when a request fails", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetchLinks1Hop).mockRejectedValueOnce(new Error("offline"));
    await openRelated("pot", "A");
    logged.mockRestore();
    expect(related.error).toBe(true);
  });
});
