import type { LineEntry } from "../models/cardLine";
import { db } from "./db";

// Returns the lines of a card in order, or an empty list when the card has no
// live record yet. Soft-deleted records are already gone from the replica
// (see applyRecords in replica.ts), so no filtering is needed here.
export async function readLineEntries(cardId: string): Promise<LineEntry[]> {
  const record = await db.card_lines.where("card").equals(cardId).first();
  return record?.lines ?? [];
}
