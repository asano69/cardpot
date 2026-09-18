import { createSignal } from "solid-js";

// "system" means no explicit override: the app just follows the
// OS/browser preference via the <meta name="color-scheme"> tag in
// index.html, same as before this file existed.
export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

// Toggles the .light/.dark class on <html> (see the :root.light /
// :root.dark rules in styles/theme/base.css). Neither class present is
// "system": color-scheme then falls back to the OS preference.
function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
}

// Module-level signal, applied immediately on import (see main.tsx) so
// the correct theme is set before the first paint, not just once
// ThemeToggle happens to mount.
const [theme, setThemeSignal] = createSignal<Theme>(readStoredTheme());
applyTheme(theme());

export const currentTheme = theme;

export function setTheme(next: Theme): void {
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  setThemeSignal(next);
}

// A preset selects which color values a --theme-*-light/-dark slot
// resolves to (see styles/theme/base.css's fallback chain and the
// sibling light-*.css/dark-*.css preset files). One shared type for
// both axes: a preset name doesn't need to exist for both light and
// dark -- an unimplemented pairing just falls back to base.css's
// hardcoded default -- so there's no need for two separate types.
// "default" means no preset file applies, which resolves straight to
// that hardcoded default.
export type ThemePreset = "default" | "blue";

const LIGHT_PRESET_KEY = "lightPreset";
const DARK_PRESET_KEY = "darkPreset";

function readStoredPreset(key: string): ThemePreset {
  const stored = localStorage.getItem(key);
  return stored === "blue" ? stored : "default";
}

// Sets or clears data-light-theme/data-dark-theme on <html>, which is
// what a preset file's html[data-light-theme="..."] selector matches
// against (see styles/theme/light-*.css). "default" removes the
// attribute entirely rather than setting it to the literal string
// "default", since no preset file is expected to match that value.
function applyPresetAttr(attr: string, value: ThemePreset) {
  if (value === "default") {
    document.documentElement.removeAttribute(attr);
  } else {
    document.documentElement.setAttribute(attr, value);
  }
}

const [lightPreset, setLightPresetSignal] = createSignal<ThemePreset>(
  readStoredPreset(LIGHT_PRESET_KEY),
);
const [darkPreset, setDarkPresetSignal] = createSignal<ThemePreset>(
  readStoredPreset(DARK_PRESET_KEY),
);
applyPresetAttr("data-light-theme", lightPreset());
applyPresetAttr("data-dark-theme", darkPreset());

export const currentLightPreset = lightPreset;
export const currentDarkPreset = darkPreset;

export function setLightPreset(next: ThemePreset): void {
  localStorage.setItem(LIGHT_PRESET_KEY, next);
  applyPresetAttr("data-light-theme", next);
  setLightPresetSignal(next);
}

export function setDarkPreset(next: ThemePreset): void {
  localStorage.setItem(DARK_PRESET_KEY, next);
  applyPresetAttr("data-dark-theme", next);
  setDarkPresetSignal(next);
}
