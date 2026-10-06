import type { WebsocketProvider } from "y-websocket";

type Awareness = WebsocketProvider["awareness"];

// Maps an id to a stable hue, so the same user always gets the same color
// (in every tab and on every peer's screen).
function hueOf(id: string): number {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 360;
}

// Publishes who this tab is. y-codemirror.next reads the "user" field of
// every remote awareness state to draw that peer's cursor and name flag:
// "color" is the caret and flag color, "colorLight" the selection color.
//
// Nothing is drawn while no peer is present, and y-websocket drops all
// remote states when the connection closes, so a lone or offline user never
// sees a flag.
export function setLocalUser(
  awareness: Awareness,
  user: { id: string; name: string },
): void {
  const hue = hueOf(user.id);
  awareness.setLocalStateField("user", {
    name: user.name,
    color: `hsl(${hue} 70% 40%)`,
    colorLight: `hsl(${hue} 70% 40% / 0.3)`,
  });
}
