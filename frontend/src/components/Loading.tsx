// A small, self-contained CSS spinner shown in place of "Loading…" text,
// e.g. as the fallback of a <Show> around a createResource(). Kept as its
// own component so every route that fetches data shares the same look.
//
// It stays invisible for the first moments (see ".loading" in
// styles/components/loading.css), so a short wait shows nothing instead of a
// spinner that flashes and disappears.
export default function Loading() {
  return (
    <div class="loading">
      <div class="loading-spinner" />
    </div>
  );
}
