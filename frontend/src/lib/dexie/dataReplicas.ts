import { subscribeToCollection } from "../api/realtime";
import type { ReplicaRecord } from "../api/replication";
import { db } from "./db";
import {
  applyRecords,
  syncReplica,
  tableReplica,
  type Replica,
} from "./replica";

// Replicated collections that have no UI store of their own: they are only
// kept current in IndexedDB. A collection with a UI store (cards, see
// cardsStore.ts) uses the same building blocks from replica.ts itself.
// Adding a collection here, plus its table in db.ts and its line in
// internal/replica on the server, is all it takes to replicate it.
const dataReplicas: Replica<ReplicaRecord>[] = [
  tableReplica("card_links", db.card_links),
];

// Pots opened in this session. A pot is pulled when it opens (which also
// covers everything missed while it was closed) and again after a realtime
// gap, but only while it is open.
const openPots = new Set<string>();

async function syncSafely(
  replica: Replica<ReplicaRecord>,
  potId: string,
): Promise<void> {
  try {
    await syncReplica(replica, potId);
  } catch (err) {
    console.error(`[${replica.name}] failed to sync replica:`, err);
  }
}

// Brings every data replica of a pot up to date and keeps it synced from now
// on. A failure is only logged; the next open (or gap) retries from the same
// checkpoint.
export async function openPotReplicas(potId: string): Promise<void> {
  openPots.add(potId);
  await Promise.all(dataReplicas.map((replica) => syncSafely(replica, potId)));
}

export function closePotReplicas(potId: string): void {
  openPots.delete(potId);
}

async function resync(replica: Replica<ReplicaRecord>): Promise<void> {
  for (const potId of openPots) await syncSafely(replica, potId);
}

// Applies the realtime events of every data replica to IndexedDB and returns
// a function that stops watching. Events of pots that are not open are
// applied too: they are idempotent, and the next open pulls anyway. Called
// once by AppShell for as long as the app is open.
export function watchDataReplicas(): () => void {
  const stops = dataReplicas.map((replica) =>
    subscribeToCollection<ReplicaRecord>(
      replica.name,
      (event) => {
        applyRecords(replica, [event.record]).catch((err) =>
          console.error(`[${replica.name}] failed to apply event:`, err),
        );
      },
      () => void resync(replica),
    ),
  );
  return () => stops.forEach((stop) => stop());
}
