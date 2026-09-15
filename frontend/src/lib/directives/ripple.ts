import { onCleanup } from "solid-js";
import ripplet from "ripplet.js";

// Shared "how a tap ripple looks" so every element using this
// directive stays visually consistent, instead of each call site
// repeating the same options object.
const RIPPLE_OPTIONS = {
  spreadingDuration: ".2s",
  clearingDuration: ".6s",
};

// Solid directive: adds a Material-style tap ripple to any element
// via `use:ripple`.
//
// Fires ripplet() on every pointerdown, touch included. This used to
// be special-cased on touch -- waiting for pointerup, and only firing
// if the finger hadn't moved past dnd-kit's own drag-activation
// distance in the meantime -- to avoid flashing a ripple when a touch
// press turned into a card drag. That approach also broke rendering
// entirely on mobile: by the time pointerup fires, this app's SPA
// navigation to the card can already be under way, so there's no time
// left for the ripple to paint before its DOM node is torn down. A
// mouse click doesn't have this problem only because ripplet()
// already ran back at mousedown, well before the later mouseup/click
// actually navigates -- pointerdown is simply the earliest, safest
// place to start a ripple for either input type. Deferring the call
// with a timer (e.g. to only fire once a touch has been held as long
// as dnd-kit's own drag-activation delay) would reintroduce the same
// problem for any tap released before that timer fires.
//
// No separate "don't ripple during a drag" handling is needed: the
// card already fades to opacity-40 the moment isDragging() goes true
// (see CardItem.tsx), which fades out any in-progress ripple right
// along with it.
export function ripple(el: Element) {
  const onPointerDown = (event: PointerEvent) => ripplet(event, RIPPLE_OPTIONS);
  el.addEventListener("pointerdown", onPointerDown as EventListener);
  onCleanup(() =>
    el.removeEventListener("pointerdown", onPointerDown as EventListener),
  );
}

// Registers `ripple` as a valid Solid JSX directive (`use:ripple`)
// for TypeScript.
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      ripple: true;
    }
  }
}
