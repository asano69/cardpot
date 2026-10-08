import { StateEffect, StateField } from "@codemirror/state";
import { GutterMarker, gutter, gutters } from "@codemirror/view";
import type * as Y from "yjs";
import { lineIdAt, type LineId } from "@/lib/models/lineId";
import {
  telomereThickness,
  type TelomereEntry,
  type TelomereStatus,
} from "@/lib/models/telomere";

// The telomere is a gutter whose only content is a vertical bar per line, so
// no line numbers are shown (lineNumbers() is deliberately not used). The
// gutter itself is moved into the page's left padding by editorTheme.ts.

export interface TelomereData {
  entries: Record<LineId, TelomereEntry>;
  // Epoch milliseconds the thickness is computed against.
  now: number;
}

// Sent from outside the editor whenever the store or the clock changes
// (see index.tsx), the same way emptyLinks.ts receives its predicate.
export const setTelomere = StateEffect.define<TelomereData>();

const telomereField = StateField.define<TelomereData>({
  create: () => ({ entries: {}, now: 0 }),
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setTelomere)) value = effect.value;
    }
    return value;
  },
});

class TelomereMarker extends GutterMarker {
  constructor(
    private readonly thickness: number,
    private readonly status: TelomereStatus,
    // The text of the tooltip: the user and, when known, the line id.
    private readonly label: string,
  ) {
    super();
  }

  // Equal markers keep their DOM when the clock ticks without a visible change.
  eq(other: TelomereMarker) {
    return (
      other.thickness === this.thickness &&
      other.status === this.status &&
      other.label === this.label
    );
  }

  toDOM() {
    const bar = document.createElement("div");
    bar.className = `telomere-border ${this.status}`;
    bar.style.borderLeftWidth = `${this.thickness}px`;
    bar.title = this.label;
    return bar;
  }
}

// `ytext` is the card's live text: a line's id comes from it (see
// lib/models/lineId.ts), so it is always in step with the text, also for a
// draft and while offline.
export function telomere(ytext: Y.Text) {
  return [
    telomereField,
    // Not fixed: a fixed gutter gets an inline "position: sticky", which would
    // override the absolute positioning set in editorTheme.ts.
    gutters({ fixed: false }),
    gutter({
      class: "cm-telomere",
      lineMarker(view, line) {
        const { entries, now } = view.state.field(telomereField);
        // Offsets only match while the editor and the Y.Text hold the same
        // text, which can differ for a moment during an update.
        if (ytext.length !== view.state.doc.length) return null;
        const id = lineIdAt(ytext, line.from);
        if (!id) return null;

        // A line with no recorded edit still gets the thinnest "read" bar.
        const entry = entries[id];
        if (!entry) {
          return new TelomereMarker(telomereThickness(Infinity), "read", "");
        }
        // The raw id is opaque (see lineId.ts), so it is only shown in
        // development. An edit time ahead of this clock gives a negative age,
        // which draws the thickest bar.
        const label = import.meta.env.DEV
          ? `${entry.user}\nid: ${id}`
          : entry.user;
        return new TelomereMarker(
          telomereThickness(now - entry.updatedAt),
          entry.status,
          label,
        );
      },
      // Document changes already refresh the markers; this covers new data.
      lineMarkerChange: (update) =>
        update.startState.field(telomereField) !==
        update.state.field(telomereField),
    }),
  ];
}
