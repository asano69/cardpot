import type { CardRecord } from "../models/card";
import {
  normalizeForSearch,
  searchTitles,
  type TitleEntry,
} from "../search/titleSearch";
import { db } from "./db";

// In-memory title index of the pots being searched, fed from the Dexie
// replica. Titles are short, so scanning them all is fast enough (a few ms
// for 100k cards) and no inverted index is needed. The replica only holds live
// cards, so the index never lists a deleted one. It also works offline.
//
// Keeping it current is cardsReplica's job (see cardsCollection.ts): every
// write to the replica (pull, realtime event, local change) goes through
// indexCards / unindexCard below.
const byPot = new Map<string, Map<string, TitleEntry>>();
const loading = new Map<string, Promise<void>>();

function toEntry(card: Pick<CardRecord, "title">): TitleEntry {
  return { title: card.title, key: normalizeForSearch(card.title) };
}

// Fills a pot's index from the replica, once. The map is registered first, so
// writes that happen while loading are applied to it at once and win over the
// copy read from the replica.
function load(pot: string): Promise<void> {
  let promise = loading.get(pot);
  if (!promise) {
    const entries = new Map<string, TitleEntry>();
    byPot.set(pot, entries);
    promise = db.cards
      .where("pot")
      .equals(pot)
      .each((card) => {
        if (!entries.has(card.id)) entries.set(card.id, toEntry(card));
      })
      .catch((err) => {
        // Allow a retry on the next search.
        loading.delete(pot);
        byPot.delete(pot);
        throw err;
      });
    loading.set(pot, promise);
  }
  return promise;
}

// Adds or renames cards in the indexes that are loaded. A pot that is not
// loaded has nothing to update: it reads the replica when it loads.
export function indexCards(cards: CardRecord[]): void {
  for (const card of cards) byPot.get(card.pot)?.set(card.id, toEntry(card));
}

export function unindexCard(id: string): void {
  for (const entries of byPot.values()) entries.delete(id);
}

// Forgets a pot's index when the user leaves it (see PotLayout).
export function releaseTitleIndex(pot: string): void {
  byPot.delete(pot);
  loading.delete(pot);
}

// Returns up to `limit` titles of the pot's cards matching `query`, best
// first (see searchTitles).
export async function suggestTitles(
  pot: string,
  query: string,
  limit = 20,
): Promise<string[]> {
  await load(pot);
  return searchTitles(byPot.get(pot)?.values() ?? [], query, limit);
}
