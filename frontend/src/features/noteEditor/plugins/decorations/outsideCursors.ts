import {
  ViewPlugin,
  type EditorView,
  type MeasureRequest,
  type PluginValue,
  type ViewUpdate,
} from "@codemirror/view";
import * as Y from "yjs";
import type { WebsocketProvider } from "y-websocket";

type Awareness = WebsocketProvider["awareness"];

// Fixed UI covering the scroll area: TopBar (h-10) and Footer (20px).
// Keep in sync with MainLayout and styles/components.css's .footer.
const TOP_INSET_PX = 40;
const BOTTOM_INSET_PX = 20;
// Height of ".shared-cursors .cursor" (see editorTheme.ts).
const CURSOR_HEIGHT_PX = 20;

interface Flag {
  name: string;
  x: number;
  y: number;
  side: "top" | "bottom";
}

// The visible part of the scrolling ancestor (<main> in MainLayout), in
// screen coordinates, without the fixed bars over it.
function visibleArea(el: HTMLElement): { top: number; bottom: number } {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if (overflowY === "auto" || overflowY === "scroll") {
      const rect = p.getBoundingClientRect();
      return {
        top: rect.top + TOP_INSET_PX,
        bottom: rect.bottom - BOTTOM_INSET_PX,
      };
    }
  }
  return {
    top: TOP_INSET_PX,
    bottom: window.innerHeight - BOTTOM_INSET_PX,
  };
}

// Shows the flag of every collaborator whose caret is above or below the
// visible area, pinned to the top or bottom edge of that area, so their
// presence is noticed even when they edit far away. Carets inside the
// visible area are drawn by y-codemirror.next itself.
//
// CodeMirror does not render lines far outside the screen, so their x
// position is unknown: the last known x of that user is used, or the left
// edge of the text when the caret was never seen on screen.
class OutsideCursors implements PluginValue {
  private readonly root = document.createElement("div");
  private readonly lastX = new Map<number, number>();
  private readonly measure: MeasureRequest<Flag[]> = {
    key: this,
    read: () => this.read(),
    write: (flags) => this.write(flags),
  };

  constructor(
    private readonly view: EditorView,
    private readonly awareness: Awareness,
    private readonly ydoc: Y.Doc,
    private readonly ytext: Y.Text,
  ) {
    this.root.className = "shared-cursors";
    view.dom.appendChild(this.root);
    awareness.on("change", this.schedule);
    window.addEventListener("resize", this.schedule);
    // Scroll events do not bubble, so capture them to also see the
    // scrolling <main>.
    document.addEventListener("scroll", this.schedule, {
      capture: true,
      passive: true,
    });
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.geometryChanged || update.viewportChanged) {
      this.schedule();
    }
  }

  destroy() {
    this.awareness.off("change", this.schedule);
    window.removeEventListener("resize", this.schedule);
    document.removeEventListener("scroll", this.schedule, { capture: true });
    this.root.remove();
  }

  private readonly schedule = () => this.view.requestMeasure(this.measure);

  // Index in the editor's document of a remote caret, or null when it does
  // not point into this text.
  private headIndex(head: unknown): number | null {
    const abs = Y.createAbsolutePositionFromRelativePosition(
      Y.createRelativePositionFromJSON(head),
      this.ydoc,
    );
    if (!abs || abs.type !== this.ytext) return null;
    return Math.min(abs.index, this.view.state.doc.length);
  }

  private read(): Flag[] {
    const { view, awareness } = this;
    const area = visibleArea(view.dom);
    const content = view.contentDOM.getBoundingClientRect();
    const flags: Flag[] = [];

    for (const [clientId, state] of awareness.getStates()) {
      if (clientId === awareness.clientID || !state.user || !state.cursor?.head) {
        continue;
      }
      const pos = this.headIndex(state.cursor.head);
      if (pos === null) continue;

      const coords = view.coordsAtPos(pos);
      if (coords) this.lastX.set(clientId, coords.left);

      // lineBlockAt also works for lines that are not rendered.
      const block = view.lineBlockAt(pos);
      const top = content.top + block.top;
      const side =
        top + block.height < area.top
          ? "top"
          : top > area.bottom
            ? "bottom"
            : null;
      if (!side) continue;

      flags.push({
        name: state.user.name,
        x: this.lastX.get(clientId) ?? content.left,
        y: side === "top" ? area.top : area.bottom - CURSOR_HEIGHT_PX,
        side,
      });
    }
    return flags;
  }

  private write(flags: Flag[]) {
    this.root.replaceChildren(
      ...flags.map((flag) => {
        const cursor = document.createElement("div");
        cursor.className = `cursor outside-${flag.side}`;
        cursor.style.left = `${flag.x}px`;
        cursor.style.top = `${flag.y}px`;
        const label = document.createElement("div");
        label.className = "user-flag";
        label.textContent = flag.name;
        cursor.appendChild(label);
        return cursor;
      }),
    );
  }
}

export function outsideCursors(
  awareness: Awareness,
  ydoc: Y.Doc,
  ytext: Y.Text,
) {
  return ViewPlugin.define(
    (view) => new OutsideCursors(view, awareness, ydoc, ytext),
  );
}
