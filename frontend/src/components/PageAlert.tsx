import type { JSX } from "solid-js";
import { Alert } from "@kobalte/core/alert";

export interface PageAlertProps {
  variant: "info" | "success";
  // Extra class naming this particular alert (e.g. "merge-pages").
  class?: string;
  // When given, the alert shows a close button that calls it.
  onClose?: () => void;
  children: JSX.Element;
}

// The banner shown above the note editor (Cosense's .page-alert). Shared by
// every alert of CardForm; the caller supplies the content.
export default function PageAlert(props: PageAlertProps) {
  const className = () =>
    [
      "alert",
      `alert-${props.variant}`,
      props.onClose ? "alert-dismissible" : "",
      props.class ?? "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div class="page-alert">
      <Alert class={className()}>
        {props.onClose && (
          <button type="button" class="close" onClick={() => props.onClose?.()}>
            <span aria-hidden="true">×</span>
            <span class="close-label">Close alert</span>
          </button>
        )}
        {props.children}
      </Alert>
    </div>
  );
}
