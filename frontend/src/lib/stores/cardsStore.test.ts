import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Collection } from "@signaldb/core";
import solidReactivityAdapter from "@signaldb/solid";
import type { CardRecord } from "../models/card";

const mocked = vi.hoisted(() => ({
  start: undefined as undefined | ((potId: string) => unknown),
}));
vi.mock("../dexie/cardsReplication", () => ({
  startCardsReplication: (potId: string) => mocked.start!(potId),
}));

import {
  cardById,
  cardsForPot,
  ensurePotLoaded,
  mergeCards,
  moveCard,
  releasePot,
  removeCard,
  setCardPinned,
} from "./cardsStore";

let sequence = 0;
const collections = new Map<string, Collection<CardRecord>>();
beforeEach(() => {
  mocked.start = (potId) => {
    const collection = new Collection<CardRecord>({
      reactivity: solidReactivityAdapter,
    });
    collections.set(potId, collection);
    return {
      collection,
      initialReplication: Promise.resolve(),
      stopReplication: vi.fn(),
    };
  };
});
function card(pot: string, id = `card-${++sequence}`): CardRecord {
  return {
    id,
    pot,
    title: "Card" as CardRecord["title"],
    description: "",
    image: "",
    position: 1000,
    pin: false,
    deleted: "",
    created: "",
    updated: "",
  };
}

afterEach(() => {
  for (const potId of collections.keys()) releasePot(potId);
  collections.clear();
  vi.clearAllMocks();
});

describe("cardsStore SignalDB facade", () => {
  it("reads cards directly from the pot collection", async () => {
    await ensurePotLoaded("pot-a");
    mergeCards([card("pot-a", "a")]);
    expect(cardsForPot("pot-a").map(({ id }) => id)).toEqual(["a"]);
    expect(cardById("a")?.pot).toBe("pot-a");
  });

  it("updates and removes local records optimistically", async () => {
    await ensurePotLoaded("pot-a");
    const record = card("pot-a", "a");
    mergeCards([record]);
    moveCard(record, 2000);
    await setCardPinned("a", true);
    expect(cardById("a")).toMatchObject({ position: 1000, pin: true });
    await removeCard("a");
    expect(cardById("a")).toBeUndefined();
  });
});
