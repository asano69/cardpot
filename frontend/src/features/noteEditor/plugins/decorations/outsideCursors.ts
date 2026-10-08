import {
  ViewPlugin,
  type EditorView,
  type PluginValue,
  type ViewUpdate,
} from "@codemirror/view";
import * as Y from "yjs";
import type { WebsocketProvider } from "y-websocket";

type Awareness = WebsocketProvider["awareness"];

// @codemirror/view declares MeasureRequest but does not export it, so the
// type is taken from requestMeasure's own parameter.
type MeasureRequest<T> = NonNullable<
  Parameters<EditorView["requestMeasure"]>[0]
> & {
  read: (view: EditorView) => T;
  write?: (measure: T, view: EditorView) => void;
};

// Height of ".shared-cursors .cursor" (see editorTheme.ts).
const CURSOR_HEIGHT_PX = 20;

interface Flag {
  name: string;
  x: number;
  y: number;
  side: "top" | "bottom";
}

// The visible part of the scrolling ancestor (<main> in MainLayout), in
// screen coordinates. The fixed TopBar and Footer are not subtracted: the
// flags are drawn over them (they ignore pointer events), so a flag always
// sits at the very edge of the screen.
function visibleArea(el: HTMLElement): { top: number; bottom: number } {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if (overflowY === "auto" || overflowY === "scroll") {
      const rect = p.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }
  }
  return { top: 0, bottom: window.innerHeight };
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

  // x of the caret at `pos`. At a wrap boundary the remote caret widget sits
  // at the end of the previous row, so coordsAtPos(pos) would report that
  // row's right edge. The character after `pos` is measured instead: when it
  // is on another row than `pos`, the caret really belongs to the start of
  // that row.
  private caretX(pos: number): number | null {
    const { view } = this;
    const here = view.coordsAtPos(pos, 1);
    if (!here || pos >= view.state.doc.length) return here?.left ?? null;
    const next = view.coordsAtPos(pos + 1, -1); // right edge of the next char
    if (!next || next.top <= here.top + 1) return here.left;
    // Left edge of the next char: its right edge minus one character width.
    return Math.max(
      next.left - view.defaultCharacterWidth,
      view.contentDOM.getBoundingClientRect().left,
    );
  }

  private read(): Flag[] {
    const { view, awareness } = this;
    const area = visibleArea(view.dom);
    const content = view.contentDOM.getBoundingClientRect();
    const flags: Flag[] = [];

    for (const [clientId, state] of awareness.getStates()) {
      if (
        clientId === awareness.clientID ||
        !state.user ||
        !state.cursor?.head
      ) {
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
