import pb from "./pb";
import { randomKey } from "../randomKey";
import type { PotRecord } from "../models/pot";

// Looks up an pot by its unique "slug" field. Pots are addressed by
// slug in the URL instead of their PocketBase id, so any page that
// needs the parent pot for a "/:slug/..." route resolves it here
// rather than duplicating the same filtered lookup.
export async function fetchPotBySlug(slug: string): Promise<PotRecord> {
  return await pb
    .collection("pots")
    .getFirstListItem<PotRecord>(pb.filter("slug = {:slug}", { slug }));
}

// Fetches every "pots" record, ordered by position.
export async function fetchAllPots(): Promise<PotRecord[]> {
  return await pb
    .collection("pots")
    .getFullList<PotRecord>({ sort: "position" });
}

// Creates a pot. The "slug" field is required and pattern-constrained,
// but the real id isn't known until after creation -- so this creates
// with a throwaway placeholder value (satisfying both the required and
// pattern rules) first, then immediately overwrites it with the
// record's own id. No slug-picking UI exists yet; this can be replaced
// with a real, user-chosen slug once that UI exists.
export async function createPot(
  title: string,
  position: number,
): Promise<PotRecord> {
  const record = await pb.collection("pots").create<PotRecord>({
    title,
    done: false,
    position,
    slug: randomKey(),
  });
  return await pb
    .collection("pots")
    .update<PotRecord>(record.id, { slug: record.id });
}

export async function updatePot(
  id: string,
  changes: Partial<Pick<PotRecord, "title" | "position">>,
): Promise<PotRecord> {
  return await pb.collection("pots").update<PotRecord>(id, changes);
}

export async function deletePot(id: string): Promise<void> {
  await pb.collection("pots").delete(id);
}
