import { Centrifuge, UnauthorizedError } from "centrifuge";
import pb from "./pb";
import type { CardEvent } from "./cardApi";

// One shared connection for the whole app, created on first use. Callers
// Callers only ever see subscribeToCards below, so nothing else depends on
// the centrifuge SDK.
let client: Centrifuge | undefined;

function getClient(): Centrifuge {
  if (client) return client;

  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const created = new Centrifuge(
    `${protocol}//${location.host}/connection/websocket`,
    {
      // Called on every (re)connect, so a reconnect always presents the
      // current PocketBase token. UnauthorizedError stops the SDK from
      // retrying with a token that can never work.
      getToken: async () => {
        if (!pb.authStore.isValid) {
          throw new UnauthorizedError("no valid session");
        }
        return pb.authStore.token;
      },
    },
  );

  // The connection's lifetime follows the PocketBase session.
  pb.authStore.onChange(() => {
    if (pb.authStore.isValid) created.connect();
    else created.disconnect();
  });

  created.connect();
  client = created;
  return created;
}

// Subscribes to every card event of every pot and returns an unsubscribe
// function.
//
// `onResync` fires when events may have been missed and could not be
// replayed (server restart, history expired, history overflow). The caller
// must then reload what it shows from the server. A plain short disconnect
// does not trigger it: the server replays the missed events through
// `onEvent` instead.
export function subscribeToCards(
  onEvent: (event: CardEvent) => void,
  onResync: () => void,
): () => void {
  const connection = getClient();
  const subscription = connection.newSubscription("cards");
  let subscribedBefore = false;

  subscription.on("publication", (ctx) => onEvent(ctx.data as CardEvent));
  subscription.on("subscribed", (ctx) => {
    // The first subscription has no earlier state to recover. Any later one
    // that did not recover may have a gap.
    if (subscribedBefore && !ctx.recovered) onResync();
    subscribedBefore = true;
  });
  subscription.on("error", (ctx) => {
    console.error("[realtime] subscription error:", ctx.error);
  });
  subscription.subscribe();

  return () => {
    subscription.unsubscribe();
    connection.removeSubscription(subscription);
  };
}
