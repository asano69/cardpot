import { describe, expect, it, vi, type Mock } from "vitest";
import pb from "../api/pb";
import { subscribeToPotCards } from "../api/realtime";
import type { CardEvent } from "../api/cardApi";
import type { CardRecord } from "../models/card";

import {
  cardsById,
  loadNextCardsPage,
  potWindow,
  releasePot,
  resyncPot,
  watchPot,
} from "./cardsStore";

// The realtime module is replaced wholesale: it wraps the centrifuge SDK,
// which needs a live server. Tests capture the handlers watchPot passes in
// and call them directly (see watch below).
vi.mock("../api/realtime", () => ({
  subscribeToPotCards: vi.fn(() => () => {}),
}));

// The store reaches the server's card list only through PocketBase's
// "cards" service (see api/cardApi.ts), which pb.collection() caches as one
// instance. Spying on that instance replaces the network without mocking
// any module.
const getList = vi.spyOn(pb.collection("cards"), "getList") as unknown as Mock;

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
    deleted: "",
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
  getList.mockResolvedValueOnce({ items, totalItems });
}

// Watches `potId` and returns functions that deliver a realtime event, or a
// "gap detected" signal, to the store the way the realtime module would.
function watch(potId: string) {
  let onEvent: (event: CardEvent) => void = () => {};
  let onResync: () => void = () => {};
  vi.mocked(subscribeToPotCards).mockImplementationOnce(
    (_potId, event, resync) => {
      onEvent = event;
      onResync = resync;
      return () => {};
    },
  );
  watchPot(potId);
  return {
    emit: (action: string, record: CardRecord) => onEvent({ action, record }),
    resync: () => onResync(),
  };
}

describe("loadNextCardsPage", () => {
  it("asks the server only for cards that are not deleted", async () => {
    nextPage(cards("n", 0, 1), 1);
    await loadNextCardsPage("n");
    expect(getList.mock.lastCall?.[2].filter).toContain('deleted = ""');
  });

  it("requests the page holding the window's end, so a deletion skips no card", async () => {
    const { emit } = watch("a");
    nextPage(cards("a", 0, 100), 150);
    await loadNextCardsPage("a");

    emit("delete", card("a-5", "a"));
    expect(potWindow("a")?.ids).toHaveLength(99);

    // The server's list shifted up: a-100 is now at index 99.
    nextPage([...cards("a", 0, 5), ...cards("a", 6, 101)], 149);
    await loadNextCardsPage("a");

    expect(getList).toHaveBeenLastCalledWith(1, 100, expect.anything());
    expect(potWindow("a")?.ids).toHaveLength(100);
    expect(cardsById["a-100"]).toBeDefined();
  });

  it("treats the window as complete when a page adds nothing new", async () => {
    nextPage(cards("b", 0, 100), 300);
    await loadNextCardsPage("b");
    nextPage(cards("b", 0, 100), 300);
    await loadNextCardsPage("b");
    expect(potWindow("b")?.total).toBe(100);

    getList.mockClear();
    await loadNextCardsPage("b");
    expect(getList).not.toHaveBeenCalled();
  });
});

describe("realtime events", () => {
  it("ignores events for cards the store does not hold", () => {
    const { emit } = watch("c");
    emit("create", card("c-1", "c"));
    emit("update", card("c-2", "c"));
    expect(cardsById["c-1"]).toBeUndefined();
    expect(cardsById["c-2"]).toBeUndefined();
  });

  it("counts a created and a deleted card once", async () => {
    const { emit } = watch("d");
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
    const { emit } = watch("e");
    nextPage(cards("e", 0, 1), 1);
    await loadNextCardsPage("e");

    emit("update", card("e-0", "e", 5));
    expect(cardsById["e-0"].position).toBe(5);
  });

  it("drops a card once an update event marks it deleted", async () => {
    const { emit } = watch("m");
    nextPage(cards("m", 0, 2), 2);
    await loadNextCardsPage("m");

    emit("update", {
      ...card("m-0", "m"),
      deleted: "2026-09-24 00:00:00.000Z",
    });
    expect(cardsById["m-0"]).toBeUndefined();
    expect(potWindow("m")?.ids).toEqual(["m-1"]);
    expect(potWindow("m")?.total).toBe(1);
  });

  it("ignores a created card that is already deleted", async () => {
    const { emit } = watch("o");
    nextPage(cards("o", 0, 1), 1);
    await loadNextCardsPage("o");

    emit("create", {
      ...card("o-new", "o"),
      deleted: "2026-09-24 00:00:00.000Z",
    });
    expect(cardsById["o-new"]).toBeUndefined();
    expect(potWindow("o")?.total).toBe(1);
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
    getList.mockReturnValueOnce(
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

describe("resyncPot", () => {
  it("replaces the window with fresh data and drops vanished cards", async () => {
    nextPage(cards("h", 0, 3), 3);
    await loadNextCardsPage("h");

    // h-0 was deleted and h-3 created while events were missed.
    nextPage(cards("h", 1, 4), 3);
    await resyncPot("h");

    expect(potWindow("h")?.ids).toEqual(["h-1", "h-2", "h-3"]);
    expect(potWindow("h")?.total).toBe(3);
    expect(cardsById["h-0"]).toBeUndefined();
    expect(cardsById["h-3"]).toBeDefined();
  });

  it("reloads every page the window covers", async () => {
    nextPage(cards("i", 0, 100), 250);
    await loadNextCardsPage("i");
    nextPage(cards("i", 100, 200), 250);
    await loadNextCardsPage("i");

    getList.mockClear();
    nextPage(cards("i", 0, 100), 251);
    nextPage(cards("i", 100, 200), 251);
    await resyncPot("i");

    expect(getList).toHaveBeenCalledTimes(2);
    expect(getList).toHaveBeenNthCalledWith(1, 1, 100, expect.anything());
    expect(getList).toHaveBeenNthCalledWith(2, 2, 100, expect.anything());
    expect(potWindow("i")?.total).toBe(251);
  });

  it("does nothing while nothing is loaded", async () => {
    getList.mockClear();
    await resyncPot("j");
    expect(getList).not.toHaveBeenCalled();
  });

  it("leaves the window untouched when a request fails", async () => {
    nextPage(cards("k", 0, 2), 2);
    await loadNextCardsPage("k");

    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    getList.mockRejectedValueOnce(new Error("offline"));
    await resyncPot("k");
    logged.mockRestore();

    expect(potWindow("k")?.ids).toEqual(["k-0", "k-1"]);
    expect(cardsById["k-0"]).toBeDefined();
  });

  it("runs when the realtime channel reports a gap", async () => {
    const { resync } = watch("l");
    nextPage(cards("l", 0, 2), 2);
    await loadNextCardsPage("l");

    nextPage(cards("l", 1, 3), 2);
    resync();

    await vi.waitFor(() => expect(potWindow("l")?.ids).toEqual(["l-1", "l-2"]));
  });
});
