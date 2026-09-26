// Polyfills window.indexedDB / IDBKeyRange so Dexie can run against a
// real (in-memory) IndexedDB implementation under vitest, matching
// what a browser provides.
import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import type { CardRecord } from "../models/card";
import {
  countCards,
  deleteFromCache,
  queryCardsPage,
  readCheckpoint,
  writeCache,
  writeCheckpoint,
} from "./cardsCollection";

function card(
  id: string,
  pot: string,
  position: number,
  pin = false,
): CardRecord {
  return {
    id,
    title: id as CardRecord["title"],
    description: "",
    image: "",
    pot,
    position,
    pin,
    deleted: "",
    created: "",
    updated: "",
  };
}

describe("Dexie cards cache", () => {
  it("writes, pages, counts, and deletes cards", async () => {
    await writeCache("pot-1", [
      card("a", "pot-1", 1000),
      card("b", "pot-1", 2000),
    ]);

    expect(await countCards("pot-1")).toBe(2);
    // Descending position -- "b" (2000) sorts before "a" (1000).
    expect(
      (await queryCardsPage("pot-1", 0, 10)).map((c) => c.id),
    ).toEqual(["b", "a"]);

    await deleteFromCache("pot-1", "a");
    expect(await countCards("pot-1")).toBe(1);
    expect(
      (await queryCardsPage("pot-1", 0, 10)).map((c) => c.id),
    ).toEqual(["b"]);
  });

  it("sorts pinned cards before unpinned ones regardless of position", async () => {
    await writeCache("pot-2", [
      card("x", "pot-2", 5000, false),
      card("y", "pot-2", 100, true),
    ]);

    expect(
      (await queryCardsPage("pot-2", 0, 10)).map((c) => c.id),
    ).toEqual(["y", "x"]);
  });

  it("persists and overwrites a pot's checkpoint", async () => {
    expect(await readCheckpoint("pot-3")).toBeNull();

    await writeCheckpoint("pot-3", { updatedAt: "t1", id: "c1" });
    expect(await readCheckpoint("pot-3")).toEqual({
      updatedAt: "t1",
      id: "c1",
    });

    await writeCheckpoint("pot-3", { updatedAt: "t2", id: "c2" });
    expect(await readCheckpoint("pot-3")).toEqual({
      updatedAt: "t2",
      id: "c2",
    });
  });
});
