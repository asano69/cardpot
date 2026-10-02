import type { CardLinkRecord } from "../models/cardLink";
import { db } from "./db";

// Returns the live links written in a card, in the order they first appear
// in it. Soft-deleted links are already gone from the replica (see
// applyRecords in replica.ts), so no filtering is needed here.
export function readOwnLinks(cardId: string): Promise<CardLinkRecord[]> {
  return db.card_links.where("source").equals(cardId).sortBy("position");
}
