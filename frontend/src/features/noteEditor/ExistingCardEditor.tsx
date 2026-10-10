/* eslint-disable solid/reactivity --
   This component is keyed by cardId (see CardForm), so it is remounted per
   card and its props are intentionally read once during setup. */
import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import NoteEditor from "./index";
import Loading from "@/components/Loading";
import RelatedCards from "@/pages/cards/RelatedCards";
import type { TitleCandidate } from "@/lib/models/card";
import { extractLinks } from "@/lib/models/extractLinks";
import { authToken, currentUser } from "@/lib/api/auth";
import { cardsById } from "@/lib/stores/cardsStore";
import { closeOwnLinks, setOwnLinks } from "@/lib/stores/relatedStore";
import { trackUnread } from "@/lib/stores/unreadStore";
import { setLocalUser } from "./awareness";

// Wait this long after the last edit before the open card's links are
// extracted again.
const LINKS_DEBOUNCE_MS = 300;

// How long to wait for the server's text when this device has none stored,
// so an offline user is not left waiting forever.
const READY_TIMEOUT_MS = 1500;

export interface ExistingCardEditorProps {
  cardId: string;
  potSlug: () => string;
  // The live Y.Doc handed off from DraftCardEditor's create() call,
  // already holding everything the user typed while drafting. Reused
  // directly (not re-created via encode/applyUpdate) so the body text
  // can never be lost in an encode/decode round trip. Omitted when
  // opening a card that wasn't just created from a draft.
  initialYdoc?: Y.Doc;
  existingTitle?: string;
  // Forwarded straight to NoteEditor (see its own initialSelection comment).
  initialSelection?: { anchor: number; head: number };
  // Called once, synchronously, with a getter for this card's current
  // Yjs text content -- used by CardForm's debug "info" button to
  // export a readable snapshot of the live document. Not reactive:
  // the returned string reflects whatever the doc holds at the
  // moment the getter is actually invoked, not at registration time.
  onContentSnapshot?: (getContent: () => string) => void;
  // Reports whether the editor is shown yet. Reported false again when this
  // editor goes away, so the caller never keeps a stale "ready".
  onReady?: (ready: boolean) => void;
}

// Existing cards own the network lifecycle. Reusing the draft's own Y.Doc
// (see initialYdoc above) before creating the providers guarantees body
// text survives the draft-to-existing component replacement.
//
// Title resolution for an existing card is no longer driven from here: the
// server watches this room's live Yjs document directly (see
// internal/serve/title_watch.go) and resolves+persists the title itself,
// debounced the same way the old client-side flow was. That update reaches
// this client through the shared "cards" realtime subscription (see
// lib/stores/cardsStore.ts), so no HTTP round-trip -- and therefore no save-failure
// state -- is needed here anymore.
export default function ExistingCardEditor(props: ExistingCardEditorProps) {
  const ydoc = props.initialYdoc ?? new Y.Doc();
  // Hand the caller a getter for this room's live "content" text,
  // mirroring index.tsx's own `ytext = props.ydoc.getText("content")`.
  // Synchronous, not an effect: `ydoc` already exists by this point in
  // the component body, so there's nothing to wait on.
  props.onContentSnapshot?.(() => ydoc.getText("content").toString());
  const user = currentUser();
  // The local copy is keyed by user as well as by card: trackUnread treats
  // everything in it as already seen by the user, so a copy left by another
  // user of this browser would hide the lines that are unread for this one.
  const idbName = `${user?.id ?? "anonymous"}:${props.cardId}`;
  const idbProvider = new IndexeddbPersistence(idbName, ydoc);
  const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
  const provider = new WebsocketProvider(
    `${wsProtocol}//${location.host}/yjs`,
    props.cardId,
    ydoc,
    // A browser WebSocket cannot send an Authorization header, so the token
    // goes in the query string (see internal/serve/yjs_auth.go).
    // connect: false because trackUnread must read what this device stored
    // before the server can add anything to it, so it connects once that is
    // done (see trackUnread).
    { params: { token: authToken() }, connect: false },
  );
  // The token in the URL was fixed when the provider was created and may have
  // expired since (the server also closes the connection at expiry). Every
  // reconnect therefore presents the current one, which AuthGate keeps fresh
  // (see refreshSession in lib/api/auth.ts).
  provider.on("connection-close", () => {
    provider.params.token = authToken();
  });

  // Lets the other peers draw this tab's cursor with the user's name.
  if (user) setLocalUser(provider.awareness, user);

  // The editor is mounted only once the doc holds the card's text, so it is
  // created with its final content instead of being filled in piece by piece
  // (which showed bullets and an empty page before the text). A doc handed
  // over from a draft already has its text.
  const [ready, setReady] = createSignal(props.initialYdoc !== undefined);
  let readyTimer: ReturnType<typeof setTimeout> | undefined;
  const onFirstSync = (synced: boolean) => {
    if (synced) setReady(true);
  };
  createEffect(() => props.onReady?.(ready()));
  if (!ready()) {
    idbProvider.whenSynced.then(() => {
      if (ydoc.getText("content").length > 0) {
        setReady(true);
        return;
      }
      // Nothing stored on this device: wait for the server, but not forever.
      provider.on("sync", onFirstSync);
      readyTimer = setTimeout(() => setReady(true), READY_TIMEOUT_MS);
    });
  }

  // Kept only because NoteEditor requires an onConfirmedTitle callback --
  // resolution itself now happens server-side (see the file comment above),
  // so there's nothing left to do here on confirm.
  const confirm = (_candidate: TitleCandidate) => {};

  // Keeps the related view's links of the open card in step with the live
  // text. An empty text means nothing has synced yet, so it is skipped
  // instead of wiping the links read from the replica; the first sync fires
  // the observer anyway.
  const ytext = ydoc.getText("content");
  let linksTimer: ReturnType<typeof setTimeout> | undefined;
  const updateOwnLinks = () => {
    const text = ytext.toString();
    const pot = cardsById[props.cardId]?.pot;
    if (text === "" || !pot) return;
    setOwnLinks(props.cardId, pot, extractLinks(text));
  };
  const scheduleOwnLinks = () => {
    clearTimeout(linksTimer);
    linksTimer = setTimeout(updateOwnLinks, LINKS_DEBOUNCE_MS);
  };
  ytext.observe(scheduleOwnLinks);
  scheduleOwnLinks(); // a handed-off draft already holds text

  // Works out which lines are unread and keeps the server's "seen" current
  // (see lib/stores/unreadStore.ts).
  const stopUnread = trackUnread(props.cardId, ydoc, idbName, provider);

  onCleanup(() => {
    stopUnread(); // before the doc is destroyed below: it sends the final state
    clearTimeout(linksTimer);
    clearTimeout(readyTimer);
    provider.off("sync", onFirstSync);
    props.onReady?.(false);
    ytext.unobserve(scheduleOwnLinks);
    closeOwnLinks(props.cardId);
    provider.destroy();
    idbProvider.destroy();
    ydoc.destroy();
  });

  return (
    <Show when={ready()} fallback={<Loading />}>
      <NoteEditor
        ydoc={ydoc}
        cardId={props.cardId}
        provider={provider}
        draftHandoff={props.initialYdoc !== undefined}
        potSlug={props.potSlug}
        onConfirmedTitle={confirm}
        existingTitle={props.existingTitle}
        initialSelection={props.initialSelection}
      >
        <RelatedCards
          cardId={props.cardId}
          title={props.existingTitle}
          potSlug={props.potSlug()}
        />
      </NoteEditor>
    </Show>
  );
}
