// frontend/src/components/dialogs/QueryDialog.tsx
import { createSignal, createEffect } from "solid-js";
import { Dialog } from "@kobalte/core/dialog";
import { TextField } from "@kobalte/core/text-field";
import { X, Check } from "@/lib/icons";

export interface QueryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValue: string;
  onSubmit: (value: string) => Promise<void>;
}

// Popup with a monospace textarea for editing a card's datalog query.
// Saving closes the dialog, same as PromptDialog. The text is stored as
// is: nothing parses or validates it yet.
export default function QueryDialog(props: QueryDialogProps) {
  const [value, setValue] = createSignal(props.initialValue);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");

  // This component stays mounted across opens/closes, so the field has to
  // be reset to the current initialValue every time it opens.
  createEffect(() => {
    if (props.open) {
      setValue(props.initialValue);
      setError("");
    }
  });

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await props.onSubmit(value());
      props.onOpenChange(false);
    } catch {
      setError("Failed to save the query.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-50 bg-black/40" />
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Dialog.Content class="w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-popover">
            <div class="mb-4 flex items-center justify-between">
              <Dialog.Title class="text-lg font-sans">Query</Dialog.Title>
              <Dialog.CloseButton
                aria-label="Close"
                class="rounded-md p-1 text-text transition-colors hover:bg-hover-bg"
              >
                <X size={18} />
              </Dialog.CloseButton>
            </div>
            <form onSubmit={handleSubmit} class="flex flex-col gap-4">
              <div class="flex items-end gap-2">
                <TextField
                  value={value()}
                  onChange={setValue}
                  class="flex min-w-0 flex-1 flex-col gap-1"
                >
                  <TextField.Label class="text-sm text-text">
                    Datalog query
                  </TextField.Label>
                  <TextField.TextArea
                    autofocus
                    rows={10}
                    spellcheck={false}
                    class="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text"
                  />
                </TextField>
                <button
                  type="submit"
                  aria-label={submitting() ? "Saving…" : "Save"}
                  class="icon-btn shrink-0"
                  disabled={submitting()}
                >
                  <Check size={20} />
                </button>
              </div>
              {error() && <p class="text-sm text-[#dc3545]">{error()}</p>}
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}
