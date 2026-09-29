import { createResource, For, Show } from "solid-js";
import { fetchLinkedCards, fetchRelatedCards } from "@/lib/api/cardApi";
import { cardsById } from "@/lib/stores/cardsStore";
import type { CardGridCard } from "@/lib/models/card";
import { CardItemView } from "./CardItem";

export interface RelatedCardsProps {
  cardId: string;
  potSlug: string;
}

interface CardRowProps {
  cards: CardGridCard[] | undefined;
  potSlug: string;
}

// One row of plain (non-sortable) cards. Renders nothing when empty.
function CardRow(props: CardRowProps) {
  return (
    <Show when={props.cards?.length}>
      <div>
        <ul class="card-grid">
          <For each={props.cards}>
            {(card) => <CardItemView card={card} potSlug={props.potSlug} />}
          </For>
        </ul>
      </div>
    </Show>
  );
}

// Shows the open card's related cards in three rows: the cards one wiki-link
// hop away, the cards two hops away, and the cards matched by the datalog
// query saved in the card's "query" field. Each row is refetched when the
// card (or, for the datalog row, its query) changes; links added while the
// card stays open are not picked up until it is opened again.
export default function RelatedCards(props: RelatedCardsProps) {
  const title = () => cardsById[props.cardId]?.title;
  const query = () => cardsById[props.cardId]?.query ?? "";

  const [oneHop] = createResource(title, (t) =>
    fetchLinkedCards(props.potSlug, t, 1),
  );
  const [twoHop] = createResource(title, (t) =>
    fetchLinkedCards(props.potSlug, t, 2),
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
      <CardRow cards={oneHop()} potSlug={props.potSlug} />
      <CardRow cards={twoHop()} potSlug={props.potSlug} />
      <CardRow cards={queryCards()} potSlug={props.potSlug} />
    </Show>
  );
}
