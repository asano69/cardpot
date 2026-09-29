// frontend/src/pages/cards/RelatedCards.tsx
import { createResource, For, Show } from "solid-js";
import { fetchRelatedCards } from "@/lib/api/cardApi";
import { cardsById } from "@/lib/stores/cardsStore";
import { CardItemView } from "./CardItem";

export interface RelatedCardsProps {
  cardId: string;
  potSlug: string;
}

// Shows the cards matched by the datalog query saved in the open card's
// "query" field, as a plain (non-sortable) card grid. Refetches when the
// query text changes; the server's engine is loaded once at startup, so
// new cards and links show up after a server restart (see
// internal/datalog/engine.go).
export default function RelatedCards(props: RelatedCardsProps) {
  const query = () => cardsById[props.cardId]?.query ?? "";
  const [cards] = createResource(
    () => [props.cardId, query()] as const,
    ([id]) => fetchRelatedCards(id),
  );

  return (
    <Show
      when={!cards.error}
      fallback={
        <p class="text-sm text-[#dc3545]">
          Failed to load related cards. Check the card's query.
        </p>
      }
    >
      <Show when={cards()?.length}>
        <ul class="card-grid">
          <For each={cards()}>
            {(card) => <CardItemView card={card} potSlug={props.potSlug} />}
          </For>
        </ul>
      </Show>
    </Show>
  );
}
