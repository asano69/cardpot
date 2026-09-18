import { onCleanup } from "solid-js";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import NoteEditor from "./index";
import type { TitleCandidate } from "@/lib/models/card";

export interface ExistingCardEditorProps {
  cardId: string;
  potSlug: () => string;
  // The live Y.Doc handed off from DraftCardEditor's create() call,
  // already holding everything the user typed while drafting. Reused
  // directly (not re-created via encode/applyUpdate) so the body text
  // can never be lost in an encode/decode round trip. Omitted when
  // opening a card that wasn't just created from a draft.
  initialYdoc?: Y.Doc;
  onMergeTarget?: (target: string | null) => void;
  existingTitle?: string;
  // Called once, synchronously, with a getter for this card's current
  // Yjs text content -- used by CardForm's debug "info" button to
  // export a readable snapshot of the live document. Not reactive:
  // the returned string reflects whatever the doc holds at the
  // moment the getter is actually invoked, not at registration time.
  onContentSnapshot?: (getContent: () => string) => void;
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
  const idbProvider = new IndexeddbPersistence(props.cardId, ydoc);
  const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
  const provider = new WebsocketProvider(
    `${wsProtocol}//${location.host}/yjs`,
    props.cardId,
    ydoc,
  );

  // Kept only because NoteEditor requires an onConfirmedTitle callback --
  // resolution itself now happens server-side (see the file comment above),
  // so there's nothing left to do here on confirm.
  const confirm = (_candidate: TitleCandidate) => {};

  onCleanup(() => {
    provider.destroy();
    idbProvider.destroy();
    ydoc.destroy();
  });

  return (
    <NoteEditor
      ydoc={ydoc}
      provider={provider}
      potSlug={props.potSlug}
      onConfirmedTitle={confirm}
      existingTitle={props.existingTitle}
    />
  );
}
