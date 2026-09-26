import { Collection } from "@signaldb/core";
import createIndexedDBAdapter from "@signaldb/indexeddb";
import type { CardRecord } from "../models/card";
import type { Checkpoint } from "../api/replication";

// IndexedDB-backed local replica of each pot's cards, kept fully up to
// date via the checkpoint pull protocol (see lib/api/replication.ts
// and cardsStore.ts's ensurePotSynced/syncPotReplica). Once a pot has
// synced, cardsStore.ts's loadNextCardsPage pages through this cache
// locally (see queryCardsPage/countCards below) instead of the
// server, so windowed pagination for large pots stays fast without
// re-fetching everything on scroll. The Solid store in cardsStore.ts
// remains the reactive source the UI actually renders from -- this
// collection is written to and read from only inside cardsStore.ts's
// own functions, never bound directly to the UI.
//
// Named distinctly from the earlier SyncManager-based collections
// ("cards-<pot>", "cards-sync-v2-...") so a browser that still has
// that old, buggy IndexedDB data lying around starts this cache fresh
// instead of inheriting anything from it.
const collections = new Map<string, Collection<CardRecord>>();

function cacheFor(potId: string): Collection<CardRecord> {
  let collection = collections.get(potId);
  if (!collection) {
    // No reactivity adapter: every read below (queryCardsPage, countCards)
    // passes reactive: false, since the reactive source the UI actually
    // renders from is the Solid store in cardsStore.ts, not this
    // collection directly.
    collection = new Collection<CardRecord>({
      name: `cards-cache:${potId}`,
      persistence: createIndexedDBAdapter<CardRecord, string>(
        `cards-cache-${potId}`,
      ),
    });
    collections.set(potId, collection);
  }
  return collection;
}

// Returns up to `limit` cards from potId's cache, starting after
// `skip` cards, sorted the same way the UI grid displays them (pinned
// first, then descending position, with id as a tiebreak -- mirrors
// the server's old CARDS_SORT). Used by cardsStore.ts's
// loadNextCardsPage to page through the cache locally instead of over
// the network, now that the cache is kept fully up to date by the
// checkpoint pull protocol (see ensurePotSynced there).
export async function queryCardsPage(
  potId: string,
  skip: number,
  limit: number,
): Promise<CardRecord[]> {
  const collection = cacheFor(potId);
  await collection.isReady();
  return collection
    .find(
      {},
      { sort: { pin: -1, position: -1, id: 1 }, skip, limit, reactive: false },
    )
    .fetch();
}

// Total number of cards currently cached for potId.
export async function countCards(potId: string): Promise<number> {
  const collection = cacheFor(potId);
  await collection.isReady();
  return collection.find({}, { reactive: false }).count();
}

// Write-through: mirrors a batch of cards into potId's cache.
// Fire-and-forget -- a failure here must never block the caller (e.g.
// applying a realtime event or a pulled diff).
//
// Awaits isReady() first: a collection cacheFor() has only just
// created hasn't hydrated its in-memory state from IndexedDB yet, and
// mutating it before that finishes is a no-op that the hydration then
// silently overwrites once it completes -- e.g. deleting a card on a
// page that opens a card straight from a URL, without ever calling
// queryCardsPage/countCards for that pot first, would never actually
// reach IndexedDB, and the card would reappear next time this cache
// is read.
export async function writeCache(
  potId: string,
  records: CardRecord[],
): Promise<void> {
  const collection = cacheFor(potId);
  await collection.isReady();
  for (const record of records) {
    collection.replaceOne({ id: record.id }, record, { upsert: true });
  }
}

// See writeCache's own comment above on awaiting isReady() first.
export async function deleteFromCache(potId: string, id: string): Promise<void> {
  const collection = cacheFor(potId);
  await collection.isReady();
  collection.removeOne({ id });
}

// Drops potId's in-memory Collection handle when the pot is left.
// Its IndexedDB data is left untouched, so it's still there to
// hydrate from next time the pot is opened.
export function forgetCache(potId: string): void {
  collections.delete(potId);
}

// One record per pot, storing the checkpoint pullAll (see
// lib/api/replication.ts) should resume from next time. Kept in its
// own collection rather than a field on cacheFor's per-pot collection:
// the checkpoint is a different concern from the cards themselves, and
// this lets it be read/written without touching the card cache at all.
// Shared across every pot, so it's created eagerly rather than lazily
// like cacheFor's per-pot collections.
interface CheckpointRecord {
  id: string; // potId -- this collection's own primary key
  updatedAt: string;
  recordId: string; // Checkpoint.id, renamed to avoid clashing with `id` above
}

// No reactivity adapter here either -- see cacheFor's own comment above;
// readCheckpoint always passes reactive: false.
const checkpoints = new Collection<CheckpointRecord>({
  name: "cards-cache-checkpoints",
  persistence: createIndexedDBAdapter<CheckpointRecord, string>(
    "cards-cache-checkpoints",
  ),
});

// Returns the checkpoint stored for potId, or null when this pot has
// never been pulled before (a fresh replica, or one from before this
// feature existed).
export async function readCheckpoint(
  potId: string,
): Promise<Checkpoint | null> {
  await checkpoints.isReady();
  const [record] = checkpoints
    .find({ id: potId }, { reactive: false })
    .fetch();
  return record ? { updatedAt: record.updatedAt, id: record.recordId } : null;
}

// Persists the checkpoint to resume potId's next pull from.
export async function writeCheckpoint(
  potId: string,
  checkpoint: Checkpoint,
): Promise<void> {
  await checkpoints.isReady();
  checkpoints.replaceOne(
    { id: potId },
    { id: potId, updatedAt: checkpoint.updatedAt, recordId: checkpoint.id },
    { upsert: true },
  );
}
