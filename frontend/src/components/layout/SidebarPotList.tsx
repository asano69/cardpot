import { For, Show } from "solid-js";
import { A } from "@solidjs/router";
import { DragDropProvider } from "@dnd-kit/solid";
import { useSortable, isSortable } from "@dnd-kit/solid/sortable";
import { PointerSensor, KeyboardSensor } from "@dnd-kit/dom";

import { orderedPots, reorderPot } from "@/lib/stores/potsStore";
import type { PotRecord } from "@/lib/models/pot";

// Same override as PotList/CardList's own sensors: without it,
// PointerSensor's default preventActivation refuses to start a drag
// from inside an interactive element (each row's <a>).
const sensors = [
  PointerSensor.configure({
    preventActivation: () => false,
  }),
  KeyboardSensor,
];

interface SidebarPotRowProps {
  pot: PotRecord;
  index: number;
}

// A single low, single-column row -- unlike PotList's square
// card-grid-item, but reusing the same color tokens (border/bg/hover/
// shadow) so it still reads as part of the same design.
function SidebarPotRow(props: SidebarPotRowProps) {
  // Getter syntax (not a plain destructure) so the hook re-reads
  // id/index reactively instead of only once at setup -- see
  // dnd-kit's Solid docs (same as CardItem/PotGridItem).
  const { ref, isDragging } = useSortable({
    get id() {
      return props.pot.id;
    },
    get index() {
      return props.index;
    },
  });

  return (
    <li ref={ref} classList={{ "opacity-40": isDragging() }}>
      <A
        href={`/${props.pot.name}`}
        activeClass="bg-active-bg"
        class="block truncate  border border-border bg-card p-3 m-0.5 text-md  shadow-card transition-colors hover:bg-hover-bg"
      >
        {props.pot.title}
      </A>
    </li>
  );
}

// Sidebar-only list of pots: read-only besides drag-to-reorder :--
// adding/renaming/deleting a pot still happens on the pots page. Kept
// as its own component (not folded into Sidebar.tsx) since it owns its
// own drag-to-reorder wiring, mirroring PotList.tsx's pattern. Both
// lists read the same pots store (see lib/stores/potsStore.ts), so a
// reorder or rename in one shows up in the other immediately.
export default function SidebarPotList() {
  const handleDragEnd = (event) => {
    if (event.canceled) return;
    const { source } = event.operation;
    if (!isSortable(source)) return;

    reorderPot(source.initialIndex, source.index);
  };

  return (
    <Show when={orderedPots().length > 0}>
      <DragDropProvider sensors={sensors} onDragEnd={handleDragEnd}>
        <ul class="flex flex-col gap-1 p-2">
          <For each={orderedPots()}>
            {(pot, index) => <SidebarPotRow pot={pot} index={index()} />}
          </For>
        </ul>
      </DragDropProvider>
    </Show>
  );
}
