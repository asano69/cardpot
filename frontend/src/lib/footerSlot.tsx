import { createSignal, createEffect, onCleanup, type JSX } from "solid-js";

// Holds whatever the currently active page wants shown in Footer's
// status-bar slot (see components/layout/Footer.tsx). Mirrors
// lib/topBarSlot.ts's topBarActions: Footer only knows a slot exists,
// never what any given page puts into it.
const [footerContent, setFooterContent] = createSignal<JSX.Element>();
export { footerContent };

// Registers `content` as the page's contribution to Footer's slot for
// as long as the calling component stays mounted, clearing it again
// on cleanup -- same pattern as useTopBarActions.
export function useFooterSlot(content: () => JSX.Element | undefined): void {
  createEffect(() => {
    setFooterContent(content());
  });
  onCleanup(() => setFooterContent(undefined));
}
