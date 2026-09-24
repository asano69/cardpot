import { Centrifuge } from "centrifuge";
import pb from "./pb";
import type { CardEvent } from "./cardApi";

let client: Centrifuge | undefined;

function getClient(): Centrifuge {
  if (!client) {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    client = new Centrifuge(`${proto}//${location.host}/connection/websocket`, {
      getToken: async () => pb.authStore.token,
    });
    // Connection lifetime follows the PocketBase session.
    pb.authStore.onChange(() =>
      pb.authStore.isValid ? client!.connect() : client!.disconnect(),
    );
    client.connect();
  }
  return client;
}

// Subscribes to one pot's card events. `onResync` fires when events may
// have been missed and could not be replayed (server restart, history
// expired), so the caller must reload from the server.
export function subscribeToPotCards(
  potId: string,
  onEvent: (event: CardEvent) => void,
  onResync: () => void,
): () => void {
  const c = getClient();
  const sub = c.newSubscription(`cards:${potId}`);
  let subscribedBefore = false;

  sub.on("publication", (ctx) => onEvent(ctx.data as CardEvent));
  sub.on("subscribed", (ctx) => {
    // Any re-subscribe that did not recover state may have a gap.
    if (subscribedBefore && !ctx.recovered) onResync();
    subscribedBefore = true;
  });
  sub.subscribe();

  return () => {
    sub.unsubscribe();
    c.removeSubscription(sub);
  };
}
