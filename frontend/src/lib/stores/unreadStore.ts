import { createSignal } from "solid-js";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import type { WebsocketProvider } from "y-websocket";
import { fetchSeen, postSeen } from "../api/cardApi";
import type { LineId } from "../models/lineId";
import {
  linesWithUnseenChars,
  mergeSeen,
  seenOf,
  type Seen,
} from "../models/unseen";

// How often what the user has seen is sent to the server while a card is open.
const SEND_INTERVAL_MS = 30_000;

const NONE: ReadonlySet<LineId> = new Set();

// The lines that were unread when a card was opened, tagged with the card
// they belong to, so a snapshot left over from a card that was just closed
// can never show up under another card. Fixed until the card is closed.
interface Snapshot {
  cardId: string;
  ids: Set<LineId>;
}

const [snapshot, setSnapshot] = createSignal<Snapshot | undefined>();

// The unread line ids of a card. Reactive when called inside a tracking scope.
export function unreadLineIdsOf(
  cardId: string | undefined,
): ReadonlySet<LineId> {
  const current = snapshot();
  return current && current.cardId === cardId ? current.ids : NONE;
}

// What this device stored in IndexedDB under `name`. This is only the user's
// own view of the card if nothing from the server has been written yet:
// y-indexeddb stores every update the open doc receives, so the caller must
// read it before connecting the websocket.
async function readStoredSeen(name: string): Promise<Seen> {
  const doc = new Y.Doc();
  const idb = new IndexeddbPersistence(name, doc);
  try {
    await idb.whenSynced;
    return seenOf(doc);
  } finally {
    await idb.destroy();
    doc.destroy();
  }
}

// Resolves once the websocket has completed its first sync.
function whenSynced(provider: WebsocketProvider): Promise<void> {
  if (provider.synced) return Promise.resolve();
  return new Promise((resolve) => {
    const onSync = (synced: boolean) => {
      if (!synced) return;
      provider.off("sync", onSync);
      resolve();
    };
    provider.on("sync", onSync);
  });
}

// Works out which lines of an open card are unread and keeps the server's
// "seen" of the user up to date. Returns a function that stops it.
//
// The order matters: the stored state is read before the websocket is
// connected (the provider must be created with connect: false), since the
// server's text would otherwise end up in IndexedDB and count as seen. The
// snapshot is taken before anything is sent, since sending marks everything
// as seen. Offline (the server's "seen" cannot be read) nothing is tracked
// and nothing is sent.
export function trackUnread(
  cardId: string,
  ydoc: Y.Doc,
  idbName: string,
  provider: WebsocketProvider,
): () => void {
  let stopped = false;
  let baseline: Seen | undefined;
  const cleanups: (() => void)[] = [];

  // Sends everything this device has, which includes the user's own edits.
  const send = (keepalive = false) => {
    if (!baseline) return;
    const seen = mergeSeen(baseline, seenOf(ydoc));
    postSeen(cardId, seen, keepalive).catch((err) =>
      console.error("[unread] failed to send seen:", err),
    );
  };

  const start = async () => {
    // What this device had before the network: offline edits are only here.
    const localSeen = await readStoredSeen(idbName);
    if (stopped) return;
    provider.connect();

    const serverSeen = await fetchSeen(cardId);
    await whenSynced(provider);
    if (stopped) return;

    baseline = mergeSeen(serverSeen, localSeen);
    setSnapshot({
      cardId,
      ids: linesWithUnseenChars(ydoc.getText("content"), baseline),
    });
    send();

    const timer = setInterval(send, SEND_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") send(true);
    };
    const onPageHide = () => send(true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    cleanups.push(() => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    });
  };

  start().catch((err) => console.error("[unread] failed to start:", err));

  return () => {
    // Called before the doc is destroyed, so the final state is still there.
    send(true);
    stopped = true;
    cleanups.forEach((cleanup) => cleanup());
    if (snapshot()?.cardId === cardId) setSnapshot(undefined);
  };
}
