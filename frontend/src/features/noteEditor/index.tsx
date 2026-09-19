import { onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, drawSelection } from "@codemirror/view";
import { closeBrackets } from "@codemirror/autocomplete";
import { hangingIndent } from "./plugins/decorations/hangingIndent";
import { wordBreak } from "./plugins/decorations/wordBreak";
import { codeBlockLines } from "./plugins/decorations/codeBlockLines";
import { imageWidget } from "./plugins/decorations/imageWidget";
import { yCollab } from "y-codemirror.next";
import { defaultKeymapGroups } from "./keymaps";
import * as Y from "yjs";
import type { WebsocketProvider } from "y-websocket";
import {
  titleCandidateExtension,
  syntheticAnnotation,
} from "./titleCandidatePlugin";
import { titleLineHighlight } from "./plugins/decorations/titleLineHighlight";
import { editorTheme } from "./editorTheme";
import {
  indentUnit,
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";
import { cardpotSyntax } from "./parser/cardpot";
import { syntaxReveal } from "./plugins/decorations/syntaxReveal";
import { wikiLinkNavigation } from "./plugins/interactions/wikiLinkNavigation";
import { externalLinkNavigation } from "./plugins/interactions/externalLinkNavigation";
import { pasteUrlDecode } from "./plugins/interactions/pasteUrlDecode";
import type { TitleCandidate } from "@/lib/models/card";
import { registerDebugView } from "./debug";

export interface NoteEditorProps {
  ydoc: Y.Doc;
  provider?: WebsocketProvider;
  potSlug: () => string;
  initialTitle?: string;
  autofocus?: boolean;
  existingTitle?: string;
  onConfirmedTitle: (candidate: TitleCandidate) => void;
}

// Rendering-only CodeMirror adapter. The caller owns the Y.Doc and every
// persistence/network provider, so lifecycle changes cannot alter its mode.
export default function NoteEditor(props: NoteEditorProps) {
  const navigate = useNavigate();
  const ytext = props.ydoc.getText("content");
  const handleSlugCandidate = (candidate: TitleCandidate) => {
    props.onConfirmedTitle(candidate);
  };
  // Solid doesn't auto-unmount ref callbacks the way React's new
  // ref-cleanup convention does, so `view.destroy()` is wired to
  // onCleanup explicitly below.
  const mountEditor = (el: HTMLDivElement) => {
    // The doc always starts from `ytext`'s current content here --
    // for a brand-new card that's empty, for an existing one it's
    // whatever the room already holds. yCollab keeps this view and
    // `ytext` in sync afterward. Awareness (remote cursors) isn't
    // wired up yet -- passing null keeps this skeleton minimal; see
    // this file's own top comment.
    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        EditorView.lineWrapping,
        // Draws the cursor/selection itself (via coordsAtPos) instead
        // of relying on the browser's native contenteditable caret.
        // Needed because IndentMarkWidget replaces an indent character
        // with a widget (see hangingIndent.ts): right after
        // Tab inserts a new widget, the native caret can render at a
        // stale layout position until the next reflow (e.g. another
        // keystroke or Shift-Tab) forces the browser to recompute it.
        // CodeMirror's own caret is computed fresh from the current
        // position mapping every time, so it never shows that lag.
        drawSelection(),
        // Auto-closes (), [], {}, '', "", `` and types over an
        // existing closer instead of duplicating it. Also handles
        // nested brackets on its own -- "[" twice in a row produces
        // "[[|]]" -- so this is what makes typing "[[Some Page]]"
        // (see cardpotSyntax.ts's WikiLink) feel natural, with no
        // custom handling needed for the double-bracket case.
        closeBrackets(),
        yCollab(ytext, null),
        titleCandidateExtension(handleSlugCandidate),
        titleLineHighlight,
        editorTheme,
        // Hanging indent for wrapped lines, and the Scrapbox/Cosense-
        // style bullet dot on a line's leading indent (see
        // hangingIndent.ts) -- each character of the parser's Indent
        // node is replaced 1:1 with a fixed-width "pad" element, so deleting
        // one behaves like deleting any other single character (no
        // separate atomic-range handling needed for that anymore).
        hangingIndent,
        // Controls how lines wrap (see wordBreak.ts / editorTheme.ts's
        // ".cm-line" rule): break-all is the baseline everywhere,
        // restoring normal word-boundary wrapping for ordinary short
        // runs, so neither a widget boundary nor a long unbroken run
        // forces an unnatural break elsewhere in the line.
        wordBreak,
        codeBlockLines,
        imageWidget,
        // Cardpot's own Scrapbox-style syntax parser (see
        // parser/cardpot/index.ts): block notation (indentation, quotes,
        // `code:` and `table:` blocks) and inline notation (decorations,
        // links, images, hashtags, ...). syntaxReveal reads this same
        // syntax tree to decide when to hide/show the raw markup around
        // the cursor, Obsidian-style (see syntaxReveal.ts).
        cardpotSyntax(),
        // Colors tokens inside `code:` blocks once their
        // language has resolved (see parser/cardpot/codeLanguages.ts).
        syntaxHighlighting(defaultHighlightStyle),
        syntaxReveal,
        wikiLinkNavigation(props.potSlug, navigate),
        externalLinkNavigation(),
        pasteUrlDecode(),
        // A single real tab character per indent level, not spaces --
        // indentMore/indentLess (bound below) both insert/remove
        // whatever this unit is. The parser itself accepts any
        // ECMAScript whitespace as indentation (see
        // parser/cardpot/indent.ts), so a tab is just the unit this
        // editor produces.
        indentUnit.of("\t"),
        // Every key binding, grouped by origin and ordered by
        // precedence (see keymaps.ts): Cardpot's own Tab/Enter/`/`*`
        // bindings win over the library keymaps that follow them,
        // since each group becomes its own keymap.of(...) extension
        // and CodeMirror's keymap() facet lets earlier extensions win
        // on a clash. yCollab's own yUndoManagerKeymap group is what
        // backs undo/redo here -- CM6's own history() extension is
        // deliberately not added, to avoid two undo stacks fighting
        // each other.
        ...defaultKeymapGroups.map((group) => keymap.of(group.bindings)),
      ],
    });

    const view = new EditorView({ state, parent: el });
    // Lets cardpotDebug.dumpTree() in the browser console find this editor.
    const unregisterDebug = registerDebugView(view);

    // Seed the document's first line with initialTitle for a
    // brand-new draft opened from a URL slug that matched no existing
    // card (see CardForm.tsx). Tagged with syntheticAnnotation so
    // titleCandidatePlugin doesn't treat this as a real user edit --
    // otherwise this programmatic seed alone would start (and, after
    // the debounce window, fire) the title-confirmation flow with no
    // actual user action, silently turning every "URL slug that
    // doesn't exist yet" visit into a real card. The header still
    // only resolves into a real "cards" record once the user actually
    // types, pastes, or presses Enter (see titleCandidatePlugin). No
    // focus is set here; that's left to the autofocus block below.
    if (props.initialTitle) {
      view.dispatch({
        changes: { from: 0, insert: props.initialTitle },
        annotations: syntheticAnnotation.of(true),
      });
    }

    // Autofocus into the editor only for a brand-new draft card, so
    // typing can start immediately. Opening an existing card leaves
    // focus untouched. Deferred to the next task: right after mount
    // the editor's DOM element may not be attached to the document
    // yet, which makes a synchronous focus() call silently do nothing.
    if (props.autofocus) {
      setTimeout(() => view.focus(), 0);
    }

    // Only fill the placeholder for a card whose server-confirmed
    // title is already "Untitled" (see cards.go's defaultTitle
    // fallback for an empty candidate). Gating on this synchronous,
    // already-known value -- instead of only checking whether the Yjs
    // doc *looks* empty once "sync" fires -- avoids a race where the
    // doc actually has content that simply hasn't synced to this
    // client yet: that content used to get misread as "still empty"
    // and clobbered with literal "Untitled" text. `provider` is only
    // set here for a card that was already an existing record when
    // this editor mounted (see connectProvider above), so this also
    // never runs for a card still being actively drafted. Only fires
    // once: the listener removes itself the first time it sees a
    // completed sync.
    let fillUntitledIfEmpty: (() => void) | undefined;
    if (props.provider && props.existingTitle === "Untitled") {
      fillUntitledIfEmpty = () => {
        props.provider?.off("sync", fillUntitledIfEmpty!);
        if (view.state.doc.line(1).text.trim() === "") {
          // Synthetic for the same reason as the initialTitle seed
          // above: this is a programmatic fill, not a user edit.
          view.dispatch({
            changes: { from: 0, insert: "Untitled" },
            annotations: syntheticAnnotation.of(true),
          });
        }
      };
      props.provider.on("sync", fillUntitledIfEmpty);
    }

    onCleanup(() => {
      if (fillUntitledIfEmpty) props.provider?.off("sync", fillUntitledIfEmpty);
      unregisterDebug();
      view.destroy();
    });
  };

  // Horizontal padding is minimal on narrow screens (phones) since
  // width is scarce there, but vertical padding stays generous
  // regardless of screen size.
  return (
    <>
      <div class="min-w-0 flex-1 px-2 py-10 sm:px-10 bg-field shadow-md">
        <div ref={mountEditor} class="text-text outline-none" />
      </div>
      {/* Reserves space below the editor so a long note's last line
          never lands flush against the bottom of the viewport --
          mirrors Cosense's own .related-page-list (see
          styles/components.css), including its class names, since
          this will eventually host the backlinks panel described in
          docs/wikilink-backlink-design.md. Empty for now -- both the
          toolbar and the link list are unimplemented. */}
      <section class="related-page-list">
        <div class="toolbar" />
        <div class="links-container" />
      </section>
    </>
  );
}
