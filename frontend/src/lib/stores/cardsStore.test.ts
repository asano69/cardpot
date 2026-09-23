import { describe, expect, it, vi } from "vitest";
import type { CardEvent } from "../api/cardApi";
import type { CardRecord } from "../models/card";

const api = vi.hoisted(() => ({
  fetchCardsPage: vi.fn(),
  fetchCardBySlug: vi.fn(),
  subscribeToCards: vi.fn(),
  deleteCard: vi.fn(),
  updateCard: vi.fn(),
}));
vi.mock("../api/cardApi", () => api);

import {
  cardsById,
  loadNextCardsPage,
  potWindow,
  releasePot,
  startCardsSubscription,
} from "./cardsStore";

// Each test uses its own pot id: the store is module-level state.

function card(id: string, pot: string, position = 1): CardRecord {
  return {
    id,
    pot,
    position,
    title: id,
    description: "",
    image: "",
    pin: false,
    created: "",
    updated: "",
  } as CardRecord;
}

// Cards "<pot>-<from>" up to (not including) "<pot>-<to>".
function cards(pot: string, from: number, to: number): CardRecord[] {
  return Array.from({ length: to - from }, (_, i) =>
    card(`${pot}-${from + i}`, pot),
  );
}

function nextPage(items: CardRecord[], totalItems: number) {
  api.fetchCardsPage.mockResolvedValueOnce({ items, totalItems });
}

// Starts the realtime subscription and returns a function that
// delivers an event to it.
function realtime(): (action: string, record: CardRecord) => void {
  let handler: (event: CardEvent) => void = () => {};
  api.subscribeToCards.mockImplementationOnce(async (h) => {
    handler = h;
    return () => {};
  });
  startCardsSubscription();
  return (action, record) => handler({ action, record });
}

describe("loadNextCardsPage", () => {
  it("requests the page holding the window's end, so a deletion skips no card", async () => {
    const emit = realtime();
    nextPage(cards("a", 0, 100), 150);
    await loadNextCardsPage("a");

    emit("delete", card("a-5", "a"));
    expect(potWindow("a")?.ids).toHaveLength(99);

    // The server's list shifted up: a-100 is now at index 99.
    nextPage([...cards("a", 0, 5), ...cards("a", 6, 101)], 149);
    await loadNextCardsPage("a");

    expect(api.fetchCardsPage).toHaveBeenLastCalledWith("a", 1, 100);
    expect(potWindow("a")?.ids).toHaveLength(100);
    expect(cardsById["a-100"]).toBeDefined();
  });

  it("treats the window as complete when a page adds nothing new", async () => {
    nextPage(cards("b", 0, 100), 300);
    await loadNextCardsPage("b");
    nextPage(cards("b", 0, 100), 300);
    await loadNextCardsPage("b");
    expect(potWindow("b")?.total).toBe(100);

    api.fetchCardsPage.mockClear();
    await loadNextCardsPage("b");
    expect(api.fetchCardsPage).not.toHaveBeenCalled();
  });
});

describe("realtime events", () => {
  it("ignores events for cards the store does not hold", () => {
    const emit = realtime();
    emit("create", card("c-1", "c"));
    emit("update", card("c-2", "c"));
    expect(cardsById["c-1"]).toBeUndefined();
    expect(cardsById["c-2"]).toBeUndefined();
  });

  it("counts a created and a deleted card once", async () => {
    const emit = realtime();
    nextPage(cards("d", 0, 2), 2);
    await loadNextCardsPage("d");

    emit("create", card("d-new", "d"));
    emit("create", card("d-new", "d"));
    expect(potWindow("d")?.total).toBe(3);

    emit("delete", card("d-new", "d"));
    emit("delete", card("d-new", "d"));
    expect(potWindow("d")?.total).toBe(2);
    expect(cardsById["d-new"]).toBeUndefined();
  });

  it("applies an update to a held card", async () => {
    const emit = realtime();
    nextPage(cards("e", 0, 1), 1);
    await loadNextCardsPage("e");

    emit("update", card("e-0", "e", 5));
    expect(cardsById["e-0"].position).toBe(5);
  });
});

describe("releasePot", () => {
  it("drops the window and every card of the pot", async () => {
    nextPage(cards("f", 0, 3), 3);
    await loadNextCardsPage("f");
    expect(cardsById["f-0"]).toBeDefined();

    releasePot("f");
    expect(potWindow("f")).toBeUndefined();
    expect(cardsById["f-0"]).toBeUndefined();
  });

  it("is not undone by a page that arrives after the release", async () => {
    let resolve!: (value: unknown) => void;
    api.fetchCardsPage.mockReturnValueOnce(
      new Promise((r) => {
        resolve = r;
      }),
    );
    const loading = loadNextCardsPage("g");
    releasePot("g");
    resolve({ items: cards("g", 0, 2), totalItems: 2 });
    await loading;

    expect(potWindow("g")).toBeUndefined();
    expect(cardsById["g-0"]).toBeUndefined();
  });
});
