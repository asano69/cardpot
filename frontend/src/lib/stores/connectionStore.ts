import { createSignal } from "solid-js";
import { watchConnectionState, type ConnectionState } from "../api/realtime";

const [connection, setConnection] = createSignal<ConnectionState>("offline");

export { connection };

// Keeps `connection` in sync with the realtime client. Called once by
// AppShell for as long as the app is open.
export function watchConnection(): () => void {
  return watchConnectionState(setConnection);
}
