import { createSignal, createEffect, Show, untrack } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { Alert } from "@kobalte/core/alert";
import type * as Y from "yjs";
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
import { useTitle } from "../../lib/useTitle";
import { useFooterSlot } from "../../lib/footerSlot";
import { computePosition } from "../../lib/position";
import { deriveCardGridTitle, type CardRecord } from "../../lib/domain/card";
import { usePot } from "../pots/PotContext";

type Draft = { initialTitle?: string };

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
    params.cardSlug ? undefined : {},
  );
  const [draftYdoc, setDraftYdoc] = createSignal<Y.Doc>();
  const [mergeTarget, setMergeTarget] = createSignal<string | null>(null);
  let urlSegment = params.cardSlug ?? "";

  // The comparison is still necessary because router params react to our own
  // replace navigation. It is intentionally limited to URL echoes; editor
  // identity itself is now derived solely from cardId/draft via keyed Show.
  createEffect(() => {
    if (!params.cardSlug) {
      setCardId(undefined);
     setDraftYdoc(undefined);
      setDraft({});
      return;
    }
    const potId = pot()?.id;
    if (!potId || !cardsLoaded()) return;

    // Compare decoded forms: urlSegment holds the raw (unencoded) slug,
    // but params.cardSlug reflects the URL's actual path, which the
    // browser percent-encodes for any non-ASCII text (e.g. Japanese)
    // even though titleToSegment/replaceUrl never encoded it themselves.
    // Comparing the raw encoded param against the raw slug therefore
    // never matched for non-ASCII titles, so this guard silently fell
    // through on every keystroke instead of short-circuiting.
    const slug = segmentToSlug(params.cardSlug);
    if (slug === urlSegment && cardId()) return;
    // Reading cardsById via findCardByPotAndSlug must not make this effect
    // re-run on every unrelated cardsById mutation. Without untrack, the
    // mergeCards() call inside DraftCardEditor's create() -- which runs
    // before onCreated/handleCreated hands off the draft's own Y.Doc --
    // used to make this effect "discover" the just-created record on its
    // own and resolve cardId here first, so ExistingCardEditor mounted
    // with a brand-new empty Y.Doc instead of the draft's real one.
    const record = untrack(() => findCardByPotAndSlug(potId, slug));
    setDraftYdoc(undefined)
    if (record) {
      setCardId(record.id);
      setDraft(undefined);
    } else {
      setCardId(undefined);
      setDraft({ initialTitle: slugToTitle(slug) });
    }
  });

  // Updates only the browser's address bar, bypassing Solid Router's own
  // navigate(). navigate() also updates Router's reactive location/params
  // signals, which re-fires every effect that reads them -- including this
  // component's own top createEffect (which reads params.cardSlug) -- and
  // that visibly re-evaluates the page even though the open card never
  // actually changes. history.replaceState() fires no popstate event, so
  // Router's signals (and this component's own reactivity) stay untouched;
  // only what's shown in the address bar changes.
  const replaceUrl = (segment: string) => {
    if (segment === urlSegment) return;
    urlSegment = segment;
    window.history.replaceState(
      window.history.state,
      "",
      `/${params.slug}/${segment}`,
    );
  };

  // Keeps the address bar's slug in sync with the server-resolved title
  // (see internal/serve/title_watch.go). replaceUrl() only touches
  // history.replaceState, so this causes no visible re-render or remount
  // (see replaceUrl's own comment above).
  createEffect(() => {
    const id = cardId();
    if (!id) return;
    const title = cardsById[id]?.title;
    if (!title) return;
    replaceUrl(titleToSegment(title));
  });

  const handleCreated = (id: string, ydoc: Y.Doc) => {
    setDraftYdoc(ydoc);
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
  // Footer's status-bar slot: the open card's own title. Only shown
  // once a real card exists -- a still-unresolved draft has no title
  // to show yet (see DraftCardEditor, which creates the record only
  // after the header is confirmed).
  // Debug-only indicator of which editor mode is currently mounted: a
  // draft only owns a local Y.Doc and has no "cards" record yet (see
  // DraftCardEditor), while an existing card has already synced
  // against its own room (see ExistingCardEditor). Surfacing this in
  // the footer makes it easy to tell which one is active without
  // reading logs.
  const editorMode = () => (cardId() ? "editor" : draft() ? "draft" : undefined);

  useFooterSlot(() => {
    const id = cardId();
    const card = id ? cardsById[id] : undefined;
    return (
      <>
        {card && <div class="page-title">{deriveCardGridTitle(card)}</div>}
        <Show when={editorMode()}>
          <div class="page-list-status">
            <span class="item">{editorMode()}</span>
          </div>
        </Show>
      </>
    );
  });
  return (
    <Show when={cardsLoaded() && (cardId() || draft())} fallback={<Loading />}>
      <div class="page-column">
        <div class="col-page flex flex-col">
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
                initialYdoc={draftYdoc()}
                existingTitle={cardsById[id]?.title}
                onMergeTarget={setMergeTarget}
              />
            )}
          </Show>
        </div>
        {/* Sticky vertical menu to the right of the editor: the open
            card's pin/delete actions, moved here from TopBar so they
            sit next to the editor instead of at the top of the page.
            Hidden for a draft, which has no card to pin or delete
            yet. */}
        <div class="page-menu flex flex-col gap-1">
          <Show when={cardId()}>
            <button
              type="button"
              aria-label={pinned() ? "Unpin" : "Pin"}
              class="tool-btn"
              onClick={togglePin}
            >
              {pinned() ? <PinOff size={20} /> : <Pin size={20} />}
            </button>
            <button
              type="button"
              aria-label="Delete"
              class="tool-btn"
              onClick={handleDelete}
            >
              <Trash2 size={20} />
            </button>
          </Show>
        </div>
      </div>
    </Show>
  );
}
