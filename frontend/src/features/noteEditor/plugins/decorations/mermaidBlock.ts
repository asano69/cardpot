import { EditorState, StateField } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { CodeBlock } from "../../parser/cardpot";
import { mermaidSource } from "./mermaidSource";

// Replaces a `code:mermaid` block with its rendered diagram while the
// selection does not touch the block (same live-preview rule as
// imageWidget.ts and syntaxReveal.ts); once the caret enters it, the raw code
// shows again for editing.
//
// A replacement spanning line breaks cannot come from a ViewPlugin, so this
// is a StateField providing the decorations directly. No IME guard (see
// decorationPlugin.ts) is needed: the block holding the caret is never
// replaced, and an unchanged widget keeps its DOM through `eq`.

// The mermaid library is large, so it is imported the first time a mermaid
// block is actually shown. Notes without one never load it. Vite splits the
// dynamic import into its own chunk.
let mermaidPromise: Promise<typeof import("mermaid").default> | undefined;

function loadMermaid() {
  mermaidPromise ??= import("mermaid")
    .then((module) => module.default)
    .catch((err) => {
      mermaidPromise = undefined; // allow a retry, e.g. after going online
      throw err;
    });
  return mermaidPromise;
}

// Rendered SVG per theme and source, so toggling the caret in and out of a
// block does not render the same diagram again.
const svgCache = new Map<string, string>();
let nextId = 0;

async function renderSvg(source: string): Promise<string> {
  const dark = document.documentElement.getAttribute("data-mode") === "dark";
  // "neutral" is mermaid's grayscale theme; its own "default" is purple.
  const theme = dark ? "dark" : "neutral";
  const key = `${theme}\n${source}`;
  const cached = svgCache.get(key);
  if (cached) return cached;

  const mermaid = await loadMermaid();
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme });
  const id = `mermaid-${nextId++}`;
  try {
    const { svg } = await mermaid.render(id, source);
    svgCache.set(key, svg);
    return svg;
  } catch (err) {
    // A failed render leaves its temporary element in <body>.
    document.getElementById(`d${id}`)?.remove();
    throw err;
  }
}

class MermaidWidget extends WidgetType {
  constructor(private readonly source: string) {
    super();
  }

  eq(other: MermaidWidget) {
    return other.source === this.source;
  }

  get estimatedHeight() {
    return 120;
  }

  toDOM(view: EditorView) {
    const el = document.createElement("div");
    el.className = "mermaid-block";
    renderSvg(this.source)
      .then(
        (svg) => {
          el.innerHTML = svg;
        },
        (err) => {
          el.classList.add("mermaid-error");
          el.textContent = err instanceof Error ? err.message : String(err);
        },
      )
      // The diagram's height is only known now.
      .then(() => view.requestMeasure());
    return el;
  }

  // Let the editor handle clicks, so clicking a diagram moves the caret to
  // the block's edge, which reveals its code.
  ignoreEvent() {
    return false;
  }
}

function buildDecorations(state: EditorState): DecorationSet {
  const { main } = state.selection;
  const decorations = [];

  syntaxTree(state).iterate({
    enter(node) {
      if (node.type !== CodeBlock) return;
      // A CodeBlock never contains another one.
      const { from, to } = node;
      const touching = main.from <= to && main.to >= from;
      if (touching) return false;

      const source = mermaidSource(state.sliceDoc(from, to));
      if (source === null) return false;
      decorations.push(
        Decoration.replace({
          widget: new MermaidWidget(source),
          block: true,
        }).range(from, to),
      );
      return false;
    },
  });

  return Decoration.set(decorations, true);
}

export const mermaidBlock = StateField.define<DecorationSet>({
  create: buildDecorations,
  update(value, tr) {
    if (
      tr.docChanged ||
      tr.selection ||
      syntaxTree(tr.startState) !== syntaxTree(tr.state)
    ) {
      return buildDecorations(tr.state);
    }
    return value;
  },
  provide: (field) => EditorView.decorations.from(field),
});
