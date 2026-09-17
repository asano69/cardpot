import { createSignal, onCleanup } from "solid-js";
import * as Y from "yjs";
import NoteEditor from "./index";
import { createCard } from "../../lib/cardApi";
import type { TitleCandidate } from "../../lib/titleCandidate";
import { mergeCards } from "../../lib/cardsStore";

export interface DraftCardEditorProps {
  potId: () => string | undefined;
  potSlug: () => string;
  initialTitle?: string;
  onCreated: (cardId: string, ydoc: Y.Doc) => void;
  onMergeTarget?: (target: string | null) => void;
}

// A draft's Y.Doc is purely in-memory: no WebsocketProvider, and (unlike
// an existing card, see ExistingCardEditor.tsx) no IndexedDB persistence
// either. Persisting a draft under a slug-derived key used to leave stale
// updates behind whenever a draft was abandoned without confirming a
// title -- revisiting the same nonexistent page later would then merge
// that old content into the fresh doc unpredictably (e.g. "test" ->
// "testtest", or worse). Keeping the draft in memory only avoids that
// entirely; once createCard succeeds, the Y.Doc itself -- not a
// re-encoded snapshot -- is handed to ExistingCardEditor, which reuses
// the same instance before connecting to the room. Handing off the live
// doc instead of Y.encodeStateAsUpdate()/Y.applyUpdate() removes any risk
// of the snapshot missing an edit that hadn't yet been reflected at the
// moment it was taken.
export default function DraftCardEditor(props: DraftCardEditorProps) {
  const ydoc = new Y.Doc();
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
      props.onCreated(result.card.id, ydoc);
    } catch (error) {
      console.error("[draft-card-editor] failed to create card:", error);
      setSaveError(true);
    } finally {
      creating = false;
    }
  };

  onCleanup(() => {
    // Only destroy the Y.Doc if it was never handed off: once
    // ExistingCardEditor has taken ownership, this component must leave
    // it alone rather than destroying the doc out from under it.
    if (!created) ydoc.destroy();
  });

  return (
    <>
      {saveError() && (
        <p class="mb-4 text-sm text-[#dc3545]">
          Failed to create this card. Your text is preserved in this session
          -- edit the title again to retry.
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
