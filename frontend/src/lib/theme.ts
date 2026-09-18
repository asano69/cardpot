import { createSignal } from "solid-js";

// "system" means no explicit override: mode follows the OS/browser
// preference (see resolveMode below) rather than a value the user
// picked.
export type Mode = "light" | "dark" | "system";

// Color presets a user can pick, independent of light/dark mode (see
// base.css's [data-theme][data-mode] blocks) -- each preset only
// needs to declare the token overrides that differ from :root's
// defaults.
export type ThemePreset = "default" | "blue";

const MODE_KEY = "mode";
const THEME_KEY = "theme";

function readStoredMode(): Mode {
  const stored = localStorage.getItem(MODE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function readStoredPreset(): ThemePreset {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "blue" ? stored : "default";
}

// Resolves "system" against the OS preference; "light"/"dark" pass
// through unchanged. This is the value actually written to
// data-mode, since that attribute must always be a concrete mode for
// base.css's [data-theme][data-mode] blocks to match.
function resolveMode(mode: Mode): "light" | "dark" {
  if (mode === "system") {
    return matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

// Sets data-theme/data-mode on <html> -- the two independent axes
// base.css's token overrides key off (see that file's own comment).
function applyAttrs(preset: ThemePreset, mode: Mode) {
  document.documentElement.setAttribute("data-theme", preset);
  document.documentElement.setAttribute("data-mode", resolveMode(mode));
}

// Module-level signals, applied immediately on import (see main.tsx)
// so the correct theme is set before the first paint, not just once
// a settings component happens to mount.
const [mode, setModeSignal] = createSignal<Mode>(readStoredMode());
const [preset, setPresetSignal] = createSignal<ThemePreset>(readStoredPreset());
applyAttrs(preset(), mode());

// Keeps data-mode in sync with the OS preference while "system" is
// selected, so switching the OS theme is reflected without a reload.
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (mode() === "system") applyAttrs(preset(), "system");
});

export const currentMode = mode;
export const currentPreset = preset;

export function setMode(next: Mode): void {
  localStorage.setItem(MODE_KEY, next);
  setModeSignal(next);
  applyAttrs(preset(), next);
}

export function setPreset(next: ThemePreset): void {
  localStorage.setItem(THEME_KEY, next);
  setPresetSignal(next);
  applyAttrs(next, mode());
}
