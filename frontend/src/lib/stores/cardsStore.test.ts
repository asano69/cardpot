import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CardDbRecord } from "../dexie/database";

// Everything cardsStore reaches outside itself is replaced here, so
// these tests exercise only the store's own logic: no IndexedDB, no
// network, no DOM.
const mocks = vi.hoisted(() => ({
  startCardsReplication: vi.fn(),
  updateCard: vi.fn(),
  deleteCard: vi.fn(),
  db: undefined as unknown,
}));

vi.mock("dexie", () => ({
  liveQuery: (query: () => FakeDoc[]) => ({
    subscribe: (onValue: (value: FakeDoc[]) => void) =>
      docs$.subscribe(() => onValue(query())),
  }),
}));

vi.mock("../dexie/database", () => ({
  get db() {
    return mocks.db;
  },
}));
vi.mock("../dexie/cardsReplication", () => ({
  startCardsReplication: mocks.startCardsReplication,
}));
vi.mock("../api/cardApi", () => ({
  updateCard: mocks.updateCard,
  deleteCard: mocks.deleteCard,
}));

import {
  cardsById,
  ensurePotLoaded,
  findCardByPotAndSlug,
  mergeCards,
  moveCard,
  potWindow,
  releasePot,
  removeCard,
  setCardPinned,
} from "./cardsStore";

// The only part of a Dexie record the store reads.
type FakeDoc = CardDbRecord;

function fakeDoc(
  potId: string,
  n: number,
  overrides: Partial<CardDbRecord> = {},
): FakeDoc {
  const data: CardDbRecord = {
    id: `${potId}-card${n}`,
    pot: potId,
    title: `Card ${n}`,
    description: "",
    image: "",
    position: n * 1000,
    pin: false,
    updated: "2026-01-01 00:00:00.000Z",
    ...overrides,
  };
  return data;
}

// Stands in for Dexie's liveQuery: it emits each pot's current records and every later change.
class TestSubject<T> {
  private observers = new Set<(value: T) => void>();

  constructor(public value: T) {}

  get observed(): boolean {
    return this.observers.size > 0;
  }

  next(value: T): void {
    this.value = value;
    for (const observer of this.observers) observer(value);
  }

  subscribe(observer: (value: T) => void): { unsubscribe: () => void } {
    this.observers.add(observer);
    observer(this.value);
    return { unsubscribe: () => this.observers.delete(observer) };
  }
}

let docs$: TestSubject<FakeDoc[]>;
let stopReplication: ReturnType<typeof vi.fn>;

// The store keeps module-level state, so each test uses its own pot id
// instead of resetting modules (which would load Solid twice).
let potCounter = 0;
const usedPots = new Set<string>();

function newPot(): string {
  const id = `pot${++potCounter}`;
  usedPots.add(id);
  return id;
}

beforeEach(() => {
  vi.resetAllMocks();
  docs$ = new TestSubject<FakeDoc[]>([]);
  stopReplication = vi.fn();
  mocks.db = {
    cards: {
      where: () => ({
        equals: (potId: string) => ({
          toArray: () => docs$.value.filter((doc) => doc.pot === potId),
        }),
      }),
    },
  };
  mocks.startCardsReplication.mockImplementation(() => ({
    initialReplication: Promise.resolve(),
    stopReplication,
  }));
});

afterEach(() => {
  for (const id of usedPots) releasePot(id);
  usedPots.clear();
  vi.restoreAllMocks();
});

describe("ensurePotLoaded", () => {
  it("mirrors the pot's local cards into the store", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1), fakeDoc(pot, 2)]);

    await ensurePotLoaded(pot);

    expect(potWindow(pot)).toEqual({
      ids: [`${pot}-card1`, `${pot}-card2`],
      total: 2,
      loaded: true,
    });
    expect(cardsById[`${pot}-card1`]).toMatchObject({
      id: `${pot}-card1`,
      pot,
      title: "Card 1",
      position: 1000,
      pin: false,
      deleted: "",
    });
  });

  it("starts replication only once per pot", async () => {
    const pot = newPot();

    const first = ensurePotLoaded(pot);
    const second = ensurePotLoaded(pot);
    await first;

    expect(second).toBe(first);
    expect(mocks.startCardsReplication).toHaveBeenCalledTimes(1);
    expect(mocks.startCardsReplication).toHaveBeenCalledWith(pot);
  });

  it("follows later changes of the local replica", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1), fakeDoc(pot, 2)]);
    await ensurePotLoaded(pot);

    // Card 1 is renamed, card 2 disappears, card 3 arrives.
    docs$.next([fakeDoc(pot, 1, { title: "Renamed" }), fakeDoc(pot, 3)]);

    expect(cardsById[`${pot}-card1`].title).toBe("Renamed");
    expect(cardsById[`${pot}-card2`]).toBeUndefined();
    expect(cardsById[`${pot}-card3`]).toBeDefined();
    expect(potWindow(pot)?.total).toBe(2);
  });

  it("keeps pots independent of each other", async () => {
    const potA = newPot();
    const potB = newPot();
    docs$.next([fakeDoc(potA, 1), fakeDoc(potB, 1)]);
    await ensurePotLoaded(potA);
    await ensurePotLoaded(potB);

    // Pot A loses its card; pot B's card must stay.
    docs$.next([fakeDoc(potB, 1)]);

    expect(cardsById[`${potA}-card1`]).toBeUndefined();
    expect(cardsById[`${potB}-card1`]).toBeDefined();
  });
});

describe("releasePot", () => {
  it("stops replication and drops the pot's cards", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1)]);
    await ensurePotLoaded(pot);

    releasePot(pot);

    expect(stopReplication).toHaveBeenCalledTimes(1);
    expect(potWindow(pot)).toBeUndefined();
    expect(cardsById[`${pot}-card1`]).toBeUndefined();

    // The query subscription is gone, so later changes are ignored.
    docs$.next([fakeDoc(pot, 1), fakeDoc(pot, 2)]);
    expect(cardsById[`${pot}-card2`]).toBeUndefined();
  });

  it("leaves other pots alone", async () => {
    const potA = newPot();
    const potB = newPot();
    docs$.next([fakeDoc(potA, 1), fakeDoc(potB, 1)]);
    await ensurePotLoaded(potA);
    await ensurePotLoaded(potB);

    releasePot(potA);

    expect(cardsById[`${potB}-card1`]).toBeDefined();
    expect(potWindow(potB)?.total).toBe(1);
  });

  it("still stops everything when called before setup finishes", async () => {
    const pot = newPot();

    const ready = ensurePotLoaded(pot);
    releasePot(pot); // setup is still waiting for the database here
    await ready;

    expect(stopReplication).toHaveBeenCalledTimes(1);
    expect(docs$.observed).toBe(false);
  });
});

describe("findCardByPotAndSlug", () => {
  it("resolves a card by the slug of its title, within its own pot", async () => {
    const potA = newPot();
    const potB = newPot();
    docs$.next([
      fakeDoc(potA, 1, { title: "Hello World" }),
      fakeDoc(potB, 1, { title: "Hello World" }),
    ]);
    await ensurePotLoaded(potA);
    await ensurePotLoaded(potB);

    expect(findCardByPotAndSlug(potA, "Hello_World")?.id).toBe(`${potA}-card1`);
    expect(findCardByPotAndSlug(potB, "Hello_World")?.id).toBe(`${potB}-card1`);
    expect(findCardByPotAndSlug(potA, "missing")).toBeUndefined();
  });
});

describe("mergeCards", () => {
  it("makes a fresh card readable before the replica echoes it", async () => {
    const pot = newPot();
    await ensurePotLoaded(pot);

    mergeCards([
      {
        id: `${pot}-new`,
        title: "New" as never,
        description: "",
        image: "",
        pot,
        position: 1000,
        pin: false,
        deleted: "",
        created: "",
        updated: "",
      },
    ]);

    expect(cardsById[`${pot}-new`]?.title).toBe("New");
  });
});

describe("moveCard", () => {
  it("applies the new position at once and persists it", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1)]);
    await ensurePotLoaded(pot);
    const id = `${pot}-card1`;
    mocks.updateCard.mockResolvedValue(undefined);

    moveCard(cardsById[id], 5000);

    expect(cardsById[id].position).toBe(5000);
    expect(mocks.updateCard).toHaveBeenCalledWith(id, { position: 5000 });
  });

  it("rolls the position back when persisting fails", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1)]);
    await ensurePotLoaded(pot);
    const id = `${pot}-card1`;
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.updateCard.mockRejectedValue(new Error("offline"));

    moveCard(cardsById[id], 5000);
    expect(cardsById[id].position).toBe(5000);

    await vi.waitFor(() => expect(cardsById[id].position).toBe(1000));
  });
});

describe("setCardPinned", () => {
  // Echoes the changes back like the real server does.
  function echoUpdates() {
    mocks.updateCard.mockImplementation(async (id, changes) => ({
      ...cardsById[id],
      ...changes,
    }));
  }

  it("pins to the first position when nothing else is pinned", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1)]);
    await ensurePotLoaded(pot);
    const id = `${pot}-card1`;
    echoUpdates();

    await setCardPinned(id, true);

    expect(mocks.updateCard).toHaveBeenCalledWith(id, {
      pin: true,
      position: 1000,
    });
    expect(cardsById[id].pin).toBe(true);
  });

  it("pins above the lowest pinned card", async () => {
    const pot = newPot();
    docs$.next([
      fakeDoc(pot, 1, { pin: true, position: 400 }),
      fakeDoc(pot, 2),
    ]);
    await ensurePotLoaded(pot);
    const id = `${pot}-card2`;
    echoUpdates();

    await setCardPinned(id, true);

    expect(mocks.updateCard).toHaveBeenCalledWith(id, {
      pin: true,
      position: 200,
    });
  });

  it("unpins without touching the position", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1, { pin: true })]);
    await ensurePotLoaded(pot);
    const id = `${pot}-card1`;
    echoUpdates();

    await setCardPinned(id, false);

    expect(mocks.updateCard).toHaveBeenCalledWith(id, { pin: false });
    expect(cardsById[id].pin).toBe(false);
  });

  it("rejects and leaves the store unchanged when the request fails", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1)]);
    await ensurePotLoaded(pot);
    const id = `${pot}-card1`;
    mocks.updateCard.mockRejectedValue(new Error("offline"));

    await expect(setCardPinned(id, true)).rejects.toThrow("offline");

    expect(cardsById[id].pin).toBe(false);
  });
});

describe("removeCard", () => {
  it("soft-deletes the card and drops it from the store", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1)]);
    await ensurePotLoaded(pot);
    const id = `${pot}-card1`;
    mocks.deleteCard.mockResolvedValue(undefined);

    await removeCard(id);

    expect(mocks.deleteCard).toHaveBeenCalledWith(id);
    expect(cardsById[id]).toBeUndefined();
  });

  it("keeps the card when the request fails", async () => {
    const pot = newPot();
    docs$.next([fakeDoc(pot, 1)]);
    await ensurePotLoaded(pot);
    const id = `${pot}-card1`;
    mocks.deleteCard.mockRejectedValue(new Error("offline"));

    await expect(removeCard(id)).rejects.toThrow("offline");

    expect(cardsById[id]).toBeDefined();
  });
});
