import { createEffect, createMemo, For, onCleanup, Show } from "solid-js";
import { A } from "@solidjs/router";
import type { Link2HopCard } from "@/lib/api/generated";
import { cardsById } from "@/lib/stores/cardsStore";
import { closeRelated, openRelated, related } from "@/lib/stores/relatedStore";
import { Link, Unlink } from "@/lib/icons";
import { titleToLowerKey, titleToSegment } from "@/lib/models/slugify";
import { asCardTitle, type CardGridCard } from "@/lib/models/card";
import { deadLinks } from "@/lib/models/linkAlive";
import { CardItemView } from "./CardItem";

export interface RelatedCardsProps {
  // Title of the card the relations are shown for. Undefined shows nothing.
  title: string | undefined;
  // Id of the card, when it exists. A draft has none, so it has no
  // datalog query either, but its title can still have incoming links.
  cardId?: string;
  potSlug: string;
}

interface RelationRowProps {
  // Class of the row's outer <div> ("links-1-hop", "links-2-hop", ...).
  rowClass: string;
  // Extra class of the label <li> ("links", "headword", ...).
  labelClass: string;
  label: string;
  // When given, the label links to that page (a 2-hop headword).
  href?: string;
  cards: CardGridCard[];
  potSlug: string;
  // The row holds links whose target does not exist yet: its label shows
  // the unlink icon and its cards are drawn faded.
  empty?: boolean;
}

// One labelled row: a relation label followed by its cards, all in one grid.
function RelationRow(props: RelationRowProps) {
  const count = () => `${props.cards.length} pages`;
  // The label's text, with the link icon below it (the "kamon" of the
  // original design). An empty row shows a broken link instead.
  const labelContent = () => (
    <>
      <span class="title">{props.label}</span>
      {props.empty ? (
        <Unlink class="kamon" size={28} />
      ) : (
        <Link class="kamon" size={28} />
      )}
    </>
  );

  return (
    <div class={props.rowClass}>
      <ul class="grid">
        <li class={`relation-label ${props.labelClass}`}>
          <Show
            when={props.href}
            fallback={<a title={count()}>{labelContent()}</a>}
          >
            <A href={props.href!} title={count()}>
              {labelContent()}
            </A>
          </Show>
          <span class="arrow" />
        </li>
        <For each={props.cards}>
          {(card) => (
            <CardItemView
              card={card}
              potSlug={props.potSlug}
              empty={props.empty}
            />
          )}
        </For>
      </ul>
    </div>
  );
}

// Shows the open card's related cards: the cards one wiki-link hop away, the
// cards two hops away (one row per shared target), and the cards matched by
// the datalog query saved in the card's "query" field. This component only
// reads relatedStore; the store is reloaded when the title or the saved query
// changes and emptied when the component goes away. Links added while the card
// stays open are not picked up until it is opened again.
export default function RelatedCards(props: RelatedCardsProps) {
  const query = () =>
    props.cardId ? (cardsById[props.cardId]?.query ?? "") : "";

  createEffect(() => {
    // Read only to track it: the server reads the saved query itself.
    void query();
    if (!props.title) closeRelated();
    else void openRelated(props.potSlug, props.title, props.cardId);
  });
  onCleanup(closeRelated);

  // The server returns one row per (shared target, card) with the rows of a
  // target adjacent, so grouping is a single pass over consecutive rows.
  const twoHopGroups = createMemo(() => {
    const groups: { title: string; titleLc: string; cards: Link2HopCard[] }[] =
      [];
    for (const row of related.twoHop) {
      const last = groups[groups.length - 1];
      if (last?.titleLc === row.via_titleLc) {
        last.cards.push(row);
      } else {
        groups.push({
          title: row.via_title,
          titleLc: row.via_titleLc,
          cards: [row],
        });
      }
    }
    return groups;
  });
  // Links of the open card whose target is not alive, drawn as empty cards.
  // Uses the same predicate as the editor's red links (see isLinkAlive), and
  // is derived from the store, so it follows any later store update.
  const newLinks = createMemo<CardGridCard[]>(() =>
    deadLinks(
      related.ownLinks,
      [...related.oneHop, ...related.twoHop],
      props.title ? titleToLowerKey(props.title) : "",
    ).map((link) => ({
      title: asCardTitle(link.target_title),
      description: [],
      image: "",
      pin: false,
    })),
  );

  return (
    <Show
      when={!related.error}
      fallback={
        <p class="text-sm text-[#dc3545]">Failed to load related cards.</p>
      }
    >
      <Show when={related.oneHop.length}>
        <RelationRow
          rowClass="links-1-hop"
          labelClass="links"
          label="Links"
          cards={related.oneHop}
          potSlug={props.potSlug}
        />
      </Show>
      <For each={twoHopGroups()}>
        {(group) => (
          <RelationRow
            rowClass="links-2-hop"
            labelClass="headword"
            label={group.title}
            href={`/${props.potSlug}/${titleToSegment(group.title)}`}
            cards={group.cards}
            potSlug={props.potSlug}
          />
        )}
      </For>
      {/* The rows always appear in this order: Links, the 2-hop rows, New
          Links, Query. A row with no cards is simply not rendered, so
          New Links never jumps ahead of the others. */}
      <Show when={newLinks().length}>
        <RelationRow
          rowClass="links-new"
          labelClass="empty-links"
          label="New Links"
          cards={newLinks()}
          potSlug={props.potSlug}
          empty
        />
      </Show>
      <Show when={related.query.length}>
        <RelationRow
          rowClass="links-query"
          labelClass="query"
          label="Query"
          cards={related.query}
          potSlug={props.potSlug}
        />
      </Show>
    </Show>
  );
}
