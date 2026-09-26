import type { Changeset, Collection } from "@signaldb/core";
import createIndexedDBAdapter from "@signaldb/indexeddb";
import solidReactivityAdapter from "@signaldb/solid";
import { SyncManager } from "@signaldb/sync";
import { deleteCard, updateCard } from "@/lib/api/cardApi";
import pb from "@/lib/api/pb";
import { subscribeToCards } from "@/lib/api/realtime";
import type { CardRecord } from "@/lib/models/card";
import {
  cardCheckpoints,
  createCardsCollection,
} from "@/lib/signaldb/cardsCollection";
import {
  withCardsFlip,
  withCardsFlipAsync,
  registerCardElement,
} from "../cardFlip";

const PULL_BATCH_SIZE = 200;
const lockName = (potId: string) => `cardpot:cards-replication:${potId}`;

interface PulledCardRecord extends CardRecord {
  deleted: string;
}
interface PullResponse {
  records: PulledCardRecord[];
}

// Whether two pulled/local card records carry the same data, aside
// from identity. Used below to skip re-applying a pulled record that
// already matches what this tab already has -- most commonly its own
// change echoed back through the pull API -- so it doesn't trigger a
// redundant write or FLIP re-animation.
function recordsEqual(a: CardRecord, b: CardRecord): boolean {
  return (
    a.title === b.title &&
    a.description === b.description &&
    a.image === b.image &&
    a.position === b.position &&
    a.pin === b.pin &&
    a.deleted === b.deleted
  );
}

// A pulled record is either genuinely new to THIS tab's collection
// (never synced before -- must be added), an update to one it already
// holds (modified), or a deletion. Routing every non-deleted record
// into `modified` -- as this file used to -- makes SyncManager try to
// update a document that does not exist yet: a silent no-op, so a
// card created on another tab never appears here, and a deletion of a
// card this tab never even saw is likewise nothing to remove.
// Classifying against the collection's own current state (reactive:
// false -- this read must not register a tracking dependency) is what
// makes create/delete actually propagate to a tab that did not
// originate them.
async function pullPot(
  potId: string,
  collection: Collection<CardRecord>,
): Promise<{ changes: Changeset<CardRecord> }> {
  await cardCheckpoints.isReady();
  let checkpoint = cardCheckpoints.findOne({ id: potId });
  const changes: Changeset<CardRecord> = {
    added: [],
    modified: [],
    removed: [],
  };

  for (;;) {
    const params = new URLSearchParams({ limit: String(PULL_BATCH_SIZE) });
    if (checkpoint) {
      params.set("updatedAt", checkpoint.updatedAt);
      params.set("id", checkpoint.cardId);
    }
    const { records } = await pb.send<PullResponse>(
      `/api/pages/${potId}/cards/pull?${params}`,
      { method: "GET" },
    );
    if (!records.length) break;

    for (const record of records) {
      const existing = collection.findOne(
        { id: record.id },
        { reactive: false },
      );
      if (record.deleted) {
        if (existing) changes.removed.push(record);
      } else if (existing) {
        if (!recordsEqual(existing, record)) changes.modified.push(record);
      } else {
        changes.added.push(record);
      }
    }
    const last = records.at(-1)!;
    checkpoint = { id: potId, updatedAt: last.updated, cardId: last.id };
    // Persisted immediately, one batch at a time, instead of being
    // deferred until SyncManager finishes applying the returned
    // changeset (this used to go through a separate "pending" map
    // flushed only by our own explicit sync() wrapper below).
    // SignalDB's own debounced auto-push also drives a pull through
    // this exact function, and that path never went through the old
    // deferred commit step -- so the checkpoint stayed behind what
    // had actually been fetched, and that staleness is what kept a
    // change made in one tab from reaching another tab until a full
    // reload re-pulled everything. This does reopen a narrow window
    // where a tab crashing between this write and SyncManager
    // applying the changeset would skip those records for good; that
    // is judged an acceptable trade for fixing the far more commonly
    // hit staleness bug.
    cardCheckpoints.replaceOne({ id: potId }, checkpoint, { upsert: true });
    if (records.length < PULL_BATCH_SIZE) break;
  }
  return { changes };
}

async function pushChanges(changes: Changeset<CardRecord>): Promise<void> {
  await Promise.all([
    ...changes.modified.map((card) =>
      updateCard(card.id, {
        pin: card.pin,
        position: card.position,
        deleted: card.deleted,
      }),
    ),
    ...changes.removed.map((card) => deleteCard(card.id)),
    // New cards are created through the dedicated API before being merged into
    // this replica, so there is no generic create endpoint to call here.
    ...changes.added.map(() => Promise.resolve()),
  ]);
}

export interface CardsReplicationHandle {
  collection: Collection<CardRecord>;
  initialReplication: Promise<void>;
  stopReplication: () => void;
}

// Broadcasts to every tab watching this pot whenever its cards may have
// changed on the server. Only the lock-holding tab keeps a live Centrifuge
// subscription (see holdLock below), so follower tabs have no way to learn
// about a change on their own; a SignalDB Collection reacts only to writes
// made through its own instance, not to another tab's IndexedDB writes.
// Pulling itself is a plain authenticated HTTP request, so any tab can do
// it once told to -- this channel is only the "please pull now" signal.
function changeChannelName(potId: string): string {
  return `cardpot:cards-changed:${potId}`;
}

export function startCardsReplication(potId: string): CardsReplicationHandle {
  const collection = createCardsCollection(potId);
  const syncManager = new SyncManager<{ potId: string }, CardRecord>({
    autostart: false,
    reactivity: solidReactivityAdapter,
    // Version this metadata independently of card records. The first
    // SignalDB implementation could persist an empty snapshot alongside a
    // checkpoint, which made later loads request only deltas and render no
    // cards. A fresh sync snapshot lets the bootstrap below repair it.
    persistenceAdapter: (name) =>
      createIndexedDBAdapter(`cards-sync-v2-${potId}-${name}`),
    pull: ({ potId: id }) => pullPot(id, collection),
    push: (_options, { changes }) => pushChanges(changes),
    onError: (_options, error) =>
      console.error(`[cards-replication] ${potId}:`, error),
  });
  syncManager.addCollection(collection, { name: "cards", potId });

  let stopped = false;
  let releaseLeadership: (() => void) | undefined;
  let stopStream: (() => void) | undefined;
  let resolveInitial!: () => void;
  let rejectInitial!: (reason: unknown) => void;
  const initialReplication = new Promise<void>((resolve, reject) => {
    resolveInitial = resolve;
    rejectInitial = reject;
  });

  const channel =
    typeof BroadcastChannel === "undefined"
      ? undefined
      : new BroadcastChannel(changeChannelName(potId));

  // Concurrent triggers (a realtime event, this tab's own change
  // echoing back, a BroadcastChannel message from another tab, the
  // resync-on-gap callback) must never run syncManager.sync()
  // overlapping one another: two in-flight pulls can resolve out of
  // order, letting an older response land after a newer one and
  // revert the collection -- this is the flicker seen right after a
  // drag-to-reorder. Chaining every call through `syncing` makes them
  // strictly sequential instead, and wrapping the whole thing in
  // withCardsFlipAsync is what actually lets a remote change animate
  // (see cardFlip.ts).
  let syncing: Promise<void> = Promise.resolve();
  const sync = () => {
    syncing = syncing
      .catch(() => {}) // a previous failure must not wedge the queue
      .then(() =>
        withCardsFlipAsync(async () => {
          await syncManager.sync("cards");
        }),
      );
    return syncing;
  };

  // Every tab -- leader or follower -- resyncs when told a change happened,
  // regardless of which tab actually holds the lock.
  const onChannelMessage = () => {
    void sync().catch((error) =>
      console.error(`[cards-replication] ${potId}:`, error),
    );
  };
  channel?.addEventListener("message", onChannelMessage);

  // Pulls, then tells every other tab (this one already has the fresh
  // data via its own sync() call above).
  const syncAndBroadcast = async () => {
    await sync();
    channel?.postMessage("changed");
  };

  const lead = async () => {
    await Promise.all([collection.isReady(), cardCheckpoints.isReady()]);
    // Repair users that received the previous implementation: their local
    // cards collection is empty, but its checkpoint says it is current. A
    // full pull is required once; subsequent pulls remain incremental.
    if (
      collection.find({}, { reactive: false }).count() === 0 &&
      cardCheckpoints.findOne({ id: potId })
    ) {
      cardCheckpoints.removeOne({ id: potId });
    }
    stopStream = subscribeToCards(
      (event) => {
        if (event.record.pot === potId)
          void syncAndBroadcast().catch((error) =>
            console.error(`[cards-replication] ${potId}:`, error),
          );
      },
      () =>
        void syncAndBroadcast().catch((error) =>
          console.error(`[cards-replication] ${potId}:`, error),
        ),
    );
    await syncManager.startSync("cards");
    await syncAndBroadcast();
    resolveInitial();
  };
  const holdLock = async () => {
    try {
      await lead();
      await new Promise<void>((resolve) => {
        releaseLeadership = resolve;
        if (stopped) resolve();
      });
    } catch (error) {
      rejectInitial(error);
      throw error;
    } finally {
      stopStream?.();
      await syncManager.pauseSync("cards");
    }
  };
  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  if (!locks) void holdLock();
  else {
    void locks.request(lockName(potId), { ifAvailable: true }, async (lock) => {
      if (!lock) {
        resolveInitial();
        await locks.request(lockName(potId), async () => holdLock());
      } else await holdLock();
    });
  }
  return {
    collection,
    initialReplication,
    stopReplication: () => {
      stopped = true;
      releaseLeadership?.();
      stopStream?.();
      channel?.removeEventListener("message", onChannelMessage);
      channel?.close();
    },
  };
}
