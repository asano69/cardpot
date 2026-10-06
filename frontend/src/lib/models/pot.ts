// Pot domain type. Matches the PocketBase "pots" collection schema.
export interface PotRecord {
  id: string;
  // Needed to build the cover's file URL (see potCoverURL in api/pots.ts).
  collectionId: string;
  collectionName: string;
  // File name of the cover image; empty while none is set.
  cover?: string;
  name: string;
  title: string;
  done: boolean;
  position: number;
  created: string;
  updated: string;
}
