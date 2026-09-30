import Dexie from "dexie";
import type { CardRecord } from "../models/card";
import { db, type CachedCard } from "./db";
import type { Replica } from "./replica";

// Cards-specific reads and writes on the IndexedDB replica (see db.ts),
// which is kept fully up to date via the checkpoint pull protocol (see
// replica.ts and cardsStore.ts's ensurePotSynced/syncPotReplica). Once a pot
// has synced, cardsStore.ts's loadNextCardsPage pages through this cache
// locally (see queryCardsPage/countCards below) instead of the server, so
// windowed pagination for large pots stays fast without re-fetching
// everything on scroll. The Solid store in cardsStore.ts remains the
// reactive source the UI actually renders from -- this module is written to
// and read from only inside cardsStore.ts's own functions, never bound
// directly to the UI.
//
// This module deliberately does not use Dexie's liveQuery(): every read here
// is a one-shot query, and cardsStore.ts is responsible for pushing results
// into the Solid store itself (see mergeCards there).

function toCached(record: CardRecord): CachedCard {
  return { ...record, pin: record.pin ? 1 : 0 };
}

function fromCached(record: CachedCard): CardRecord {
  return { ...record, pin: record.pin === 1 };
}

// Returns cards of potId whose "pin" matches `pin`, in position
// order, reading directly from the [pot+pin+position] compound index
// instead of scanning the whole table -- this is what makes
// queryCardsPage below an O(offset + limit) cursor walk rather than
// an O(M log M) sort of the pot's full row set. Dexie.minKey/
// Dexie.maxKey open the position bound on both ends, so the range
// always covers every stored position for (potId, pin). .reverse()
// flips the index's natural ascending order into the descending
// order the grid displays (highest position first).
function queryPinRange(
  potId: string,
  pin: 0 | 1,
  offset: number,
  limit: number,
): Promise<CachedCard[]> {
  if (limit <= 0) return Promise.resolve([]);
  return db.cards
    .where("[pot+pin+position]")
    .between([potId, pin, Dexie.minKey], [potId, pin, Dexie.maxKey])
    .reverse()
    .offset(offset)
    .limit(limit)
    .toArray();
}

// Returns up to `limit` cards from potId's cache, starting after
// `skip` cards, sorted the same way the UI grid displays them (pinned
// first, then descending position -- mirrors the server's own
// CARDS_SORT). Used by cardsStore.ts's loadNextCardsPage to page
// through the cache locally instead of over the network.
//
// Pinned and unpinned cards live on separate ranges of the
// [pot+pin+position] compound index (see queryPinRange above). A
// requested page is split across those two ranges instead of sorting
// the pot's full row set in JS: the pinned range's count decides how
// much of `skip`/`limit` falls on each side, then each side is read
// with its own offset/limit straight from the index. This makes a
// page request O(skip + limit) instead of O(M log M) in the pot's
// total row count M.
//
// One behavioral change from the old JS sort: two cards sharing the
// exact same position are no longer guaranteed to come back in id
// order (a compound index can only sort by all of its fields in the
// same direction). This is an accepted trade-off, since
// lib/position.ts's fractional indexing already keeps duplicate
// positions vanishingly rare, and CardList.tsx re-sorts whatever it
// renders anyway, so this only affects where a page boundary falls,
// never the final on-screen order.
export async function queryCardsPage(
  potId: string,
  skip: number,
  limit: number,
): Promise<CardRecord[]> {
  const pinnedCount = await db.cards
    .where("[pot+pin+position]")
    .between([potId, 1, Dexie.minKey], [potId, 1, Dexie.maxKey])
    .count();

  if (skip >= pinnedCount) {
    const unpinned = await queryPinRange(potId, 0, skip - pinnedCount, limit);
    return unpinned.map(fromCached);
  }

  const pinned = await queryPinRange(potId, 1, skip, limit);
  const unpinned = await queryPinRange(potId, 0, 0, limit - pinned.length);
  return [...pinned, ...unpinned].map(fromCached);
}

// Total number of cards currently cached for potId.
export async function countCards(potId: string): Promise<number> {
  return db.cards.where("pot").equals(potId).count();
}

// The write side of the cards replica. Used by the generic sync code (see
// replica.ts) and by cardsStore.ts's write-through of realtime events and
// local changes. Fire-and-forget from the store's point of view -- a failure
// here must never block whoever called this.
export const cardsReplica: Replica<CardRecord> = {
  name: "cards",
  put: async (records) => {
    await db.cards.bulkPut(records.map(toCached));
  },
  remove: (id) => db.cards.delete(id),
};
