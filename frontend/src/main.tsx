// frontend/src/main.tsx
import { render } from "solid-js/web";

// Self-hosted font for date headings (see theme.css's --font-display).
// Only the weight actually used (500) is imported, to avoid shipping
// unused font files.
import "@fontsource/fraunces/500.css";

// Self-hosted body font (see theme.css's --font-sans). Only the
// weights actually used (400 regular, 700 for font-bold utilities)
// are imported, same reasoning as Fraunces above. Hiragino Sans stays
// in the font-sans stack as a fallback for Japanese glyphs, which
// Open Sans doesn't cover.
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";

// Order matters: tokens.css defines the CSS custom properties every other
// stylesheet consumes via var().
import "./styles/index.css";
import "./lib/theme";
import AppRouter from "./lib/router";
import AuthGate from "./components/AuthGate";

render(
  () => (
    <>
      <AuthGate>
        <AppRouter />
      </AuthGate>
    </>
  ),
  document.getElementById("root") as HTMLElement,
);
