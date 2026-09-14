// While a line-0 edit is awaiting its title API response, cardsById still
// contains the previous server title. Replacing the URL with that stale slug
// immediately undoes the editor's local URL update and causes a reactive
// navigation loop.
export function shouldDeferServerSlugSync(
  optimisticSegment: string | undefined,
  serverSegment: string,
): boolean {
  return optimisticSegment !== undefined && optimisticSegment !== serverSegment;
}
