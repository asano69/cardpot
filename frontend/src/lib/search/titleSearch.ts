import { compareTitles } from "../models/compareTitles";

// A card title prepared for searching.
export interface TitleEntry {
  title: string;
  // normalizeForSearch(title), computed once when the entry is created.
  key: string;
}

// Distance between a katakana letter and its hiragana counterpart.
const KANA_OFFSET = 0x60;

// The one normalization applied to both titles and queries, so they always
// compare in the same form: full-width letters become half-width, case is
// ignored, katakana is folded into hiragana, and brackets, underscores and
// any whitespace collapse into a single space.
export function normalizeForSearch(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - KANA_OFFSET),
    )
    .replace(/[[\]_\s]+/g, " ")
    .trim();
}

// 0: the title starts with the whole query. 1: it contains the whole query.
// 2: it contains every word of the query, in any order. null: no match.
// An empty query is a prefix of every title.
function rankOf(key: string, phrase: string, terms: string[]): number | null {
  if (key.startsWith(phrase)) return 0;
  if (key.includes(phrase)) return 1;
  return terms.every((term) => key.includes(term)) ? 2 : null;
}

// Returns up to `limit` titles matching `query`, best first: by rank, then
// shorter titles, then by code point order. Substring matching needs no
// tokenizer, so Japanese works the same way as English.
export function searchTitles(
  entries: Iterable<TitleEntry>,
  query: string,
  limit: number,
): string[] {
  const phrase = normalizeForSearch(query);
  const terms = phrase === "" ? [] : phrase.split(" ");

  const hits: { entry: TitleEntry; rank: number }[] = [];
  for (const entry of entries) {
    const rank = rankOf(entry.key, phrase, terms);
    if (rank !== null) hits.push({ entry, rank });
  }
  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.entry.key.length - b.entry.key.length ||
      compareTitles(a.entry.title, b.entry.title),
  );
  return hits.slice(0, limit).map((hit) => hit.entry.title);
}
