import { db } from "./db";

// Whether a wiki link target is "alive": the card it names exists, or at
// least two cards link to it.
//
// "Two" and not "one" because the answer must not depend on who asks. A link
// shown anywhere is written in some card, and that card is itself one of the
// linkers, so "someone else links here too" is "two or more link here". The
// only inaccuracy is a link typed a moment ago, which is not counted until the
// server has synced it.
//
// This is the only place that knows where the facts come from. Links across
// pots will change this function and nothing else: the key is already
// (pot, titleLc) of the target.
export async function computeAlive(
  pot: string,
  titleLc: string,
): Promise<boolean> {
  const cards = await db.cards
    .where("[pot+titleLc]")
    .equals([pot, titleLc])
    .count();
  if (cards > 0) return true;

  const linkers = await db.card_links
    .where("[target_pot+target_titleLc]")
    .equals([pot, titleLc])
    .count();
  return linkers >= 2;
}
