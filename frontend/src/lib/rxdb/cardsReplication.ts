//
// Pull-only replication for one pot's "cards" collection (see
// docs/rxdb-offline-sync-plan.md §3.3). `live` is false for now: the
// Centrifuge realtime feed is not wired into this replication's pull
// stream yet (that happens in a later round), so a live replication
// here would just sit idle without ever being told to re-pull.
import { Subject } from "rxjs";
import {
  replicateRxCollection,
  type RxReplicationPullStreamItem,
} from "rxdb/plugins/replication";
import pb from "@/lib/api/pb";
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

// Starts pull-only replication for potId's cards into collection.
// Returns a function that cancels the replication.
export function startCardsReplication(
  collection: CardsCollection,
  potId: string,
): () => void {
  // Created but never fed yet -- see this file's top comment. Kept
  // here (rather than added later) so the replication's `pull.stream$`
  // wiring doesn't have to change shape once Centrifuge is connected.
  const pullStream$ = new Subject
    RxReplicationPullStreamItem<CardRxDoc, CardCheckpoint>
  >();

  const replication = replicateRxCollection<CardRxDoc, CardCheckpoint>({
    collection,
    replicationIdentifier: `cards-${potId}`,
    live: false,
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

  return () => {
    replication.cancel();
  };
}
