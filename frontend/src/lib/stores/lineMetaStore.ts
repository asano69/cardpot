import { createSignal, onCleanup, type Accessor } from "solid-js";
import type * as Y from "yjs";
import type { WebsocketProvider } from "y-websocket";
import type { LineId } from "../models/lineId";
import { lineMetaMap, type LineMeta } from "../models/lineMeta";

export interface LineMetaStore {
  // The line meta of the card as a plain object.
  meta: Accessor<Record<LineId, LineMeta>>;
  // Lines whose meta changed after the first sync with the server, i.e. lines
  // edited (by anyone) while this card is open.
  updated: Accessor<ReadonlySet<LineId>>;
}

// Keeps the line meta of a card's Y.Doc current whenever the map changes
// (local or remote). Each change copies the whole map, which is cheap at one
// small entry per edited line. Must be called inside a reactive owner: the
// observers are removed on cleanup.
//
// "updated" only collects changes made after the provider's first sync:
// everything that arrives before (IndexedDB, the server's current state) is
// what the card looked like when it was opened. The user's own edits count
// too, like in Cosense. Without a provider (a draft) nothing is ever
// collected.
export function createLineMeta(
  ydoc: Y.Doc,
  provider?: WebsocketProvider,
): LineMetaStore {
  const map = lineMetaMap(ydoc);
  const [meta, setMeta] = createSignal<Record<LineId, LineMeta>>(map.toJSON());
  const [updated, setUpdated] = createSignal<ReadonlySet<LineId>>(new Set());

  let live = provider?.synced ?? false;
  const onSync = (synced: boolean) => {
    if (synced) live = true;
  };
  provider?.on("sync", onSync);

  const refresh = (event: Y.YMapEvent<LineMeta>) => {
    setMeta(map.toJSON());
    if (!live) return;
    setUpdated((prev) => new Set([...prev, ...event.keysChanged]));
  };
  map.observe(refresh);

  onCleanup(() => {
    map.unobserve(refresh);
    provider?.off("sync", onSync);
  });
  return { meta, updated };
}
