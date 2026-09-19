// Tier C: raw CSS injection for advanced theme customization, aimed
// at theme developers rather than end users (see Tier B in theme.ts
// for the simpler per-color override most users want). Injected as a
// plain <style> with no @layer wrapper -- per the CSS Cascade Layers
// spec, unlayered CSS always wins over any layered rule regardless of
// selector specificity, so this automatically overrides Tailwind's
// own utilities/components/base/theme layers (see
// @import "tailwindcss"'s implicit `@layer theme, base, components,
// utilities;` declaration) without needing !important or a
// higher-specificity selector.
//
// Target STABLE, DOCUMENTED class names (e.g. .card-grid-item, .btn --
// see styles/components.css) or a dedicated data-theme-slot attribute,
// not Tailwind's generated utility classes (e.g. bg-bg): those are an
// implementation detail that can change across a Tailwind version
// bump or a rebuild, and a single element often carries several of
// them at once, making a utility-class override easy to break
// accidentally.
const STYLE_ELEMENT_ID = "theme-override";

// Replaces (or creates) the single <style> element this module owns.
// Safe to call repeatedly -- switching themes replaces the previous
// override outright rather than layering CSS on top of CSS.
export function applyThemeOverrideCss(css: string): void {
  let style = document.getElementById(
    STYLE_ELEMENT_ID,
  ) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    document.head.appendChild(style);
  }
  style.textContent = css;
}

// Fetches CSS text from `url` and applies it (see applyThemeOverrideCss).
// Left as a separate function from apply so a caller that already has
// the CSS text in hand (e.g. from a settings form) can skip the fetch.
export async function loadThemeOverrideCss(url: string): Promise<void> {
  const res = await fetch(url);
  const css = await res.text();
  applyThemeOverrideCss(css);
}

// Removes any active override, reverting to the app's own
// components.css/base.css styling.
export function clearThemeOverrideCss(): void {
  document.getElementById(STYLE_ELEMENT_ID)?.remove();
}
