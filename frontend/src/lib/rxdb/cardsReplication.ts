//
// Pull-only replication for one pot's "cards" collection (see
// docs/rxdb-offline-sync-plan.md §3.3). The initial and gap-recovery
// pulls go through the HTTP pull handler below; live updates arrive
// through Centrifuge (see startCentrifugeStream) and are fed into the
// same `pull.stream$`, so RxDB treats both sources uniformly.
import { Subject } from "rxjs";
import type { RxReplicationPullStreamItem } from "rxdb";
import { replicateRxCollection } from "rxdb/plugins/replication";
import pb from "@/lib/api/pb";
import { subscribeToCards } from "@/lib/api/realtime";
import type { CardCheckpoint } from "./checkpoint";
import type { CardRxDoc } from "./cardsSchema";
import type { CardsCollection } from "./database";

// Must not exceed the backend's own limit (see
// internal/serve/replication.go's maxPullLimit), or the server would
// silently cap the response and a page shorter than this would look
// like "no more data" to RxDB.
const PULL_BATCH_SIZE = 200;

// One "cards" record as returned by the pull endpoint (see
// internal/serve/replication.go). Only the fields this replication
// actually needs are declared here.
interface PulledCardRecord {
  id: string;
  pot: string;
  title: string;
  description: string;
  image: string;
  position: number;
  pin: boolean;
  updated: string;
  deleted: string;
}

interface PullResponse {
  records: PulledCardRecord[];
}

// Converts a pulled "cards" record into the shape RxDB expects,
// including its reserved _deleted flag (see internal/serve/replication.go's
// own comment on why soft-deleted cards are pulled rather than filtered out).
function toRxDoc(record: PulledCardRecord): CardRxDoc & { _deleted: boolean } {
  return {
    id: record.id,
    pot: record.pot,
    title: record.title,
    description: record.description,
    image: record.image,
    position: record.position,
    pin: record.pin,
    updated: record.updated,
    _deleted: Boolean(record.deleted),
  };
}

// Feeds potId's card events from the shared Centrifuge channel into
// pullStream$, converted to the shape RxDB's pull stream expects.
// Events for another pot are ignored, since one CardsCollection is
// shared across every pot (see database.ts) but each replication
// instance is scoped to a single pot. A recovery gap (see
// subscribeToCards's own onResync contract) is forwarded as "RESYNC",
// which tells RxDB to re-run the pull handler from its last known
// checkpoint -- this is what replaces cardsStore.ts's hand-written
// resyncPot once the store itself moves onto RxDB (see plan §4,段階
// B). Returns the underlying unsubscribe function.
function startCentrifugeStream(
  pullStream$: Subject<RxReplicationPullStreamItem<CardRxDoc, CardCheckpoint>>,
  potId: string,
): () => void {
  return subscribeToCards(
    (event) => {
      if (event.record.pot !== potId) return;
      pullStream$.next({
        documents: [toRxDoc(event.record)],
        checkpoint: { updatedAt: event.record.updated, id: event.record.id },
      });
    },
    () => pullStream$.next("RESYNC"),
  );
}

// What startCardsReplication hands back to its caller (see
// cardsStore.ts's ensurePotLoaded): a way to stop everything, and a
// promise the caller can await to know the pot's full backlog has
// been pulled at least once -- before that, a local query only sees a
// partial pot.
export interface CardsReplicationHandle {
  initialReplication: Promise<void>;
  stopReplication: () => void;
}

// Starts live replication for potId's cards into collection: an
// initial pull via the HTTP handler, followed by live updates from
// Centrifuge fed through the same pull.stream$ (see
// startCentrifugeStream).
export function startCardsReplication(
  collection: CardsCollection,
  potId: string,
): CardsReplicationHandle {
  const pullStream$ = new Subject<
    RxReplicationPullStreamItem<CardRxDoc, CardCheckpoint>
  >();
  const replication = replicateRxCollection<CardRxDoc, CardCheckpoint>({
    collection,
    replicationIdentifier: `cards-${potId}`,
    live: true,
    pull: {
      batchSize: PULL_BATCH_SIZE,
      async handler(checkpoint) {
        const params = new URLSearchParams({
          limit: String(PULL_BATCH_SIZE),
        });
        if (checkpoint) {
          params.set("updatedAt", checkpoint.updatedAt);
          params.set("id", checkpoint.id);
        }
        const { records } = await pb.send<PullResponse>(
          `/api/pages/${potId}/cards/pull?${params}`,
          { method: "GET" },
        );
        const documents = records.map(toRxDoc);
        const last = documents.at(-1);
        return {
          documents,
          checkpoint: last
            ? { updatedAt: last.updated, id: last.id }
            : checkpoint,
        };
      },
      stream$: pullStream$.asObservable(),
    },
    // No push handler: writes still go through cardApi.ts's REST calls
    // directly (see docs/rxdb-offline-sync-plan.md §0's non-goals).
  });

  const stopCentrifugeStream = startCentrifugeStream(pullStream$, potId);

  return {
    initialReplication: replication.awaitInitialReplication(),
    stopReplication: () => {
      replication.cancel();
      stopCentrifugeStream();
    },
  };
}
