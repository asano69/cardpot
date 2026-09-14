import { createSignal } from "solid-js";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import NoteEditor from "./index";
import { updateCardTitle } from "../../lib/cardApi";
import { mergeCards } from "../../lib/cardsStore";
import type { TitleCandidate } from "../../lib/titleCandidate";

export interface ExistingCardEditorProps {
  cardId: string;
  potSlug: () => string;
  initialUpdate?: Uint8Array;
  onMergeTarget?: (target: string | null) => void;
  onLiveTitleChange?: (candidate: TitleCandidate) => void;
  onTitleResolved?: (candidate: TitleCandidate) => void;
}

// Existing cards own the network lifecycle. Applying a just-created draft
// update before creating the providers guarantees body text survives the
// draft-to-existing component replacement.
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
  const [saveError, setSaveError] = createSignal(false);
  let inFlight = false;
  let pending: TitleCandidate | null = null;
  let lastResolved: TitleCandidate | null = null;

  const send = async (candidate: TitleCandidate) => {
    inFlight = true;
    try {
      const result = await updateCardTitle(props.cardId, candidate);
      setSaveError(false);
      lastResolved = candidate;
      mergeCards([result.card]);
      props.onMergeTarget?.(result.mergeTarget);
      props.onTitleResolved?.(candidate);
    } catch (error) {
      console.error("[existing-card-editor] failed to save title:", error);
      setSaveError(true);
    } finally {
      inFlight = false;
      if (pending !== null) {
        const next = pending;
        pending = null;
        void send(next);
      }
    }
  };

  const confirm = (candidate: TitleCandidate) => {
    if (candidate === lastResolved) return;
    if (inFlight) {
      pending = candidate;
      return;
    }
    void send(candidate);
  };

  return (
    <>
      {saveError() && (
        <p class="mb-4 text-sm text-[#dc3545]">
          Failed to save this card. Your text is still here; edit the title
          again to retry.
        </p>
      )}
      <NoteEditor
        ydoc={ydoc}
        cardId={props.cardId}
        provider={provider}
        idbProvider={idbProvider}
        potSlug={props.potSlug}
        onConfirmedTitle={confirm}
        onMergeTarget={props.onMergeTarget}
        onLiveTitleChange={props.onLiveTitleChange}
      />
    </>
  );
}
