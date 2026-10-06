// The single list of commands a hotkey can trigger. A command is only an id
// and a title: what it does is decided by whichever component is mounted and
// registers a handler for it (see hotkeys.ts's useHotkeys).
export const commands = {
  "search.focus": { title: "Focus title search" },
} as const;

export type CommandId = keyof typeof commands;
