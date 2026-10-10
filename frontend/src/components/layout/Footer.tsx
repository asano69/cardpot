import { Show } from "solid-js";
import { footerContent } from "@/lib/footerSlot";
import { connection } from "@/lib/stores/connectionStore";
import { reconnect } from "@/lib/api/realtime";

// Bottom-of-viewport status bar, symmetric with TopBar: TopBar owns
// the top edge and a per-page actions slot, this owns the bottom edge
// and a per-page status slot (e.g. CardList's "N pages" count). See
// styles/components.css for the actual .footer/.status-bar styling --
// the outer two layers here carry no border/background of their own,
// so an empty slot renders nothing visible instead of a stray bar.
//
// The connection is only mentioned when it is not online: being connected
// is the normal case and needs no indicator.
export default function Footer() {
  return (
    <div class="footer">
      <div class="status-bar">
        {footerContent()}
        <Show when={connection() !== "online"}>
          <div class="page-status error">
            <span class="item-group">
              <Show
                when={connection() === "offline"}
                fallback={<span class="item">Connecting…</span>}
              >
                {/* Terminal disconnects are not retried by the SDK, so
                    offer a manual retry. */}
                <button type="button" class="item" onClick={reconnect}>
                  No connection (retry)
                </button>
              </Show>
            </span>
          </div>
        </Show>
      </div>
    </div>
  );
}
