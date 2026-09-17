import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { WikiLink } from "./parser/cardpot";
import { titleToSegment } from "../../lib/slugify";

// Makes a WikiLink node ("[title]") act as an internal navigation
// link, the same way CardItem's own <a href> does: clicking anywhere
// inside the node navigates to that title's card page. Fires
// unconditionally on any left click, without checking whether the
// target title actually exists yet (deferred to a later pass).
// Editing the raw "[title]" text is still reachable the same way as
// any other revealable syntax (Bold, Code): moving the cursor into
// the node's range via the keyboard reveals its marks (see
// syntaxReveal.ts), independent of this click handler.
export function wikiLinkNavigation(
  potSlug: () => string,
  navigate: (path: string) => void,
) {
  return EditorView.domEventHandlers({
    mousedown(event, view) {
      if (event.button !== 0) return false; // left click only

      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos == null) return false;

      let node = syntaxTree(view.state).resolve(pos, 1);
      while (node && node.type !== WikiLink) {
        node = node.parent;
      }
      if (!node) return false;

      // Strip the surrounding "[" and "]" to get the raw title text.
      const title = view.state.sliceDoc(node.from + 1, node.to - 1);
      event.preventDefault();
      navigate(`/${potSlug()}/${titleToSegment(title)}`);
      return true;
    },
  });
}
