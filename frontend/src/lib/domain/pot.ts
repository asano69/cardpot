// Pot domain type. Matches the PocketBase "pots" collection schema.
export interface PotRecord {
  id: string;
  slug: string;
  title: string;
  done: boolean;
  position: number;
  created: string;
  updated: string;
}
