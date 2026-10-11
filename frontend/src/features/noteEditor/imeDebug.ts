import { Transaction, type Extension } from "@codemirror/state";
import {
  ViewPlugin,
  type EditorView,
  type PluginValue,
  type ViewUpdate,
} from "@codemirror/view";

// Debug-only plugin for the "the Convert key no longer switches the IME on"
// bug. It logs how CodeMirror and the browser see the IME, so a log taken
// when the bug happens shows which layer lost track of it.
//
// Enabled in development, or in production after running
//   localStorage.setItem("imeDebug", "1")
// in the browser console and reloading. Everything is prefixed "[ime-debug]".
//
// What the log tells:
// - "switch key" + "key after switch": the keys the browser really received.
//   After Convert with the IME on, the next keys arrive as key "Process"
//   (keyCode 229). If they arrive as plain letters instead, the IME was never
//   switched on at the OS level, so the cause is outside CodeMirror.
// - "created" / "destroyed": the editor's lifetime. "destroyed during
//   composition" means the editor was torn down while the IME was converting
//   (e.g. a draft turning into an existing card).
// - "update during composition": every CodeMirror update while composing, with
//   its user events and effects, to spot dispatches that should not happen.
// - "DOM mutation during composition": nodes added or removed under the
//   composing content, to spot decorations that rewrite the DOM.
// - "focus" / "blur": where the focus went, and whether the window has it.
// - "composition did not end": a composition stuck for too long.

const PREFIX = "[ime-debug]";
const SWITCH_KEYS = new Set(["Convert", "NonConvert"]);
// How many key presses after a switch key are logged.
const KEYS_AFTER_SWITCH = 3;
const STUCK_MS = 10_000;

let nextId = 1;

function isEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem("imeDebug") === "1";
  } catch {
    return false; // storage may be blocked
  }
}

function describe(node: EventTarget | Node | null): string {
  if (!(node instanceof Element)) return node ? node.constructor.name : "none";
  const cls = typeof node.className === "string" ? node.className : "";
  return cls
    ? `${node.tagName.toLowerCase()}.${cls.split(" ")[0]}`
    : node.tagName.toLowerCase();
}

class ImeDebug implements PluginValue {
  private readonly id = nextId++;
  private readonly createdAt = performance.now();
  // Composition state as seen from DOM events, to compare with view.composing.
  private composing = false;
  private keysToWatch = 0;
  private stuckTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly observer: MutationObserver;
  private readonly listeners: [EventTarget, string, EventListener][] = [];

  constructor(private readonly view: EditorView) {
    const dom = view.contentDOM;
    this.listen(dom, "compositionstart", (e) => this.onCompositionStart(e));
    this.listen(dom, "compositionupdate", (e) =>
      this.log("compositionupdate", { data: (e as CompositionEvent).data }),
    );
    this.listen(dom, "compositionend", (e) => this.onCompositionEnd(e));
    this.listen(dom, "beforeinput", (e) => {
      const input = e as InputEvent;
      this.log("beforeinput", {
        inputType: input.inputType,
        isComposing: input.isComposing,
        data: input.data,
      });
    });
    this.listen(dom, "keydown", (e) => this.onKeyDown(e as KeyboardEvent));
    this.listen(dom, "focus", () => this.log("focus", this.snapshot()));
    this.listen(dom, "blur", (e) =>
      this.log("blur", {
        ...this.snapshot(),
        movedTo: describe((e as FocusEvent).relatedTarget),
      }),
    );
    this.listen(window, "blur", () => this.log("window blur"));
    this.listen(window, "focus", () => this.log("window focus"));
    this.listen(document, "visibilitychange", () =>
      this.log("visibilitychange", { state: document.visibilityState }),
    );

    this.observer = new MutationObserver((records) =>
      this.onMutations(records),
    );
    this.observer.observe(dom, { childList: true, subtree: true });

    this.log("created", this.snapshot());
  }

  update(update: ViewUpdate) {
    if (update.focusChanged) this.log("focusChanged", this.snapshot());
    if (!update.view.composing && !this.composing) return;
    this.log("update during composition", {
      docChanged: update.docChanged,
      selectionSet: update.selectionSet,
      viewportChanged: update.viewportChanged,
      transactions: update.transactions.map((tr) => ({
        userEvent: tr.annotation(Transaction.userEvent),
        docChanged: tr.docChanged,
        effects: tr.effects.length,
      })),
    });
  }

  destroy() {
    if (this.composing || this.view.composing) {
      console.warn(
        PREFIX,
        `#${this.id}`,
        "destroyed during composition",
        this.snapshot(),
      );
    }
    this.log("destroyed", {
      lifetimeMs: Math.round(performance.now() - this.createdAt),
    });
    clearTimeout(this.stuckTimer);
    this.observer.disconnect();
    for (const [target, type, fn] of this.listeners) {
      target.removeEventListener(type, fn);
    }
  }

  private listen(target: EventTarget, type: string, fn: EventListener) {
    target.addEventListener(type, fn);
    this.listeners.push([target, type, fn]);
  }

  // What CodeMirror and the browser each believe right now.
  private snapshot() {
    const { view } = this;
    return {
      viewComposing: view.composing,
      viewCompositionStarted: view.compositionStarted,
      trackedComposing: this.composing,
      viewHasFocus: view.hasFocus,
      documentHasFocus: document.hasFocus(),
      activeElement: describe(document.activeElement),
      connected: view.contentDOM.isConnected,
    };
  }

  private log(message: string, detail?: object) {
    const time = Math.round(performance.now());
    console.log(PREFIX, `#${this.id}`, `${time}ms`, message, detail ?? "");
  }

  private onCompositionStart(e: Event) {
    this.composing = true;
    this.log("compositionstart", {
      data: (e as CompositionEvent).data,
      ...this.snapshot(),
    });
    clearTimeout(this.stuckTimer);
    this.stuckTimer = setTimeout(() => {
      console.warn(
        PREFIX,
        `#${this.id}`,
        "composition did not end",
        this.snapshot(),
      );
    }, STUCK_MS);
  }

  private onCompositionEnd(e: Event) {
    this.composing = false;
    clearTimeout(this.stuckTimer);
    this.log("compositionend", {
      data: (e as CompositionEvent).data,
      ...this.snapshot(),
    });
  }

  private onKeyDown(e: KeyboardEvent) {
    const detail = {
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      isComposing: e.isComposing,
    };
    if (SWITCH_KEYS.has(e.key)) {
      this.keysToWatch = KEYS_AFTER_SWITCH;
      this.log("switch key", { ...detail, ...this.snapshot() });
    } else if (this.keysToWatch > 0) {
      this.keysToWatch--;
      this.log("key after switch", detail);
    }
  }

  private onMutations(records: MutationRecord[]) {
    if (!this.composing && !this.view.composing) return;
    let added = 0;
    let removed = 0;
    const targets = new Set<string>();
    for (const record of records) {
      added += record.addedNodes.length;
      removed += record.removedNodes.length;
      if (targets.size < 3) targets.add(describe(record.target));
    }
    this.log("DOM mutation during composition", {
      added,
      removed,
      targets: [...targets],
    });
  }
}

// The debug plugin, or nothing when debugging is not enabled.
export function imeDebug(): Extension {
  return isEnabled() ? ViewPlugin.define((view) => new ImeDebug(view)) : [];
}
