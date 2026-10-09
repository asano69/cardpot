import { createMemo, createSignal, onCleanup, type Accessor } from "solid-js";
import type * as Y from "yjs";
import type { WebsocketProvider } from "y-websocket";
import type { LineId } from "../models/lineId";
import { lineMetaMap, touchedLineIds, type LineMeta } from "../models/lineMeta";

export interface LineMetaStore {
  // The line meta of the card as a plain object.
  meta: Accessor<Record<LineId, LineMeta>>;
  // Lines whose meta changed after the first sync with the server, i.e. lines
  // edited (by anyone) while this card is open.
  updated: Accessor<ReadonlySet<LineId>>;
  // Marks lines the user has just edited, without waiting for their meta to
  // be written to the Y.Map. The entry is shown until the Y.Map reports the
  // same line.
  touch: (ids: LineId[], entry: LineMeta) => void;
}

// Keeps the line meta of a card's Y.Doc current whenever the map changes
// (local or remote). Each change copies the whole map, which is cheap at one
// small entry per edited line. Must be called inside a reactive owner: the
// observers are removed on cleanup.
//
// "updated" only collects changes made after the provider's first sync:
// everything that arrives before (IndexedDB, the server's current state) is
// what the card looked like when it was opened. The user's own edits count
// too, like in Cosense. Without a provider (a draft) only the user's own
// edits are collected.
//
// A doc handed over from a draft already holds the meta of those edits when
// this runs, so they start as "updated". A fresh doc has an empty map here,
// since IndexedDB and the server only fill it later.
export function createLineMeta(
  ydoc: Y.Doc,
  provider?: WebsocketProvider,
  // True for a doc handed over from a draft, whose meta is all the user's own
  // edits. Otherwise the meta already in the doc is how the card looked when
  // it was opened.
  startUpdated = false,
): LineMetaStore {
  const map = lineMetaMap(ydoc);
  const [meta, setMeta] = createSignal<Record<LineId, LineMeta>>(map.toJSON());
  const [updated, setUpdated] = createSignal<ReadonlySet<LineId>>(
    new Set(startUpdated ? map.keys() : []),
  );
  // Meta of the user's recent edits that is not in the Y.Map yet.
  const [local, setLocal] = createSignal<Record<LineId, LineMeta>>({});

  let live = provider?.synced ?? false;
  const onSync = (synced: boolean) => {
    if (synced) live = true;
  };
  provider?.on("sync", onSync);

  const refresh = (event: Y.YMapEvent<LineMeta>) => {
    setMeta(map.toJSON());
    // The Y.Map now holds these lines' meta, so the overlay is obsolete.
    setLocal((prev) => {
      const next = { ...prev };
      for (const key of event.keysChanged) delete next[key];
      return next;
    });
    if (!live) return;
    setUpdated((prev) => new Set([...prev, ...event.keysChanged]));
  };
  map.observe(refresh);

  const touch = (ids: LineId[], entry: LineMeta) => {
    setLocal((prev) => ({
      ...prev,
      ...Object.fromEntries(ids.map((id) => [id, entry])),
    }));
    setUpdated((prev) => new Set([...prev, ...ids]));
  };

  // Edits of other users show up at once through the text itself, without
  // waiting for their meta (written after their debounce) to arrive. Who made
  // the edit is not known yet: the overlay carries no name until the Y.Map
  // reports the line (see refresh). Everything before the first sync is the
  // card as it was opened, and the user's own edits are reported by the line
  // meta writer.
  const ytext = ydoc.getText("content");
  const onText = (event: Y.YTextEvent) => {
    if (!live || event.transaction.local) return;
    // The ids must be read now, while the text is the one the event refers
    // to. The report itself is deferred: it makes the editor dispatch, and
    // the editor has not applied this change yet (its Yjs binding observes
    // after this observer), so dispatching now hits stale positions.
    const ids = touchedLineIds(ytext, event);
    const at = Date.now();
    queueMicrotask(() => touch(ids, { userId: "", name: "", at }));
  };
  ytext.observe(onText);

  onCleanup(() => {
    map.unobserve(refresh);
    ytext.unobserve(onText);
    provider?.off("sync", onSync);
  });
  const merged = createMemo(() => ({ ...meta(), ...local() }));
  return { meta: merged, updated, touch };
}
