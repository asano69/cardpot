import { Centrifuge, State, UnauthorizedError } from "centrifuge";
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

// The app's own view of the connection, so callers never see the SDK's State.
export type ConnectionState = "online" | "connecting" | "offline";

function toConnectionState(state: State): ConnectionState {
  if (state === State.Connected) return "online";
  if (state === State.Connecting) return "connecting";
  return "offline";
}

// Reports the current connection state immediately, then on every change.
// Returns a function that stops watching.
export function watchConnectionState(
  onChange: (state: ConnectionState) => void,
): () => void {
  const connection = getClient();
  const handler = (ctx: { newState: State }) =>
    onChange(toConnectionState(ctx.newState));
  connection.on("state", handler);
  // connect() may already have changed the state before the listener existed.
  onChange(toConnectionState(connection.state));
  return () => connection.removeListener("state", handler);
}

// Restarts a connection that stopped for good (terminal disconnect code).
// A no-op while connecting or connected.
export function reconnect(): void {
  getClient().connect();
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
