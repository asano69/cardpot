// One line of a card: a stable, server-assigned id and a hash of its content.
export interface LineEntry {
  id: string;
  hash: string;
}

// Matches the PocketBase "card_lines" collection schema: one record per card,
// whose "lines" holds its lines in order.
export interface CardLinesRecord {
  id: string;
  card: string;
  pot: string;
  lines: LineEntry[];
  // Soft-delete timestamp; an empty string while the record is live.
  deleted: string;
  created: string;
  updated: string;
}
