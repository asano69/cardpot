import { For, Show } from "solid-js";
import { DragDropProvider } from "@dnd-kit/solid";
import { isSortable } from "@dnd-kit/solid/sortable";
import { PointerSensor, KeyboardSensor } from "@dnd-kit/dom";

import Loading from "@/components/Loading";
import PotGridItem from "./PotGridItem";
import PotForm from "./PotForm";
import { orderedPots, potsLoaded, reorderPot } from "@/lib/stores/potsStore";

// Same override as CardList's own sensors: without it, PointerSensor's
// default preventActivation refuses to start a drag from inside an
// interactive element (the pot card's <a>, or its ActionsMenu
// trigger), which is exactly what every pot card is built from.
const sensors = [
  PointerSensor.configure({
    preventActivation: () => false,
  }),
  KeyboardSensor,
];

// Top-level pot list, styled like CardList's card grid (see
// CardItem/CardList) rather than the old task-list layout (still kept,
// unused, in ./index.tsx and ./PotItem.tsx). Opening a pot now
// navigates straight to its card list instead of expanding inline;
// renaming/deleting move to each card's own ActionsMenu (see
// PotGridItem.tsx). The pots themselves live in the shared pots store
// (see lib/stores/potsStore.ts).
export default function PotList() {
  const handleDragEnd = (event) => {
    if (event.canceled) return;
    const { source } = event.operation;
    if (!isSortable(source)) return;

    reorderPot(source.initialIndex, source.index);
  };

  return (
    <div class="flex w-full flex-col gap-4">
      <Show when={potsLoaded()} fallback={<Loading />}>
        <DragDropProvider sensors={sensors} onDragEnd={handleDragEnd}>
          <ul class="card-grid">
            <For each={orderedPots()}>
              {(pot, index) => <PotGridItem pot={pot} index={index()} />}
            </For>
          </ul>
        </DragDropProvider>
      </Show>

      <PotForm hasExistingPots={orderedPots().length > 0} />
    </div>
  );
}
