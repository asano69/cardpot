import type { RxJsonSchema } from "rxdb";

// Local RxDB mirror of the "cards" collection (see
// frontend/src/lib/models/card.ts's CardRecord), filled in by
// cardsReplication.ts. There is no "deleted" field here: RxDB's own
// reserved _deleted flag plays that role instead (see
// docs/rxdb-offline-sync-plan.md §2.3).
export interface CardRxDoc {
  id: string;
  pot: string;
  title: string;
  description: string;
  image: string;
  position: number;
  pin: boolean;
  updated: string; // used as the replication checkpoint field
}

export const cardsSchema: RxJsonSchema<CardRxDoc> = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: { type: "string", maxLength: 40 },
    pot: { type: "string", maxLength: 40 },
    title: { type: "string" },
    description: { type: "string" },
    image: { type: "string" },
    position: { type: "number" },
    pin: { type: "boolean" },
    updated: { type: "string", maxLength: 32 },
  },
  required: ["id", "pot", "title", "position", "updated"],
  indexes: [
    ["pot", "position"], // CardList's sort order
    ["pot", "updated"], // checkpoint queries / debugging
  ],
};
