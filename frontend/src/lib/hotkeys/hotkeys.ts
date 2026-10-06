import { onCleanup } from "solid-js";
import { tinykeys } from "tinykeys";

import type { CommandId } from "./commands";
import { defaultKeymap, type Keymap } from "./keymap";

type Handlers = Partial<Record<CommandId, () => void>>;

// Handlers of the components that are mounted right now, oldest first.
const mounted: Handlers[] = [];

// Registers `handlers` for as long as the calling component stays mounted.
// Same lifetime pattern as useTopBarActions (see lib/topBarSlot.tsx).
export function useHotkeys(handlers: Handlers): void {
  mounted.push(handlers);
  onCleanup(() => {
    const index = mounted.indexOf(handlers);
    if (index >= 0) mounted.splice(index, 1);
  });
}

// Runs the command with the innermost (most recently mounted) handler for it.
// Returns false when no mounted component handles it.
export function runCommand(id: CommandId): boolean {
  for (let i = mounted.length - 1; i >= 0; i--) {
    const handler = mounted[i][id];
    if (handler) {
      handler();
      return true;
    }
  }
  return false;
}

// The one place a hotkey is turned into a listener. Every hotkey in the keymap
// takes its key away from the browser, even while no mounted component handles
// its command, so a hotkey never falls through to the browser's own shortcut
// (e.g. Ctrl+K focusing the browser's search bar).
function bind(id: CommandId): (event: KeyboardEvent) => void {
  return (event) => {
    event.preventDefault();
    runCommand(id);
  };
}

// tinykeys ignores keys pressed inside inputs and contenteditable elements by
// default, which would disable every hotkey in the editor and the search box.
// Only key repeat and IME composition are ignored here, so a held key does not
// run a command over and over and a composition is never interrupted.
function ignore(event: KeyboardEvent): boolean {
  return event.repeat || event.isComposing;
}

// Listens for the keymap's hotkeys on the window and returns a function that
// stops listening. Handlers are looked up when a key is pressed, so this only
// has to run once.
export function installHotkeys(keymap: Keymap = defaultKeymap): () => void {
  const bindings = Object.fromEntries(
    Object.entries(keymap).map(([key, id]) => [key, bind(id)]),
  );
  return tinykeys(window, bindings, { ignore });
}
