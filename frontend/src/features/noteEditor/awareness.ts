import type { WebsocketProvider } from "y-websocket";

type Awareness = WebsocketProvider["awareness"];

// Publishes who this tab is. y-codemirror.next reads the "user" field of
// every remote awareness state to draw that peer's cursor and name flag:
// "color" is the caret and flag color, "colorLight" the selection color.
// Every user is green, and the selection itself is not drawn (transparent):
// only the caret position and the name flag are shown.
//
// Nothing is drawn while no peer is present, and y-websocket drops all
// remote states when the connection closes, so a lone or offline user never
// sees a flag.
export function setLocalUser(
  awareness: Awareness,
  user: { name: string },
): void {
  awareness.setLocalStateField("user", {
    name: user.name,
    color: "green",
    colorLight: "transparent",
  });
}
