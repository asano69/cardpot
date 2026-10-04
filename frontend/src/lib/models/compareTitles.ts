// Orders titles the way the server's ORDER BY title does: SQLite's BINARY
// collation compares UTF-8 bytes, which is the same as comparing code points.
// JS's < compares UTF-16 code units instead, which puts a surrogate pair (an
// emoji, U+10000 and above) before BMP characters from U+E000 up, such as
// fullwidth letters. localeCompare is not used for the same reason.

// Maps a UTF-16 code unit to a value that sorts in code point order: BMP units
// from U+E000 move down, and surrogates move above all of them.
function rank(unit: number): number {
  if (unit >= 0xe000) return unit - 0x800;
  if (unit >= 0xd800) return unit + 0x2000;
  return unit;
}

export function compareTitles(a: string, b: string): number {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const x = a.charCodeAt(i);
    const y = b.charCodeAt(i);
    if (x !== y) return rank(x) - rank(y);
  }
  return a.length - b.length;
}
