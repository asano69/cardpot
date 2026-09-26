import { Collection } from "@signaldb/core";
import createIndexedDBAdapter from "@signaldb/indexeddb";
import solidReactivityAdapter from "@signaldb/solid";
import type { CardRecord } from "../models/card";
import type { Checkpoint } from "../api/replication";

// Plain IndexedDB-backed cache of a pot's cards, used only to paint
// something immediately when a pot is (re)opened -- most importantly
// while offline. This is NOT a source of truth and is never synced
// back to the server. The real, authoritative store is
// cardsStore.ts's in-memory Solid store, kept live via Centrifuge
// (see lib/api/realtime.ts). The UI never reads from this collection
// reactively -- only a one-shot read on pot open (see readCache).
//
// Named distinctly from the earlier SyncManager-based collections
// ("cards-<pot>", "cards-sync-v2-...") so a browser that still has
// that old, buggy IndexedDB data lying around starts this cache fresh
// instead of inheriting anything from it.
const collections = new Map<string, Collection<CardRecord>>();

function cacheFor(potId: string): Collection<CardRecord> {
  let collection = collections.get(potId);
  if (!collection) {
    collection = new Collection<CardRecord>({
      name: `cards-cache:${potId}`,
      reactivity: solidReactivityAdapter,
      persistence: createIndexedDBAdapter<CardRecord, string>(
        `cards-cache-${potId}`,
      ),
    });
    collections.set(potId, collection);
  }
  return collection;
}

// Returns every card cached for potId, once the cache has hydrated
// from IndexedDB. Called once per pot, right before the first network
// fetch, so the pot can paint from cache immediately (see
// cardsStore.ts's loadNextCardsPage).
export async function readCache(potId: string): Promise<CardRecord[]> {
  const collection = cacheFor(potId);
  await collection.isReady();
  return collection.find({}, { reactive: false }).fetch();
}

// Write-through: mirrors a batch of cards into potId's cache.
// Fire-and-forget -- a failure here must never affect the live UI,
// which never reads from this cache directly.
//
// Awaits isReady() first, same as readCache above: a collection
// cacheFor() has only just created hasn't hydrated its in-memory
// state from IndexedDB yet, and mutating it before that finishes is a
// no-op that the hydration then silently overwrites once it
// completes -- e.g. deleting a card on a page that never called
// readCache for this pot (opening a card straight from a URL, never
// visiting its card list) would never actually reach IndexedDB, and
// the card would reappear next time this cache repaints from it.
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

const checkpoints = new Collection<CheckpointRecord>({
  name: "cards-cache-checkpoints",
  reactivity: solidReactivityAdapter,
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
