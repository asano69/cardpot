import type { CommandId } from "./commands";

// Hotkey -> command. Keys use tinykeys syntax: "$mod" is Cmd on macOS and
// Ctrl elsewhere, "+" joins modifiers, and a space separates a sequence
// ("g g"). Plain data on purpose, so it can later be loaded from JSON and
// merged with the user's overrides.
export type Keymap = Record<string, CommandId>;

export const defaultKeymap: Keymap = {
  "$mod+k": "search.focus",
};
