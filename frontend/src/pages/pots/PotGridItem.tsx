import { createSignal, Show } from "solid-js";
import { A } from "@solidjs/router";
import { useSortable } from "@dnd-kit/solid/sortable";
import { Pencil, Trash2 } from "@/lib/icons";
import { potCoverURL } from "@/lib/api/pots";
import ActionsMenu from "@/components/menus/ActionsMenu";
import { LogoIcon } from "@/components/Logo";
import PromptDialog from "@/components/dialogs/PromptDialog";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog";
import { removePot, renamePot } from "@/lib/stores/potsStore";
import type { PotRecord } from "@/lib/models/pot";

export interface PotGridItemProps {
  pot: PotRecord;
  // This pot's position in the currently rendered grid order. Fed to
  // useSortable below so dnd-kit can report initialIndex/index on drop
  // (see PotList.tsx's handleDragEnd). Mirrors CardItem's own `index`
  // prop.
  index: number;
}

// A single pot in PotList's grid, styled identically to CardItem's own
// card-grid-item -- but with the pot's cover image in place of a
// description (pots have no equivalent field; without a cover, the logo is
// shown instead, fitted to the tile and faded) and no pin indicator.
// Clicking the card opens that pot's own
// card list; renaming and deleting -- which used to live inline on
// PotItem's row -- now live behind an ActionsMenu ("...") overlaid on
// the card, since there is no longer a separate "pot detail" page to
// host them on.
export default function PotGridItem(props: PotGridItemProps) {
  // Getter syntax (not a plain destructure) so the hook re-reads
  // id/index reactively instead of only once at setup -- see
  // dnd-kit's Solid docs (same as CardItem).
  const { ref, isDragging } = useSortable({
    get id() {
      return props.pot.id;
    },
    get index() {
      return props.index;
    },
  });

  const [renameOpen, setRenameOpen] = createSignal(false);
  const [deleteOpen, setDeleteOpen] = createSignal(false);

  const handleRename = (title: string) => renamePot(props.pot.id, title);

  const handleDelete = () => removePot(props.pot.id);

  return (
    <li
      ref={ref}
      class="card-grid-item"
      data-dragging={isDragging() ? "" : undefined}
    >
      <A href={`/${props.pot.name}`}>
        <div class="content">
          <div class="header">
            <h3 class="title">{props.pot.title}</h3>
          </div>
          {/* Same top-aligned thumbnail as CardItem's (see
              styles/components.css's .card-grid-item .icon). */}
          <Show
            when={potCoverURL(props.pot)}
            fallback={
              // The logo stands in for a cover, so it fills the tile (not
              // cropped to a circle like an avatar) and is faded.
              <div class="cover-fallback">
                <LogoIcon />
              </div>
            }
          >
            {(src) => (
              <div class="icon">
                <img loading="lazy" src={src()} alt="" />
              </div>
            )}
          </Show>
        </div>
      </A>
      {/* Sits as a sibling of the <a>, not inside it, so clicking it
          doesn't also trigger the link's navigation. Positioned over
          the top-right corner, matching where CardItem's pin
          indicator sits. */}
      <div class="actions">
        <ActionsMenu
          label="Pot actions"
          items={[
            {
              label: "Rename",
              icon: Pencil,
              onSelect: () => setRenameOpen(true),
            },
            {
              label: "Delete",
              icon: Trash2,
              onSelect: () => setDeleteOpen(true),
              destructive: true,
            },
          ]}
        />
      </div>

      <PromptDialog
        open={renameOpen()}
        onOpenChange={setRenameOpen}
        title="Rename pot"
        label="Title"
        initialValue={props.pot.title}
        onSubmit={handleRename}
        errorMessage="Failed to rename the pot."
      />
      {/* Deleting a pot cascade-deletes every card inside it (see the
          "pot" relation field's cascadeDelete option), so this is
          confirmed before it happens. */}
      <ConfirmDialog
        open={deleteOpen()}
        onOpenChange={setDeleteOpen}
        title="Delete pot"
        description="This will permanently delete this pot and all its cards."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        submittingLabel="Deleting…"
        errorMessage="Failed to delete the pot."
      />
    </li>
  );
}
