import { onCleanup } from "solid-js";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import NoteEditor from "./index";
import type { TitleCandidate } from "../../lib/titleCandidate";

export interface ExistingCardEditorProps {
  cardId: string;
  potSlug: () => string;
  initialUpdate?: Uint8Array;
  onMergeTarget?: (target: string | null) => void;
  onLiveTitleChange?: (candidate: TitleCandidate) => void;
  existingTitle?: string;
}

// Existing cards own the network lifecycle. Applying a just-created draft
// update before creating the providers guarantees body text survives the
// draft-to-existing component replacement.
//
// Title resolution for an existing card is no longer driven from here: the
// server watches this room's live Yjs document directly (see
// internal/serve/title_watch.go) and resolves+persists the title itself,
// debounced the same way the old client-side flow was. That update reaches
// this client through the shared "cards" realtime subscription (see
// lib/cardsStore.ts), so no HTTP round-trip -- and therefore no save-failure
// state -- is needed here anymore.
export default function ExistingCardEditor(props: ExistingCardEditorProps) {
  const ydoc = new Y.Doc();
  if (props.initialUpdate) Y.applyUpdate(ydoc, props.initialUpdate);
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
      onLiveTitleChange={props.onLiveTitleChange}
      existingTitle={props.existingTitle}
    />
  );
}
