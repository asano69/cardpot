import Dexie, { type EntityTable } from "dexie";

// The local, pull-only mirror of cards. Dexie only needs the primary key and
// query indexes; validation remains the server's concern.
export interface CardDbRecord {
  id: string;
  pot: string;
  title: string;
  description: string;
  image: string;
  position: number;
  pin: boolean;
  updated: string;
}

// The checkpoint is per pot because each pot has an independent pull stream.
export interface CardCheckpointRecord {
  pot: string;
  updatedAt: string;
  id: string;
}

class CardpotDatabase extends Dexie {
  cards!: EntityTable<CardDbRecord, "id">;
  cardCheckpoints!: EntityTable<CardCheckpointRecord, "pot">;

  constructor() {
    super("cardpot");
    this.version(1).stores({
      cards: "id, pot, [pot+position], [pot+updated]",
      cardCheckpoints: "pot",
    });
  }
}

// One Dexie instance per tab. IndexedDB itself is shared by same-origin tabs,
// and liveQuery observes writes made by those other tabs as well.
export const db = new CardpotDatabase();
