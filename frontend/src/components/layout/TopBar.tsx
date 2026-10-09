import { createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { Plus } from "@/lib/icons";
import { titleToSegment } from "@/lib/models/slugify";
import PotIcon from "../PotIcon";

import ThemeToggle from "./ThemeToggle";
import TitleSearch from "./TitleSearch";

import UserMenu from "./UserMenu";
import { topBarActions, topBarPotLink } from "@/lib/topBarSlot";

export interface TopBarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  // Extra classes for the outer <header>, so callers can control the
  // bar's height/padding (e.g. "h-10 py-0") without editing this
  // component. Falls back to the original spacing when omitted.
  class?: string;
}

// The hamburger button here only toggles the Sidebar (owned by
// MainLayout, passed in as sidebarOpen/onToggleSidebar). There is no
// separate mobile-only menu anymore.
export default function TopBar(props: TopBarProps) {
  // The text typed in the title search. The "add card" button opens the card
  // with this title, exactly like following a wiki link: an existing card
  // opens, otherwise a draft with that title starts (see CardForm).
  const [query, setQuery] = createSignal("");
  const addCardHref = () => {
    const slug = topBarPotLink()!.slug;
    const title = query().trim();
    return title
      ? `/${slug}/${titleToSegment(title)}`
      : `/${slug}/new`;
  };

  return (
    <header
      // fixed (not sticky): TopBar must float above the scrollable
      // content rather than sit in normal flex flow, or there is
      // nothing visually behind it for backdrop-blur to blur (see
      // MainLayout's matching pt-10 on <main>/Sidebar's nav).
      class={`fixed inset-x-0 top-0 z-40 flex items-center border-b border-border bg-nav/70 backdrop-blur-[10px] ${props.class}`}
    >
      <div class="grid w-full grid-cols-[1fr_auto_1fr] items-center px-2 md:px-8">
        <div class="flex items-center  justify-self-start">
          {/* The sidebar is always collapsed by default, so this
              toggle is shown on every device. Its icon is the current
              pot's cover, mirroring the user icon on the right. */}
          <button
            type="button"
            onClick={() => props.onToggleSidebar()}
            aria-label="Toggle sidebar"
            aria-expanded={props.sidebarOpen}
            class="icon-btn flex items-center justify-center"
          >
            <PotIcon src={topBarPotLink()?.cover} />
          </button>
          {/* Current pot's name, when the active page registered one
              (see CardList/CardForm's useTopBarPotLink call). Links
              back to that pot's card list. */}
          <Show when={topBarPotLink()}>
            <A
              href={`/${topBarPotLink()!.slug}`}
              class="truncate rounded-full px-3 py-1 font-sans text-lg font-bold transition-colors hover:bg-hover-bg"
            >
              {topBarPotLink()!.name}
            </A>
          </Show>
        </div>

        {/* Center slot: "add card" and the title search are shared between
            CardList and CardForm (both register a pot link via
            useTopBarPotLink), so they live here instead of being
            duplicated as per-page controls. Only shown while a pot is in
            context -- there's nothing to add to or search from the pots
            list itself. */}
        <div class="col-search justify-self-center">
          <Show when={topBarPotLink()}>
            <A
              href={addCardHref()}
              aria-label="Add card"
              title="New"
              class="new-button flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(144,30%,50%)] text-white transition-colors hover:bg-[hsl(153,10%,50%)]"
            >
              <Plus size={20} strokeWidth={4} />
            </A>
            <TitleSearch
              potId={topBarPotLink()!.id}
              potSlug={topBarPotLink()!.slug}
              onQueryChange={setQuery}
            />
          </Show>
        </div>

        <nav class="flex items-center gap-1 justify-self-end">
          {/* Per-page actions slot (see lib/topBarSlot.ts): renders
              whatever the currently mounted page registered via
              useTopBarActions, e.g. CardForm's pin/delete buttons.
              Empty on pages that register nothing. */}
          {topBarActions()}

          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
