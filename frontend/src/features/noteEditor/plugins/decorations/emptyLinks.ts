import { EditorState, StateEffect, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { WikiLink } from "../../parser/cardpot";
import { titleToLowerKey } from "@/lib/models/slugify";
import { decorationPlugin } from "./decorationPlugin";

// Answers whether the card a wiki link points to is "alive" (see
// lib/models/linkAlive.ts). This module only knows this predicate, never
// where the answer comes from, so the data source can change freely.
export type LinkAlive = (titleLc: string) => boolean;

// Sent from outside the editor whenever the answer may have changed. null
// means "not known yet": no link is marked until the first real predicate.
export const setLinkAlive = StateEffect.define<LinkAlive | null>();

const linkAliveField = StateField.define<LinkAlive | null>({
  create: () => null,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setLinkAlive)) value = effect.value;
    }
    return value;
  },
});

const emptyLinkMark = Decoration.mark({ class: "empty-page-link" });

// Marks every WikiLink whose target is not alive.
export function buildEmptyLinkDecorations(state: EditorState): DecorationSet {
  const isAlive = state.field(linkAliveField);
  if (!isAlive) return Decoration.none;

  const decorations = [];
  syntaxTree(state).iterate({
    enter(node) {
      if (node.type !== WikiLink) return;
      const titleLc = titleToLowerKey(
        state.sliceDoc(node.from + 1, node.to - 1),
      );
      // A link with no usable key is never stored server-side either.
      if (titleLc === "" || isAlive(titleLc)) return;
      decorations.push(emptyLinkMark.range(node.from, node.to));
    },
  });
  return Decoration.set(decorations, true);
}

export const emptyLinks = [
  linkAliveField,
  decorationPlugin({
    build: (view) => buildEmptyLinkDecorations(view.state),
    shouldRebuild: (update) =>
      update.docChanged ||
      update.startState.field(linkAliveField) !==
        update.state.field(linkAliveField) ||
      syntaxTree(update.startState) !== syntaxTree(update.state),
  }),
];
