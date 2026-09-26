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

  it("pages across the pinned/unpinned index-range boundary without gaps or duplicates", async () => {
    // 3 pinned cards (positions 0-2) and 5 unpinned cards (positions
    // 0-4) in the same pot -- large enough that page boundaries fall
    // both inside the pinned range and inside the unpinned range,
    // exercising queryPinRange's split for both of queryCardsPage's
    // branches (skip < pinnedCount and skip >= pinnedCount).
    const pinned = Array.from({ length: 3 }, (_, i) =>
      card(`pin-${i}`, "pot-3", i, true),
    );
    const unpinned = Array.from({ length: 5 }, (_, i) =>
      card(`unp-${i}`, "pot-3", i, false),
    );
    await writeCache("pot-3", [...pinned, ...unpinned]);

    const pageSize = 3;
    const pages: string[][] = [];
    for (let skip = 0; skip < 8; skip += pageSize) {
      const page = await queryCardsPage("pot-3", skip, pageSize);
      pages.push(page.map((c) => c.id));
    }

    const allIds = pages.flat();
    expect(allIds).toHaveLength(8);
    expect(new Set(allIds).size).toBe(8); // no duplicates across pages
    expect(allIds).toEqual([
      "pin-2",
      "pin-1",
      "pin-0",
      "unp-4",
      "unp-3",
      "unp-2",
      "unp-1",
      "unp-0",
    ]);
  });

  it("keeps every pinned card ahead of every unpinned card across a page split", async () => {
    const pinned = [card("p1", "pot-4", 1, true), card("p2", "pot-4", 2, true)];
    const unpinned = [
      card("u1", "pot-4", 100, false),
      card("u2", "pot-4", 200, false),
    ];
    await writeCache("pot-4", [...pinned, ...unpinned]);

    // A page starting inside the pinned range and ending inside the
    // unpinned one -- the exact split queryCardsPage must get right.
    const page = await queryCardsPage("pot-4", 1, 2);
    expect(page.map((c) => c.id)).toEqual(["p1", "u2"]);
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
