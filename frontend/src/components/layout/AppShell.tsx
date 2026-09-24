import { onCleanup, onMount, type ParentProps } from "solid-js";
import MainLayout from "./MainLayout";
import { loadAllPots } from "@/lib/stores/potsStore";
import { watchCards } from "@/lib/stores/cardsStore";

// Wraps every route so Header and Sidebar render once regardless of page.
// Passed as Router's `root` prop (see lib/router.tsx) instead of wrapping
// <Router> from outside, since anything AppShell renders needs to live
// inside the router context (e.g. Logo's <A> links).
//
// Card realtime is started here and stays on while the app is open: one
// shared channel carries every pot's card events (see
// lib/stores/cardsStore.ts).
export default function AppShell(props: ParentProps) {
  // Cards are no longer loaded here: each pot's card list pages in on
  // demand (see lib/stores/cardsStore.ts). Only the pot list is
  // fetched up front (see lib/stores/potsStore.ts).
  onMount(() => {
    loadAllPots();
    onCleanup(watchCards());
  });

  return <MainLayout>{props.children}</MainLayout>;
}
