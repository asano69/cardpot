import {
  createEffect,
  createResource,
  onCleanup,
  type ParentProps,
} from "solid-js";
import { useParams } from "@solidjs/router";

import { fetchPotByName } from "@/lib/api/pots";
import { useTopBarPotLink } from "@/lib/topBarSlot";
import { ensurePotLoaded, releasePot } from "@/lib/stores/cardsStore";
import PotContext from "./PotContext";

// Wraps every route scoped to a single pot (CardList, CardForm) so the
// pot's TopBar link (see lib/topBarSlot.ts) is registered exactly once
// per pot, not once per page. Before this existed, CardList and
// CardForm each called useTopBarPotLink themselves; navigating between
// them unmounted one page's registration (clearing the link) before
// the other page's mounted its own, flickering TopBar's pot-name link
// and "add card" button on every transition. Nesting both pages under
// this layout keeps the registration mounted continuously across that
// transition instead.
//
// The pot itself is also fetched exactly once here and shared via
// PotContext, instead of each nested page fetching it again on its
// own -- CardList and CardForm used to each run their own
// fetchPotBySlug, and navigating between them while the first request
// was still in flight made PocketBase's SDK auto-cancel it as a
// duplicate, breaking navigation.
export default function PotLayout(props: ParentProps) {
  const params = useParams();
  const [pot] = createResource(() => params.slug, fetchPotByName);

  useTopBarPotLink(() =>
    pot() ? { name: pot()!.title, slug: params.slug } : undefined,
  );

  // Starts mirroring the pot's cards locally (see
  // lib/stores/cardsStore.ts's ensurePotLoaded) and drops them again
  // once the user leaves it (another pot, or the pot list). Moving
  // between CardList and CardForm keeps this layout mounted, so both
  // survive that -- and both need this: CardForm can be the only thing
  // mounted (a direct URL to a card), and its own slug lookup depends
  // on the pot's cards already being loaded locally.
  createEffect(() => {
    const id = pot()?.id;
    if (!id) return;
    void ensurePotLoaded(id);
    onCleanup(() => releasePot(id));
  });

  return (
    <PotContext.Provider value={pot}>{props.children}</PotContext.Provider>
  );
}
