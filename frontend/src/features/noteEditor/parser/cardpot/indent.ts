/**
 * Cardpot indentation is deliberately measured in source characters, rather
 * than display columns. This is the ECMAScript `^\\s+` definition: a tab, a
 * half-width space, and a full-width space therefore each contribute one
 * level.
 */
const leadingIndent = /^\s+/u;

/** Returns the number of leading ECMAScript whitespace characters in a line. */
export function countIndent(text: string): number {
  return leadingIndent.exec(text)?.[0].length ?? 0;
}

/** True when a line has no content other than ECMAScript whitespace. */
export function isBlankLine(text: string): boolean {
  return /^\s*$/u.test(text);
}
