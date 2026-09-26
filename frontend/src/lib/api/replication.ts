import pb from "./pb";
import type { CardRecord } from "../models/card";

// Stage 1 of docs/signaldb-offline-sync.md: a checkpoint-based pull
// client for /api/pages/{potId}/cards/pull (see
// internal/serve/replication.go). Soft-deleted cards are returned like
// any other changed card -- callers must treat them as delete events,
// not filter them out (see pullCardsHandler's own comment).

// Mirrors internal/serve/replication.go's cardCheckpoint: both fields
// are needed because several cards can share one "updated" value -- the
// id breaks that tie.
export interface Checkpoint {
  updatedAt: string;
  id: string;
}

// Matches the server's maxPullLimit (see replication.go), so a full
// page always means "there might be more" and a short page always
// means "this was the last one".
export const PULL_LIMIT = 1000;

interface PullResponse {
  records: CardRecord[];
}

// Fetches one page of the pull protocol, starting just after `after`
// (or from the beginning when null).
async function pullPage(
  potId: string,
  after: Checkpoint | null,
): Promise<CardRecord[]> {
  const query: Record<string, string | number> = { limit: PULL_LIMIT };
  if (after) {
    query.updatedAt = after.updatedAt;
    query.id = after.id;
  }
  const res = await pb.send<PullResponse>(`/api/pages/${potId}/cards/pull`, {
    method: "GET",
    query,
  });
  return res.records;
}

// Pulls every card that changed after `after`, paging through the
// server's checkpoint protocol until a short page signals the end
// (see pullCardsHandler's own doc comment). Returns every record
// pulled, plus the checkpoint to resume from next time -- `after`
// itself when nothing at all was pulled.
export async function pullAll(
  potId: string,
  after: Checkpoint | null,
): Promise<{ records: CardRecord[]; checkpoint: Checkpoint | null }> {
  const records: CardRecord[] = [];
  let checkpoint = after;

  for (;;) {
    const page = await pullPage(potId, checkpoint);
    records.push(...page);
    if (page.length === 0) break;

    const last = page[page.length - 1];
    checkpoint = { updatedAt: last.updated, id: last.id };
    if (page.length < PULL_LIMIT) break;
  }

  return { records, checkpoint };
}
