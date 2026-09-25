import pb from "@/lib/api/pb";
import { subscribeToCards } from "@/lib/api/realtime";
import { db, type CardCheckpointRecord, type CardDbRecord } from "./database";

// Must not exceed internal/serve/replication.go's maxPullLimit.
const PULL_BATCH_SIZE = 200;
const lockName = (potId: string) => `cardpot:cards-replication:${potId}`;

interface PulledCardRecord extends CardDbRecord {
  deleted: string;
}

interface PullResponse {
  records: PulledCardRecord[];
}

function toCardRecord(record: PulledCardRecord): CardDbRecord {
  const { deleted: _deleted, ...card } = record;
  return card;
}

async function applyRecords(records: PulledCardRecord[]): Promise<void> {
  const liveCards = records
    .filter((record) => !record.deleted)
    .map(toCardRecord);
  const deletedIds = records
    .filter((record) => Boolean(record.deleted))
    .map((record) => record.id);

  await db.transaction("rw", db.cards, async () => {
    if (liveCards.length) await db.cards.bulkPut(liveCards);
    if (deletedIds.length) await db.cards.bulkDelete(deletedIds);
  });
}

async function pullPot(potId: string): Promise<void> {
  let checkpoint = await db.cardCheckpoints.get(potId);

  for (;;) {
    const params = new URLSearchParams({ limit: String(PULL_BATCH_SIZE) });
    if (checkpoint) {
      params.set("updatedAt", checkpoint.updatedAt);
      params.set("id", checkpoint.id);
    }

    const { records } = await pb.send<PullResponse>(
      `/api/pages/${potId}/cards/pull?${params}`,
      { method: "GET" },
    );
    if (!records.length) return;

    const last = records.at(-1)!;
    const nextCheckpoint: CardCheckpointRecord = {
      pot: potId,
      updatedAt: last.updated,
      id: last.id,
    };
    await db.transaction("rw", db.cards, db.cardCheckpoints, async () => {
      const liveCards = records
        .filter((record) => !record.deleted)
        .map(toCardRecord);
      const deletedIds = records
        .filter((record) => Boolean(record.deleted))
        .map((record) => record.id);
      if (liveCards.length) await db.cards.bulkPut(liveCards);
      if (deletedIds.length) await db.cards.bulkDelete(deletedIds);
      await db.cardCheckpoints.put(nextCheckpoint);
    });
    checkpoint = nextCheckpoint;

    if (records.length < PULL_BATCH_SIZE) return;
  }
}

export interface CardsReplicationHandle {
  // A follower resolves once it is set up to read the shared local database.
  // Its leader continues to fill that database in the background.
  initialReplication: Promise<void>;
  stopReplication: () => void;
}

// Runs Centrifuge and pull writes in exactly one tab per pot. Other tabs only
// read `db.cards` through liveQuery; when the lock holder writes IndexedDB,
// their queries re-evaluate automatically. A queued lock request lets a
// follower take over if the current leader tab closes.
export function startCardsReplication(potId: string): CardsReplicationHandle {
  let stopped = false;
  let releaseLeadership: (() => void) | undefined;
  let stopStream: (() => void) | undefined;
  let writeChain = Promise.resolve();
  let resolveInitial!: () => void;
  let rejectInitial!: (reason: unknown) => void;
  const initialReplication = new Promise<void>((resolve, reject) => {
    resolveInitial = resolve;
    rejectInitial = reject;
  });

  // Chains replication work so Dexie writes never overlap. Previously
  // this passed the same `work` as both onFulfilled and onRejected,
  // which meant a failed step called `work()` again with no argument
  // and its rejection reason was silently discarded. Now the failure
  // is logged before continuing, so an online-recovery issue is at
  // least visible instead of vanishing without a trace.
  const enqueue = (work: () => Promise<void>) => {
    writeChain = writeChain.then(work, (err) => {
      console.error(`[cards-replication] step failed for pot ${potId}:`, err);
      return work();
    });
    return writeChain;
  };

  const lead = async () => {
    if (stopped) return;
    stopStream = subscribeToCards(
      (event) => {
        if (event.record.pot === potId) {
          void enqueue(() => applyRecords([event.record]));
        }
      },
      () => {
        void enqueue(() => pullPot(potId));
      },
    );

    try {
      await enqueue(() => pullPot(potId));
      resolveInitial();
    } catch (error) {
      rejectInitial(error);
      throw error;
    }
  };

  const holdLock = async () => {
    try {
      await lead();
      await new Promise<void>((resolve) => {
        releaseLeadership = resolve;
        if (stopped) resolve();
      });
    } finally {
      stopStream?.();
    }
  };

  const locks = typeof navigator === "undefined" ? undefined : navigator.locks;
  if (!locks) {
    // Web Locks is supported by current target browsers. This fallback keeps
    // development/test environments functional, but cannot coordinate tabs.
    void holdLock();
  } else {
    void locks.request(lockName(potId), { ifAvailable: true }, async (lock) => {
      if (!lock) {
        // Another tab is already the leader, so reading its shared IndexedDB
        // state is enough for this tab to become ready.
        resolveInitial();
        await locks.request(lockName(potId), async () => holdLock());
        return;
      }
      await holdLock();
    });
  }

  return {
    initialReplication,
    stopReplication: () => {
      stopped = true;
      releaseLeadership?.();
      stopStream?.();
    },
  };
}
