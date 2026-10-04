// The title a hashtag links to: its text without the leading "#" (only one is
// removed, so "##a" links to "#a"). The server derives the same title (see
// parseHashTag in internal/parser/hashtag.go).
export function hashTagTitle(text: string): string {
  return text.startsWith("#") ? text.slice(1) : text;
}
