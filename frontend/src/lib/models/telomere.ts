// Telomere: the thin vertical bar left of each line that shows how recently
// the line was edited (Cosense's edit-history bar). This module holds only
// pure data types and rules, so it is testable without CodeMirror or Solid.

// "read": nothing new. "unread": edited by someone else since this user last
// looked. "updated": edited after this page was loaded.
export type TelomereStatus = "read" | "unread" | "updated";

export interface TelomereEntry {
  // Epoch milliseconds of the line's last edit.
  updatedAt: number;
  // Name of the user who made that edit.
  user: string;
  status: TelomereStatus;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Border width in pixels for a line last edited `ageMs` ago: the more recent
// the edit, the thicker the bar. 5px is Cosense's resting width.
export function telomereThickness(ageMs: number): number {
  if (ageMs < MINUTE_MS) return 10;
  if (ageMs < HOUR_MS) return 8;
  if (ageMs < DAY_MS) return 6;
  return 5;
}
