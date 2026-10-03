import { createEffect, createMemo, For, Match, Switch } from "solid-js";

import { titleToLowerKey } from "@/lib/models/slugify";
import { linkAlive, requestLinkAlive } from "@/lib/stores/linkAliveStore";
import { parseDescription } from "./parseDescription";

export interface CardDescriptionProps {
  text: string;
  // Pot the card belongs to; wiki links are resolved within it. Without it
  // no link is marked as empty.
  potId?: string;
}

// A wiki link in a description. Marked empty (see components.css's
// .grid-empty) only once the shared store has answered that its target is
// dead; "not answered yet" is never marked.
function WikiLinkSpan(props: { potId?: string; title: string }) {
  const lc = () => titleToLowerKey(props.title);
  createEffect(() => {
    if (props.potId) requestLinkAlive(props.potId, lc());
  });
  const dead = () =>
    props.potId !== undefined && linkAlive(props.potId, lc()) === false;

  return (
    <span class="grid-wikilink" classList={{ "grid-empty": dead() }}>
      {props.title}
    </span>
  );
}

// Renders a card's description with its notation marked up. The card
// itself is an <a>, so links are plain <span>s without click behavior.
export default function CardDescription(props: CardDescriptionProps) {
  const segments = createMemo(() => parseDescription(props.text));

  return (
    <For each={segments()}>
      {(segment) => (
        <Switch
          fallback={<span class={`grid-${segment.kind}`}>{segment.text}</span>}
        >
          <Match when={segment.kind === "text"}>{segment.text}</Match>
          <Match when={segment.kind === "wikilink"}>
            <WikiLinkSpan potId={props.potId} title={segment.text} />
          </Match>
          <Match when={segment.kind === "inline-code"}>
            <code class="grid-inline-code">{segment.text}</code>
          </Match>
        </Switch>
      )}
    </For>
  );
}
