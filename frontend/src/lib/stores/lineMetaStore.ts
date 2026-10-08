import { createSignal, onCleanup, type Accessor } from "solid-js";
import type * as Y from "yjs";
import type { LineId } from "../models/lineId";
import { lineMetaMap, type LineMeta } from "../models/lineMeta";

// The line meta of a card's Y.Doc as a plain object, kept current whenever
// the map changes (local or remote). Each change copies the whole map, which
// is cheap at one small entry per edited line. Must be called inside a
// reactive owner: the observer is removed on cleanup.
export function createLineMeta(
  ydoc: Y.Doc,
): Accessor<Record<LineId, LineMeta>> {
  const map = lineMetaMap(ydoc);
  const [meta, setMeta] = createSignal<Record<LineId, LineMeta>>(map.toJSON());
  const refresh = () => setMeta(map.toJSON());
  map.observe(refresh);
  onCleanup(() => map.unobserve(refresh));
  return meta;
}
