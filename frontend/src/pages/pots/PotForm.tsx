import { createSignal } from "solid-js";
import { TextField } from "@kobalte/core/text-field";
import { Plus } from "@/lib/icons";

import { addPot } from "@/lib/stores/potsStore";

export interface PotFormProps {
  // Whether at least one pot already exists -- tones down the
  // input's styling once the list isn't empty, so it reads as an
  // optional affordance rather than a prompt nagging the user to fill
  // the list.
  hasExistingPots: boolean;
}

// Add-pot input for the Pots page. Creates the pot through the pots
// store (see lib/stores/potsStore.ts), which owns the actual pot list.
export default function PotForm(props: PotFormProps) {
  const [title, setTitle] = createSignal("");
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!title().trim()) return;
    setError("");
    setSubmitting(true);
    try {
      await addPot(title().trim());
      setTitle("");
    } catch {
      setError("Failed to add the pot.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* focus-within restores full opacity while actually typing. */}
      <form
        onSubmit={handleSubmit}
        class="flex items-center gap-2 transition-opacity focus-within:opacity-100"
        classList={{ "opacity-50": props.hasExistingPots }}
      >
        <TextField value={title()} onChange={setTitle} class="flex-1">
          <TextField.Input
            placeholder="What pot do you want to think about?"
            class="w-full rounded-md border border-border bg-field px-3 py-2 text-text"
            classList={{
              "border-transparent bg-transparent px-0": props.hasExistingPots,
            }}
          />
        </TextField>
        {/* Plus icon instead of an "Add" label, matching the delete
            icon on each pot row. */}
        <button
          type="submit"
          aria-label={submitting() ? "Adding…" : "Add pot"}
          class="icon-btn shrink-0"
          disabled={submitting()}
        >
          <Plus size={20} />
        </button>
      </form>
      {error() && <p class="text-sm text-[#dc3545]">{error()}</p>}
    </>
  );
}
