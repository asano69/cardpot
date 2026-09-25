import { Collection } from "@signaldb/core";
import createIndexedDBAdapter from "@signaldb/indexeddb";
import solidReactivityAdapter from "@signaldb/solid";
import type { CardRecord } from "../models/card";

export interface CardCheckpoint {
  id: string;
  updatedAt: string;
  cardId: string;
}

// A pot is the server's replication unit, so it is also the unit we persist
// and synchronize. Keeping collections separate prevents a delta pull for one
// pot from being interpreted as a complete snapshot of every other pot.
export function createCardsCollection(potId: string): Collection<CardRecord> {
  return new Collection<CardRecord>({
    name: `cards:${potId}`,
    reactivity: solidReactivityAdapter,
    persistence: createIndexedDBAdapter<CardRecord, string>(`cards-${potId}`),
  });
}

export const cardCheckpoints = new Collection<CardCheckpoint>({
  name: "card-checkpoints",
  reactivity: solidReactivityAdapter,
  persistence: createIndexedDBAdapter<CardCheckpoint, string>(
    "card-checkpoints",
  ),
});
