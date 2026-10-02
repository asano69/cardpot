import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest bundles its own Vite, which does not understand the
// `resolve.tsconfigPaths` option vite.config.ts uses for the "@/*" alias, so
// the alias is declared explicitly here. Only what the tests need is
// configured; the Solid and Tailwind plugins of vite.config.ts are not
// loaded by any test.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
  },
});
