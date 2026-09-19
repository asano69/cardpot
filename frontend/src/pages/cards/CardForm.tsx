import { createSignal, createEffect, Show, untrack } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { Alert } from "@kobalte/core/alert";
import type * as Y from "yjs";
import DraftCardEditor from "@/features/noteEditor/DraftCardEditor";
import ExistingCardEditor from "@/features/noteEditor/ExistingCardEditor";
import { getSyntaxTreeJson } from "@/features/noteEditor/debug";
import Loading from "@/components/Loading";
import ActionsMenu from "@/components/menus/ActionsMenu";
import { Trash2, Pin, PinOff, Wrench } from "@/lib/icons";
import {
  cardsById,
  cardsLoaded,
  findCardByPotAndSlug,
  removeCard,
  setCardPinned,
} from "@/lib/stores/cardsStore";
import {
  titleToSegment,
  segmentToSlug,
  slugToTitle,
} from "@/lib/models/slugify";
import { useTitle } from "@/lib/useTitle";
import { useFooterSlot } from "@/lib/footerSlot";
import { deriveCardGridTitle } from "@/lib/models/card";
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
  // Set only right before a draft's title resolves into a real card
  // (see handleCreated below), so the freshly mounted ExistingCardEditor
  // knows to move the caret into the body instead of leaving it wherever
  // autofocus/sync left it. Reset to undefined everywhere else cardId is
  // set from the normal URL-driven effect, so re-opening an existing
  // card never inherits a stale value from an earlier draft creation.
  const [focusLineOnOpen, setFocusLineOnOpen] = createSignal<number>();
  // Getter for the currently-open card's live Yjs text, handed up by
  // ExistingCardEditor (see its onContentSnapshot prop). Re-registered
  // on every card open, since ExistingCardEditor remounts per card
  // (keyed Show below) -- never stale across a card switch.
  const [contentSnapshot, setContentSnapshot] = createSignal<() => string>();
  let urlSegment = params.cardSlug ?? "";

  // The comparison is still necessary because router params react to our own
  // replace navigation. It is intentionally limited to URL echoes; editor
  // identity itself is now derived solely from cardId/draft via keyed Show.
  createEffect(() => {
    if (!params.cardSlug) {
      setCardId(undefined);
      setDraftYdoc(undefined);
      setDraft({});
      setFocusLineOnOpen(undefined);
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
    setDraftYdoc(undefined);
    setFocusLineOnOpen(undefined);
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
    // Body line 1: right where typing should continue once the title
    // line is confirmed (see NoteEditor's focusLine).
    setFocusLineOnOpen(1);
    setDraftYdoc(ydoc);
    setCardId(id);
    setDraft(undefined);
  };

  const handleDelete = async () => {
    const id = cardId();
    if (!id) return;
    await removeCard(id);
    navigate(`/${params.slug}`);
  };

  // Debug helper: opens the current card's raw Yjs text content
  // (plain text, not the rendered editor view) as a text/plain blob
  // in a new tab, so it can be inspected or copied without leaving
  // the app's own dev tools. See ExistingCardEditor's
  // onContentSnapshot for where this getter comes from.
  const handleShowRawText = () => {
    const getContent = contentSnapshot();
    if (!getContent) return;
    // charset=utf-8 must be explicit: Blob() itself always encodes a
    // JS string as UTF-8 bytes, but without this in the MIME type the
    // browser guesses the encoding when rendering the tab and can
    // misread non-ASCII text (e.g. Japanese) as mojibake.
    const blob = new Blob([getContent()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    // Revoking immediately can race the new tab's read of the blob
    // URL in some browsers, so this waits well past a normal page
    // load before freeing it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  // Debug helper: opens the current editor's syntax tree (see
  // features/noteEditor/debug.ts) as a JSON blob in a new tab, the
  // same way handleShowRawText does for the raw text. Replaces the
  // need to run cardpotDebug.dumpTree() from the browser console.
  const handleDumpSyntaxTree = () => {
    const json = getSyntaxTreeJson();
    if (!json) return;
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const pinned = () => cardsById[cardId() ?? ""]?.pin ?? false;
  const togglePin = async () => {
    const id = cardId();
    if (!id) return;
    try {
      await setCardPinned(id, !pinned());
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
  const editorMode = () =>
    cardId() ? "editor" : draft() ? "draft" : undefined;

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
                onContentSnapshot={(fn) => setContentSnapshot(() => fn)}
                focusLine={focusLineOnOpen()}
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
            {/* Debug-only dropdown: exports either the card's raw Yjs
                text (handleShowRawText) or its parsed syntax tree
                (handleDumpSyntaxTree) as a blob in a new tab, replacing
                the About button's old single-action click. */}
            <ActionsMenu
              label="Debug options"
              triggerClass="tool-btn"
              items={[
                {
                  label: "Show raw text",
                  icon: Wrench,
                  onSelect: handleShowRawText,
                },
                {
                  label: "Dump syntax tree",
                  icon: Wrench,
                  onSelect: handleDumpSyntaxTree,
                },
              ]}
            />
          </Show>
        </div>
      </div>
    </Show>
  );
}
