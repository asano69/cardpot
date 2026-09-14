import { createSignal, onCleanup } from "solid-js";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import NoteEditor from "./index";
import { createCard } from "../../lib/cardApi";
import type { TitleCandidate } from "../../lib/titleCandidate";
import { mergeCards } from "../../lib/cardsStore";

export interface DraftCardEditorProps {
  potId: () => string | undefined;
  potSlug: () => string;
  initialTitle?: string;
  draftKey: string;
  onCreated: (cardId: string, update: Uint8Array) => void;
  onMergeTarget?: (target: string | null) => void;
}

// A draft deliberately has no WebsocketProvider. Its Y.Doc is local and
// persisted until createCard succeeds, at which point its full state is handed
// to ExistingCardEditor before that editor connects to the room.
export default function DraftCardEditor(props: DraftCardEditorProps) {
  const ydoc = new Y.Doc();
  const idbProvider = new IndexeddbPersistence(props.draftKey, ydoc);
  const [saveError, setSaveError] = createSignal(false);
  let creating = false;
  let created = false;

  const create = async (candidate: TitleCandidate) => {
    if (creating || created) return;
    creating = true;
    try {
      const potId = props.potId();
      if (!potId) return;
      const result = await createCard(potId, candidate);
      mergeCards([result.card]);
      created = true;
      setSaveError(false);
      props.onMergeTarget?.(result.mergeTarget);
      props.onCreated(result.card.id, Y.encodeStateAsUpdate(ydoc));
    } catch (error) {
      console.error("[draft-card-editor] failed to create card:", error);
      setSaveError(true);
    } finally {
      creating = false;
    }
  };

  onCleanup(() => {
    idbProvider.destroy();
    ydoc.destroy();
  });

  return (
    <>
      {saveError() && (
        <p class="mb-4 text-sm text-[#dc3545]">
          Failed to create this card. Your text is saved locally; edit the title
          again to retry.
        </p>
      )}
      <NoteEditor
        ydoc={ydoc}
        potSlug={props.potSlug}
        initialTitle={props.initialTitle}
        autofocus
        onConfirmedTitle={create}
      />
    </>
  );
}
