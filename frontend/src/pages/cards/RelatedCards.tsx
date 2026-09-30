import { createResource, For, Show } from "solid-js";
import { A } from "@solidjs/router";
import {
  fetchLinks1Hop,
  fetchLinks2Hop,
  fetchRelatedCards,
} from "@/lib/api/cardApi";
import { cardsById } from "@/lib/stores/cardsStore";
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
  const title = () => <span class="title">{props.label}</span>;

  return (
    <div class={props.rowClass}>
      <ul class="grid">
        <li class={`relation-label ${props.labelClass}`}>
          <Show
            when={props.href}
            fallback={<a title={count()}>{title()}</a>}
          >
            <A href={props.href!} title={count()}>
              {title()}
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
      <For each={twoHop()}>
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
