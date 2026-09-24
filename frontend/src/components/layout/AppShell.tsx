import { onCleanup, onMount, type ParentProps } from "solid-js";
import MainLayout from "./MainLayout";
import { loadAllPots } from "@/lib/stores/potsStore";
import { watchConnection } from "@/lib/stores/connectionStore";

// Wraps every route so Header and Sidebar render once regardless of page.
// Passed as Router's `root` prop (see lib/router.tsx) instead of wrapping
// <Router> from outside, since anything AppShell renders needs to live
// inside the router context (e.g. Logo's <A> links).
//
// Card realtime is no longer a single app-wide channel here: each pot
// starts (and stops) its own RxDB replication, including its own
// Centrifuge subscription, as it's opened and left (see
// pages/pots/PotLayout.tsx and lib/stores/cardsStore.ts).
export default function AppShell(props: ParentProps) {
  onMount(() => {
    loadAllPots();
    onCleanup(watchConnection());
  });

  return <MainLayout>{props.children}</MainLayout>;
}
