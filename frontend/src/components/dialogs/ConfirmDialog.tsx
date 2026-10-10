import { createSignal } from "solid-js";
import { AlertDialog } from "@kobalte/core/alert-dialog";
import { X, Check } from "@/lib/icons";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  confirmLabel?: string;
  submittingLabel?: string;
  errorMessage?: string;
}

// Reusable "are you sure?" confirmation dialog. Fully controlled via
// `open`/`onOpenChange` so it can be opened from anywhere (e.g. a
// dropdown menu item) instead of needing its own AlertDialog.Trigger.
export default function ConfirmDialog(props: ConfirmDialogProps) {
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal("");

  const handleOpenChange = (open: boolean) => {
    // Drop any stale error once the dialog closes, however it closed
    // (confirm, cancel, Esc, or the overlay).
    if (!open) setError("");
    props.onOpenChange(open);
  };

  const handleConfirm = async () => {
    setError("");
    setSubmitting(true);
    try {
      await props.onConfirm();
      props.onOpenChange(false);
    } catch {
      setError(props.errorMessage ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AlertDialog open={props.open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay class="dialog-overlay" />
        <div class="dialog-positioner">
          <AlertDialog.Content class="dialog-content">
            <AlertDialog.Title class="dialog-title">
              {props.title}
            </AlertDialog.Title>
            <AlertDialog.Description class="dialog-description">
              {props.description}
            </AlertDialog.Description>
            {error() && <p class="dialog-error">{error()}</p>}
            <div class="dialog-actions">
              <AlertDialog.CloseButton type="button" class="btn">
                <X size={16} />
                Cancel
              </AlertDialog.CloseButton>
              <button
                type="button"
                class="btn"
                disabled={submitting()}
                onClick={handleConfirm}
              >
                <Check size={16} />
                {submitting()
                  ? (props.submittingLabel ?? "Working…")
                  : (props.confirmLabel ?? "Confirm")}
              </button>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
