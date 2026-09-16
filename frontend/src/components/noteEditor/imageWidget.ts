import {
  EditorView,
  Decoration,
  WidgetType,
  type DecorationSet,
} from "@codemirror/view";
import { StateField, type EditorState } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { Image, StrongImage } from "./parser/cardpot";
import { decideBracketNodeType } from "./parser/cardpot/rules/bracket";

// Scrapbox distinguishes a plain image reference ("[url]") from its
// magnified "strong" form ("[[url]]"): the plain form is capped in
// both width and height, while the strong form is only capped in
// width and may grow as tall as its aspect ratio demands. Both
// preserve aspect ratio via plain max-width/max-height + auto sizing,
// no separate aspect-ratio math needed.
const IMAGE_MAX_WIDTH_PX = 862;
const IMAGE_MAX_HEIGHT_PX = 300;
const STRONG_IMAGE_MAX_WIDTH_PX = 819;

class ImageWidget extends WidgetType {
  constructor(
    private readonly src: string,
    private readonly strong: boolean,
  ) {
    super();
  }

  eq(other: ImageWidget) {
    return other.src === this.src && other.strong === this.strong;
  }

  toDOM() {
    const img = document.createElement("img");
    img.src = this.src;
    img.alt = "";
    // Inline styles beat any stylesheet regardless of cascade layers,
    // so the width/height caps below need no separate theme entry
    // (unlike hangingIndent.ts/editorTheme.ts's other widgets).
    img.style.display = "block";
    img.style.width = "auto";
    img.style.height = "auto";
    img.style.maxWidth = `${
      this.strong ? STRONG_IMAGE_MAX_WIDTH_PX : IMAGE_MAX_WIDTH_PX
    }px`;
    if (!this.strong) {
      img.style.maxHeight = `${IMAGE_MAX_HEIGHT_PX}px`;
    }
    // Non-editable, so the widget behaves like a single atomic unit
    // rather than ordinary editable content (mirrors
    // hangingIndent.ts's IndentMarkWidget).
    img.contentEditable = "false";
    return img;
  }
}

// Recovers an Image/StrongImage node's src. Neither node stores src as
// an attribute of its own (see rules/bracket.ts), so this re-derives
// it from the node's own source text -- mirroring
// externalLinkNavigation.ts's own approach for ExternalLink hrefs.
//
// A StrongImage node's range is already just its bare URL text (see
// parseStrong in rules/bracket.ts, which never wraps it in its own
// [[ ]] marks); an Image node's range still includes its [ ] pair.
function extractSrc(
  state: EditorState,
  from: number,
  to: number,
  strong: boolean,
): string | null {
  if (strong) return state.sliceDoc(from, to);
  const content = state.sliceDoc(from + 1, to - 1);
  return decideBracketNodeType(content).src ?? null;
}

// Walks the whole document rather than just the viewport: unlike a
// ViewPlugin, a StateField has no `view.visibleRanges` to scope
// against, since it computes over EditorState alone. Note-sized
// documents make this cheap enough that scoping isn't worth the
// extra complexity.
function buildDecorations(state: EditorState): DecorationSet {
  const decorations = [];
  syntaxTree(state).iterate({
    enter(node) {
      const strong = node.type === StrongImage;
      if (node.type !== Image && !strong) return;

      const src = extractSrc(state, node.from, node.to, strong);
      if (!src) return;

      // Rendered as a block widget right after the node's own line,
      // so the image appears below the syntax rather than
      // replacing it -- the raw "[url]"/"[[url]]" text stays
      // visible and editable.
      const line = state.doc.lineAt(node.to);
      decorations.push(
        Decoration.widget({
          widget: new ImageWidget(src, strong),
          block: true,
          side: 1,
        }).range(line.to),
      );
    },
  });
  return Decoration.set(decorations, true);
}

// Block decorations (Decoration.widget({ block: true }) above) must be
// supplied by a StateField, not a ViewPlugin -- CodeMirror throws
// "Block decorations may not be specified via plugins" otherwise,
// since a view plugin's decorations aren't available early enough for
// CodeMirror's line-structure computation.
export const imageWidget = StateField.define<DecorationSet>({
  create(state) {
    return buildDecorations(state);
  },
  update(decorations, tr) {
    if (tr.docChanged) return buildDecorations(tr.state);
    return decorations.map(tr.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});
