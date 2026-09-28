import {
  ViewPlugin,
  type DecorationSet,
  type EditorView,
  type ViewUpdate,
} from "@codemirror/view";
import type { ChangeDesc } from "@codemirror/state";

// Rebuilding replace (or inline mark) decorations while an IME composition
// is active redraws the DOM the browser is composing into. That aborts the
// composition and can drop the text around it. Every plugin that rebuilds
// such decorations must therefore go through decorationPlugin below.

export interface DecorationState {
  decorations: DecorationSet;
  // True when a rebuild was skipped during a composition and is still owed.
  stale: boolean;
}

export interface DecorationInput {
  composing: boolean;
  changes: ChangeDesc;
  // Whether the plugin's own triggers (doc change, selection, ...) fired.
  rebuild: boolean;
}

// Pure decision function: while composing, keep the old decorations mapped
// through the changes and remember that a rebuild is owed; otherwise
// rebuild when triggered or owed.
export function stepDecorations(
  prev: DecorationState,
  input: DecorationInput,
  build: () => DecorationSet,
): DecorationState {
  if (input.composing) {
    return { decorations: prev.decorations.map(input.changes), stale: true };
  }
  if (prev.stale || input.rebuild) {
    return { decorations: build(), stale: false };
  }
  return prev;
}

export interface DecorationPluginSpec {
  build: (view: EditorView) => DecorationSet;
  shouldRebuild: (update: ViewUpdate) => boolean;
}

export function decorationPlugin(spec: DecorationPluginSpec) {
  return ViewPlugin.fromClass(
    class {
      state: DecorationState;
      private timer: ReturnType<typeof setTimeout> | undefined;

      constructor(private readonly view: EditorView) {
        this.state = { decorations: spec.build(view), stale: false };
      }

      update(update: ViewUpdate) {
        this.state = stepDecorations(
          this.state,
          {
            composing: update.view.composing,
            changes: update.changes,
            rebuild: spec.shouldRebuild(update),
          },
          () => spec.build(update.view),
        );
      }

      // The composition may end without any further update, which would
      // leave the skipped rebuild owed forever. An empty dispatch gives
      // update() one more call, by which time view.composing is false.
      finishComposition() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          if (this.state.stale) this.view.dispatch({});
        }, 0);
      }

      destroy() {
        clearTimeout(this.timer);
      }
    },
    {
      decorations: (plugin) => plugin.state.decorations,
      eventHandlers: {
        compositionend() {
          this.finishComposition();
        },
      },
    },
  );
}
