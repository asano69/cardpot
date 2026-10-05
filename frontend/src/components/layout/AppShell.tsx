import { onCleanup, onMount, type ParentProps } from "solid-js";
import MainLayout from "./MainLayout";
import { loadAllPots } from "@/lib/stores/potsStore";
import { watchCards } from "@/lib/stores/cardsStore";
import { watchConnection } from "@/lib/stores/connectionStore";
import { watchMergeAlerts } from "@/lib/stores/mergeAlertStore";
import { watchRenameAlerts } from "@/lib/stores/renameAlertStore";
import { watchDataReplicas } from "@/lib/dexie/dataReplicas";

// Wraps every route so Header and Sidebar render once regardless of page.
// Passed as Router's `root` prop (see lib/router.tsx) instead of wrapping
// <Router> from outside, since anything AppShell renders needs to live
// inside the router context (e.g. Logo's <A> links).
//
// Realtime is started here and stays on while the app is open: each
// replicated collection has one channel that carries every pot's events (see
// lib/stores/cardsStore.ts and lib/dexie/dataReplicas.ts).
export default function AppShell(props: ParentProps) {
  // Cards are no longer loaded here: each pot's card list pages in on
  // demand (see lib/stores/cardsStore.ts). Only the pot list is
  // fetched up front (see lib/stores/potsStore.ts).
  onMount(() => {
    loadAllPots();
    onCleanup(watchCards());
    onCleanup(watchDataReplicas());
    onCleanup(watchConnection());
    onCleanup(watchMergeAlerts());
    onCleanup(watchRenameAlerts());
  });

  return <MainLayout>{props.children}</MainLayout>;
}
