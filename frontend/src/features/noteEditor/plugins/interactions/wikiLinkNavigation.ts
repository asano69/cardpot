import { EditorView } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { WikiLink } from "../../parser/cardpot";
import { titleToSegment } from "@/lib/models/slugify";

// Makes a WikiLink node ("[title]") act as an internal navigation
// link, the same way CardItem's own <a href> does: clicking anywhere
// inside the node navigates to that title's card page. Fires
// unconditionally on any left click, without checking whether the
// target title actually exists yet (deferred to a later pass).
// Editing the raw "[title]" text is still reachable the same way as
// any other revealable syntax (Bold, Code): moving the cursor into
// the node's range via the keyboard reveals its marks (see
// syntaxReveal.ts), independent of this click handler.
// The class syntaxReveal.ts assigns to a WikiLink's rendered span (see
// index.ts's revealStyle.add config). Used below to confirm a click
// actually landed on the visible link text, not just on a document
// position that happens to fall inside the node's range.
const WIKILINK_CLASS = "cm-wikilink";

export function wikiLinkNavigation(
  potSlug: () => string,
  navigate: (path: string) => void,
) {
  return EditorView.domEventHandlers({
    mousedown(event, view) {
      if (event.button !== 0) return false; // left click only

      // posAtCoords clips horizontally to the nearest document
      // position on the line, so a click in the blank space past the
      // end of a line (or past a WikiLink's own shortened, mark-
      // hidden width) can still resolve to a position inside this
      // node. syntaxReveal.ts wraps every revealable node's full
      // range in a <span> carrying its style class, so checking the
      // click's actual DOM target against that class confirms the
      // click landed on the rendered text itself, without needing to
      // compute or compare pixel coordinates by hand.
      const target = event.target as HTMLElement | null;
      if (!target?.closest(`.${WIKILINK_CLASS}`)) return false;

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
