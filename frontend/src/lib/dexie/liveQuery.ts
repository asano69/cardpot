import { createEffect, onCleanup, type Accessor } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { liveQuery } from "dexie";

// Runs `query` against Dexie and keeps the result current: whenever the tables
// it read change (a pull, a realtime event, a resync), it runs again and the
// result is updated.
//
// `args` is read reactively (outside Dexie's tracking), so a change of its
// dependencies re-subscribes with the new arguments. While `args` returns
// undefined nothing is subscribed and the value is `initial`. After a change
// of arguments the previous value stays until the new one arrives.
//
// `query` must touch only Dexie: liveQuery tracks nothing else.
//
// The value is a store reconciled by "id", so an unchanged record keeps its
// object identity and its DOM is not recreated. `initial` therefore has to be
// plain data whose records (if any) have an "id".
export function createLiveQuery<A, T extends object>(
  args: () => A | undefined,
  query: (args: A) => Promise<T>,
  initial: T,
): Accessor<T> {
  // reconcile writes into the store's own object, so a copy is kept to go back
  // to when there are no arguments.
  const empty = structuredClone(initial);
  const [store, setStore] = createStore<T>(initial);

  createEffect(() => {
    const a = args();
    if (a === undefined) {
      setStore(reconcile(structuredClone(empty), { key: "id" }));
      return;
    }

    const subscription = liveQuery(() => query(a)).subscribe({
      next: (value) => setStore(reconcile(value, { key: "id" })),
      // The last value is kept; a later change may succeed again.
      error: (err) => console.error("[live-query] query failed:", err),
    });
    onCleanup(() => subscription.unsubscribe());
  });

  return () => store;
}
