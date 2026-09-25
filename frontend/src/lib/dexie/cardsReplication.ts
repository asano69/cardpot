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
  type CardCheckpoint,
} from "@/lib/signaldb/cardsCollection";

const PULL_BATCH_SIZE = 200;
const lockName = (potId: string) => `cardpot:cards-replication:${potId}`;
// A checkpoint must not advance until SyncManager has applied its matching
// changes. Advancing it in `pull` can leave an empty replica permanently
// caught up when a tab is closed between fetching and persisting.
const pendingCheckpoints = new Map<string, CardCheckpoint>();

interface PulledCardRecord extends CardRecord {
  deleted: string;
}
interface PullResponse {
  records: PulledCardRecord[];
}

async function pullPot(
  potId: string,
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
      if (record.deleted) changes.removed.push(record);
      else changes.modified.push(record);
    }
    const last = records.at(-1)!;
    checkpoint = { id: potId, updatedAt: last.updated, cardId: last.id };
    if (records.length < PULL_BATCH_SIZE) break;
  }
  if (checkpoint) pendingCheckpoints.set(potId, checkpoint);
  return { changes };
}

function commitCheckpoint(potId: string): void {
  const checkpoint = pendingCheckpoints.get(potId);
  if (!checkpoint) return;
  cardCheckpoints.replaceOne({ id: potId }, checkpoint, { upsert: true });
  pendingCheckpoints.delete(potId);
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
    pull: ({ potId: id }) => pullPot(id),
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

  const sync = async () => {
    await syncManager.sync("cards");
    commitCheckpoint(potId);
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
