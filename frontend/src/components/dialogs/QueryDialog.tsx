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
        <Dialog.Overlay class="dialog-overlay" />
        <div class="dialog-positioner">
          <Dialog.Content class="dialog-content dialog-wide">
            <div class="dialog-header">
              <Dialog.Title class="dialog-title">Query</Dialog.Title>
              <Dialog.CloseButton aria-label="Close" class="dialog-close">
                <X size={18} />
              </Dialog.CloseButton>
            </div>
            <form onSubmit={handleSubmit} class="dialog-form">
              <div class="dialog-row">
                <TextField
                  value={value()}
                  onChange={setValue}
                  class="dialog-field"
                >
                  <TextField.Label class="dialog-label">
                    Datalog query
                  </TextField.Label>
                  <TextField.TextArea
                    autofocus
                    rows={10}
                    spellcheck={false}
                    class="dialog-input dialog-mono"
                  />
                </TextField>
                <button
                  type="submit"
                  aria-label={submitting() ? "Saving…" : "Save"}
                  class="icon-btn"
                  disabled={submitting()}
                >
                  <Check size={20} />
                </button>
              </div>
              {error() && <p class="dialog-error">{error()}</p>}
            </form>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}
