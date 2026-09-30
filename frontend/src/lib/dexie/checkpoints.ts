import type { Checkpoint } from "../api/replication";
import { db } from "./db";

// Returns the checkpoint stored for a collection in a pot, or null when it
// has never been pulled before.
export async function readCheckpoint(
  collection: string,
  potId: string,
): Promise<Checkpoint | null> {
  const record = await db.checkpoints.get([collection, potId]);
  return record ? { updatedAt: record.updatedAt, id: record.recordId } : null;
}

// Persists the checkpoint to resume a collection's next pull in a pot from.
export async function writeCheckpoint(
  collection: string,
  potId: string,
  checkpoint: Checkpoint,
): Promise<void> {
  await db.checkpoints.put({
    collection,
    potId,
    updatedAt: checkpoint.updatedAt,
    recordId: checkpoint.id,
  });
}
