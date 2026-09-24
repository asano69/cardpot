import pb from "./pb";
import type { CardRecord, TitleCandidate } from "../models/card";

// Response shape shared by createCard/updateCardTitle: the saved card,
// plus a merge-alert target computed server-side (see findMergeTarget
// in internal/serve/slug.go) -- the title of another card in the same
// pot whose header this one's header appears to duplicate, or null.
export interface CardMutationResult {
  card: CardRecord;
  mergeTarget: string | null;
}

// Creates a new "cards" record with a title resolved server-side from
// `titleCandidate` (see internal/serve/cards.go's createCardHandler).
// Used by NoteEditor's draft mode, which needs a real record id before
// Yjs sync can start.
export async function createCard(
  pot: string,
  titleCandidate: TitleCandidate,
): Promise<CardMutationResult> {
  return await pb.send<CardMutationResult>("/api/admin/cards", {
    method: "POST",
    body: { pot, titleCandidate },
  });
}

// Resolves and saves a new title for an existing card (see
// internal/serve/cards.go's updateCardTitleHandler). The card's URL
// segment is derived from this same title on demand (see
// lib/slugify.ts) instead of being a separate field kept in sync here.
// Resolving a card by its URL slug now happens entirely client-side
// against the already-loaded cardsById store (see
// lib/stores/cardsStore.ts's findCardByPotAndSlug) instead of a dedicated
// server route -- there is no per-open network round-trip anymore.
export async function updateCardTitle(
  cardId: string,
  titleCandidate: TitleCandidate,
): Promise<CardMutationResult> {
  return await pb.send<CardMutationResult>(`/api/admin/cards/${cardId}/title`, {
    method: "POST",
    body: { titleCandidate },
  });
}

// Updates a card's own fields directly. The title is deliberately not
// in this list: it only ever changes via updateCardTitle above.
export async function updateCard(
  id: string,
  changes: Partial<Pick<CardRecord, "pin" | "position" | "deleted">>,
): Promise<CardRecord> {
  return await pb.collection("cards").update<CardRecord>(id, changes);
}

// Soft-deletes a card by stamping its "deleted" date; the record itself
// stays in the database. The realtime "update" event this produces is
// what makes other clients drop the card (see cardsStore.ts).
export async function deleteCard(id: string): Promise<void> {
  await updateCard(id, { deleted: new Date().toISOString() });
}

// One realtime change to a "cards" record, as published by the server
// (see internal/realtime) and delivered by lib/api/realtime.ts. `action`
// is "create", "update" or "delete".
export interface CardEvent {
  action: string;
  record: CardRecord;
}
