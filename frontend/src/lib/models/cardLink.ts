// Matches the PocketBase "card_links" collection schema.
export interface CardLinkRecord {
  id: string;
  // Id of the card that contains the link.
  source: string;
  // A link's target is only stored as text: the target card may not exist
  // (yet), so it is matched to a card by (target_pot, target_titleLc).
  target_pot: string;
  target_title: string;
  target_titleLc: string;
  // Soft-delete timestamp; an empty string while the link is live.
  deleted: string;
  created: string;
  updated: string;
}
