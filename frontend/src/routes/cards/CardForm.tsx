import { createSignal, createEffect, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { Alert } from "@kobalte/core/alert";
import pb from "../../lib/pb";
import DraftCardEditor from "../../components/noteEditor/DraftCardEditor";
import ExistingCardEditor from "../../components/noteEditor/ExistingCardEditor";
import Loading from "../../components/Loading";
import { Trash2, Pin, PinOff } from "../../lib/icons";
import {
  cardsById,
  cardsLoaded,
  mergeCards,
  findCardByPotAndSlug,
} from "../../lib/cardsStore";
import { titleToSegment, segmentToSlug, slugToTitle } from "../../lib/slugify";
import type { TitleCandidate } from "../../lib/titleCandidate";
import { useTitle } from "../../lib/useTitle";
import { useTopBarActions } from "../../lib/topBarSlot";
import { computePosition } from "../../lib/position";
import { deriveCardGridTitle } from "../../lib/cardGridTitle";
import { randomKey } from "../../lib/randomKey";
import { usePot } from "../pots/PotContext";
import type { CardTitle } from "../../lib/cardTitle";
import { shouldDeferServerSlugSync } from "./cardUrlSync";

export interface CardRecord {
  id: string;
  title: CardTitle;
  slug: string;
  description: string;
  image: string;
  pot: string;
  position: number;
  pin: boolean;
  created: string;
  updated: string;
}

type Draft = { key: string; initialTitle?: string };

// Chooses one physical editor mode. A draft owns only a local Y.Doc; an
// existing card owns its IndexedDB and websocket providers. Switching modes
// deliberately remounts the editor so neither provider can survive with the
// wrong room id.
export default function CardForm() {
  const params = useParams();
  const navigate = useNavigate();
  const pot = usePot();
  const [cardId, setCardId] = createSignal<string>();
  const [draft, setDraft] = createSignal<Draft | undefined>(
    params.cardSlug ? undefined : { key: `new:${randomKey()}` },
  );
  const [draftUpdate, setDraftUpdate] = createSignal<Uint8Array>();
  const [mergeTarget, setMergeTarget] = createSignal<string | null>(null);
  let urlSegment = params.cardSlug ?? "";
  let optimisticSegment: string | undefined;

  // The comparison is still necessary because router params react to our own
  // replace navigation. It is intentionally limited to URL echoes; editor
  // identity itself is now derived solely from cardId/draft via keyed Show.
  createEffect(() => {
    if (!params.cardSlug) {
      setCardId(undefined);
      setDraftUpdate(undefined);
      setDraft({ key: `new:${randomKey()}` });
      return;
    }
    const potId = pot()?.id;
    if (!potId || !cardsLoaded()) return;
    if (params.cardSlug === urlSegment && cardId()) return;

    const slug = segmentToSlug(params.cardSlug);
    const record = findCardByPotAndSlug(potId, slug);
    setDraftUpdate(undefined);
    if (record) {
      setCardId(record.id);
      setDraft(undefined);
    } else {
      setCardId(undefined);
      setDraft({
        key: `draft:${potId}:${slug}`,
        initialTitle: slugToTitle(slug),
      });
    }
  });

  const replaceUrl = (segment: string) => {
    if (segment === urlSegment) return;
    urlSegment = segment;
    navigate(`/${params.slug}/${segment}`, { replace: true });
  };

  const handleLiveTitleChange = (candidate: TitleCandidate) => {
    if (!cardId() || !candidate) return;
    optimisticSegment = titleToSegment(candidate);
    replaceUrl(optimisticSegment);
  };

  // Do not overwrite the immediate local slug with the old server title while
  // a title request is in flight. The response updates cardsById, which then
  // becomes the authoritative replacement (including server conflict suffixes).
  createEffect(() => {
    const id = cardId();
    if (!id) return;
    const title = cardsById[id]?.title;
    if (!title) return;
    const serverSegment = titleToSegment(title);
    if (shouldDeferServerSlugSync(optimisticSegment, serverSegment)) return;
    optimisticSegment = undefined;
    replaceUrl(serverSegment);
  });

  const handleCreated = (id: string, update: Uint8Array) => {
    setDraftUpdate(update);
    setCardId(id);
    setDraft(undefined);
  };

  const handleDelete = async () => {
    const id = cardId();
    if (!id) return;
    await pb.collection("cards").delete(id);
    navigate(`/${params.slug}`);
  };

  const pinned = () => cardsById[cardId() ?? ""]?.pin ?? false;
  const nextPinnedPosition = (excludeId: string) => {
    const potId = cardsById[excludeId]?.pot;
    const positions = Object.values(cardsById)
      .filter((card) => card.pot === potId && card.pin && card.id !== excludeId)
      .map((card) => card.position);
    return computePosition(
      undefined,
      positions.length ? Math.min(...positions) : undefined,
    );
  };
  const togglePin = async () => {
    const id = cardId();
    if (!id) return;
    const nowPinning = !pinned();
    try {
      const updated = await pb.collection("cards").update<CardRecord>(id, {
        pin: nowPinning,
        ...(nowPinning ? { position: nextPinnedPosition(id) } : {}),
      });
      mergeCards([updated]);
    } catch {
      // A failed pin mutation leaves the shared store unchanged.
    }
  };

  useTitle(() => {
    const potTitle = pot()?.title;
    const card = cardId() ? cardsById[cardId()!] : undefined;
    return potTitle
      ? card
        ? `${deriveCardGridTitle(card)} - ${potTitle}`
        : potTitle
      : undefined;
  });
  useTopBarActions(() => (
    <Show when={cardId()}>
      <button
        type="button"
        aria-label={pinned() ? "Unpin card" : "Pin card"}
        class="icon-btn shrink-0"
        onClick={togglePin}
      >
        <Show when={pinned()} fallback={<Pin size={20} />}>
          <PinOff size={20} />
        </Show>
      </button>
      <button
        type="button"
        aria-label="Delete card"
        class="icon-btn shrink-0"
        onClick={handleDelete}
      >
        <Trash2 size={20} />
      </button>
    </Show>
  ));

  return (
    <Show when={cardsLoaded() && (cardId() || draft())} fallback={<Loading />}>
      <div class="flex flex-col">
        <Show when={mergeTarget()}>
          <Alert class="mb-2 rounded-md border border-[#dc3545] bg-card px-3 py-2 text-sm text-[#dc3545]">
            "{mergeTarget()}" already exists.
          </Alert>
        </Show>
        <Show
          when={cardId()}
          keyed
          fallback={
            <Show when={draft()} keyed>
              {(value) => (
                <DraftCardEditor
                  potId={() => pot()?.id}
                  potSlug={() => params.slug}
                  initialTitle={value.initialTitle}
                  draftKey={value.key}
                  onCreated={handleCreated}
                  onMergeTarget={setMergeTarget}
                />
              )}
            </Show>
          }
        >
          {(id) => (
            <ExistingCardEditor
              cardId={id}
              potSlug={() => params.slug}
              initialUpdate={draftUpdate()}
              existingTitle={cardsById[id]?.title}
              onMergeTarget={setMergeTarget}
              onLiveTitleChange={handleLiveTitleChange}
            />
          )}
        </Show>
      </div>
    </Show>
  );
}
