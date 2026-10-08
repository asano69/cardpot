import type { WebsocketProvider } from "y-websocket";

type Awareness = WebsocketProvider["awareness"];

// Wraps an awareness so that every remote cursor looks collapsed to its head.
// y-codemirror.next draws a selection from anchor to head, and for a
// multi-line selection it puts an inline background-color on whole lines,
// which overrides line backgrounds such as a code block's, even when the
// color is transparent. With anchor === head there is no selection to draw:
// only the caret (at the head) and the name flag remain.
export function caretOnly(awareness: Awareness): Awareness {
  return new Proxy(awareness, {
    get(target, prop) {
      if (prop === "getStates") {
        return () => {
          const states = new Map<number, Record<string, any>>();
          for (const [id, state] of target.getStates()) {
            const cursor = state.cursor;
            states.set(
              id,
              cursor
                ? { ...state, cursor: { ...cursor, anchor: cursor.head } }
                : state,
            );
          }
          return states;
        };
      }
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

// Publishes who this tab is. y-codemirror.next reads the "user" field of
// every remote awareness state to draw that peer's cursor and name flag:
// "color" is the caret and flag color. Every user is green. The selection is
// not shown (see caretOnly), so "colorLight" is never visible.
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
