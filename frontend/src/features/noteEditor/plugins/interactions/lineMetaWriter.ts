import type { Text } from "@codemirror/state";
import {
  ViewPlugin,
  type EditorView,
  type PluginValue,
  type ViewUpdate,
} from "@codemirror/view";
import type * as Y from "yjs";
import { lineIdAt } from "@/lib/models/lineId";
import {
  LINE_META_ORIGIN,
  lineMetaMap,
  type LineMeta,
} from "@/lib/models/lineMeta";
import { hasUserEdit } from "../../userEdit";

// How long a line must stay untouched before its meta is written, so typing
// does not write on every keystroke.
const DEBOUNCE_MS = 1500;

interface User {
  id: string;
  name: string;
}

// Records `user` as the last editor of the lines starting at `positions`
// (offsets in `doc`). Returns false, writing nothing, while `doc` and the
// Y.Text hold different text: offsets would then point at the wrong lines.
export function writeLineMeta(
  ydoc: Y.Doc,
  doc: Text,
  positions: Iterable<number>,
  user: User,
  now: number,
): boolean {
  const ytext = ydoc.getText("content");
  if (ytext.length !== doc.length) return false;

  const meta: LineMeta = { userId: user.id, name: user.name, at: now };
  const map = lineMetaMap(ydoc);
  // A separate origin keeps these writes out of the undo stack.
  ydoc.transact(() => {
    for (const pos of positions) {
      const id = lineIdAt(ytext, doc.lineAt(Math.min(pos, doc.length)).from);
      if (id) map.set(id, meta);
    }
  }, LINE_META_ORIGIN);
  return true;
}

// Collects the lines the user edited and writes their meta after a pause.
class LineMetaWriter implements PluginValue {
  // Start offsets of the edited lines, kept up to date through later changes.
  private pending = new Set<number>();
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly view: EditorView,
    private readonly ydoc: Y.Doc,
    private readonly user: () => User | undefined,
  ) {}

  update(update: ViewUpdate) {
    if (update.docChanged && this.pending.size > 0) {
      this.pending = new Set(
        [...this.pending].map((pos) => update.changes.mapPos(pos)),
      );
    }
    if (!hasUserEdit(update)) return;

    const { doc } = update.state;
    update.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
      for (let n = doc.lineAt(fromB).number; n <= doc.lineAt(toB).number; n++) {
        this.pending.add(doc.line(n).from);
      }
    });
    this.schedule();
  }

  // Writes what is pending, at the lines' current positions. Returns false
  // when it has to be tried again later.
  private write(): boolean {
    const user = this.user();
    if (!user || this.pending.size === 0) {
      this.pending.clear();
      return true;
    }
    const written = writeLineMeta(
      this.ydoc,
      this.view.state.doc,
      this.pending,
      user,
      Date.now(),
    );
    if (written) this.pending.clear();
    return written;
  }

  private schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!this.write()) this.schedule();
    }, DEBOUNCE_MS);
  }

  destroy() {
    clearTimeout(this.timer);
    this.write(); // do not lose the last edits of a card that is being closed
  }
}

export function lineMetaWriter(ydoc: Y.Doc, user: () => User | undefined) {
  return ViewPlugin.define((view) => new LineMetaWriter(view, ydoc, user));
}
