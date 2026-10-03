import remark from "remark";
import gfm from "remark-gfm";
import { compiler } from "./compiler";

// Converts Markdown to Scrapbox notation. A new processor is built on every
// call because the compiler keeps per-document state (see compiler.ts).
export function convert(markdown: string): string {
  return String(remark().use(gfm).use(compiler).processSync(markdown));
}
