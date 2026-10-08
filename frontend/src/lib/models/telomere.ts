// Telomere: the thin vertical bar left of each line that shows how fresh the
// line is (Cosense's edit-history bar). This module holds only pure data
// types and rules, so it is testable without CodeMirror or Solid.
import type { LineId } from "./lineId";
import type { LineMeta } from "./lineMeta";

// "read": nothing new. "unread": edited by someone else since this user last
// looked. "updated": edited by someone else after this page was loaded.
export type TelomereStatus = "read" | "unread" | "updated";

export interface TelomereEntry {
  // Epoch milliseconds of the line's last recorded edit, or null when none
  // was recorded (e.g. a line written before line meta existed).
  updatedAt: number | null;
  // Name of the user who made that edit; empty when unknown.
  user: string;
  status: TelomereStatus;
}

// Combines the three independent sources into the entries the gutter draws:
// who edited a line when (meta), which lines were unread when the card was
// opened (unread) and which lines others edited since (updated). A line
// the user edited last is always "read", even if it also holds unseen text.
export function telomereEntries(
  meta: Record<LineId, LineMeta>,
  unread: ReadonlySet<LineId>,
  updated: ReadonlySet<LineId>,
  userId: string | undefined,
): Record<LineId, TelomereEntry> {
  const entries: Record<LineId, TelomereEntry> = {};
  const ids = new Set([...Object.keys(meta), ...unread, ...updated]);
  for (const id of ids) {
    const m = meta[id];
    const own = m !== undefined && m.userId === userId;
    const status: TelomereStatus = own
      ? "read"
      : updated.has(id)
        ? "updated"
        : unread.has(id)
          ? "unread"
          : "read";
    entries[id] = { updatedAt: m?.at ?? null, user: m?.name ?? "", status };
  }
  return entries;
}

const HOUR_MS = 3_600_000;

// Border width in pixels for a line last edited `ageMs` ago: 10px for a fresh
// edit, thinning logarithmically down to 1px (Cosense's formula). An age
// below zero (clock skew) counts as fresh; Infinity gives the thinnest bar.
export function telomereThickness(ageMs: number): number {
  const hours = Math.max(0, ageMs) / HOUR_MS;
  return Math.max(1, 10 - Math.floor(Math.log10(hours + 2) * 2.3));
}
