/// <reference types="vite/client" />

// Injected by vite.config.ts's `define` at build time; see Logo.tsx and
// index.html's %APP_NAME% placeholder for where it's consumed.
declare const __APP_NAME__: string;

// .grammar files are compiled by @lezer/generator/rollup (see
// vite.config.ts) into a module exporting a parser plus any named
// terms declared with @external prop or similar.
declare module "*.grammar" {
  import type { LRParser } from "@lezer/lr";
  export const parser: LRParser;
}
