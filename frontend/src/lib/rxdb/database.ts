import {
  createRxDatabase,
  addRxPlugin,
  type RxDatabase,
  type RxCollection,
} from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { cardsSchema, type CardRxDoc } from "./cardsSchema";

addRxPlugin(RxDBQueryBuilderPlugin);

export type CardsCollection = RxCollection<CardRxDoc>;
type CardpotCollections = { cards: CardsCollection };

let dbPromise: Promise<RxDatabase<CardpotCollections>> | undefined;

// Returns the single RxDB database shared by every pot's replication
// (see cardsReplication.ts). Cards from every pot live in one
// collection and are scoped by their own "pot" field, rather than one
// collection per pot -- see docs/rxdb-offline-sync-plan.md §3.4.
export function getDb(): Promise<RxDatabase<CardpotCollections>> {
  if (!dbPromise) {
    dbPromise = createRxDatabase<CardpotCollections>({
      name: "cardpot",
      storage: getRxStorageDexie(),
    }).then(async (db) => {
      await db.addCollections({ cards: { schema: cardsSchema } });
      return db;
    });
  }
  return dbPromise;
}
