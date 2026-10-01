import { createMemo, createResource, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import {
  fetchLinks1Hop,
  fetchLinks2Hop,
  fetchRelatedCards,
} from "@/lib/api/cardApi";
import type { Link2HopCard } from "@/lib/api/generated";
import { cardsById } from "@/lib/stores/cardsStore";
import { Link } from "@/lib/icons";
import { titleToSegment } from "@/lib/models/slugify";
import type { CardGridCard } from "@/lib/models/card";
import { CardItemView } from "./CardItem";

export interface RelatedCardsProps {
  cardId: string;
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
}

// One labelled row: a relation label followed by its cards, all in one grid.
function RelationRow(props: RelationRowProps) {
  const count = () => `${props.cards.length} pages`;
  // The label's text, with the link icon below it (the "kamon" of the
  // original design).
  const labelContent = () => (
    <>
      <span class="title">{props.label}</span>
      <Link class="kamon" size={28} />
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
          {(card) => <CardItemView card={card} potSlug={props.potSlug} />}
        </For>
      </ul>
    </div>
  );
}

// Shows the open card's related cards: the cards one wiki-link hop away, the
// cards two hops away (one row per shared target), and the cards matched by
// the datalog query saved in the card's "query" field. Each is refetched when
// the card (or, for the datalog row, its query) changes; links added while the
// card stays open are not picked up until it is opened again.
export default function RelatedCards(props: RelatedCardsProps) {
  const title = () => cardsById[props.cardId]?.title;
  const query = () => cardsById[props.cardId]?.query ?? "";

  const [oneHop] = createResource(title, (t) =>
    fetchLinks1Hop(props.potSlug, t),
  );
  const [twoHop] = createResource(title, (t) =>
    fetchLinks2Hop(props.potSlug, t),
  );
  // The server returns one row per (shared target, card) with the rows of a
  // target adjacent, so grouping is a single pass over consecutive rows.
  const twoHopGroups = createMemo(() => {
    const groups: { title: string; titleLc: string; cards: Link2HopCard[] }[] =
      [];
    for (const row of twoHop() ?? []) {
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
  const [queryCards] = createResource(
    () => [props.cardId, query()] as const,
    ([id]) => fetchRelatedCards(id),
  );

  return (
    <Show
      when={!oneHop.error && !twoHop.error && !queryCards.error}
      fallback={
        <p class="text-sm text-[#dc3545]">Failed to load related cards.</p>
      }
    >
      <Show when={oneHop()?.length}>
        <RelationRow
          rowClass="links-1-hop"
          labelClass="links"
          label="Links"
          cards={oneHop()!}
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
      <Show when={queryCards()?.length}>
        <RelationRow
          rowClass="links-query"
          labelClass="query"
          label="Query"
          cards={queryCards()!}
          potSlug={props.potSlug}
        />
      </Show>
    </Show>
  );
}
