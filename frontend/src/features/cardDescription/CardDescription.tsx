import { createMemo, For, Match, Switch } from "solid-js";

import { parseDescription } from "./parseDescription";

export interface CardDescriptionProps {
  text: string;
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
          <Match when={segment.kind === "inline-code"}>
            <code class="grid-inline-code">{segment.text}</code>
          </Match>
        </Switch>
      )}
    </For>
  );
}
