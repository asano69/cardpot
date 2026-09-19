import { ensureSyntaxTree } from "@codemirror/language";
import type { EditorView } from "@codemirror/view";
import { IterMode, type Tree } from "@lezer/common";

// How long dumpTree() may block while parsing the whole document.
// Long documents are allowed to freeze the tab for this purpose.
const PARSE_TIMEOUT_MS = 60_000;

export interface DebugNode {
  name: string;
  // The source text the node covers, used instead of from/to positions.
  text: string;
  children: DebugNode[];
}

// Converts `tree` into plain nested objects, replacing each node's
// from/to positions with the source text it covers. Trees mounted by
// nested languages (e.g. inside `code:` blocks) are skipped: this is a
// debugger for Cardpot's own grammar.
export function syntaxTreeToJson(tree: Tree, doc: string): DebugNode {
  const root: DebugNode[] = [];
  // Each entry is the children array the next entered node is added to.
  const stack: DebugNode[][] = [root];
  tree.iterate({
    mode: IterMode.IgnoreMounts,
    enter(node) {
      const item: DebugNode = {
        name: node.name,
        text: doc.slice(node.from, node.to),
        children: [],
      };
      stack[stack.length - 1].push(item);
      stack.push(item.children);
    },
    leave() {
      stack.pop();
    },
  });
  return root[0];
}

// The editor currently mounted, if any (see registerDebugView).
let currentView: EditorView | undefined;

// Called by NoteEditor on mount. Returns the matching unregister function,
// meant to be passed to onCleanup.
export function registerDebugView(view: EditorView): () => void {
  currentView = view;
  return () => {
    if (currentView === view) currentView = undefined;
  };
}

// Forces a complete parse of the current editor's document (the editor
// itself normally parses lazily) and logs the resulting tree as-is.
function dumpCurrentEditor(): void {
  if (!currentView) {
    console.warn("[cardpotDebug] no editor is mounted");
    return;
  }
  const { state } = currentView;
  const tree = ensureSyntaxTree(state, state.doc.length, PARSE_TIMEOUT_MS);
  if (!tree) {
    console.error("[cardpotDebug] parsing did not finish in time");
    return;
  }
  console.log(syntaxTreeToJson(tree, state.doc.toString()));
}

// Usage from the browser console: cardpotDebug.dumpTree()
Object.assign(window, { cardpotDebug: { dumpTree: dumpCurrentEditor } });
