import { describe, expect, it } from "vitest";
import { Collection } from "@signaldb/core";

describe("SignalDB cards collection", () => {
  it("supports CRUD operations", () => {
    const cards = new Collection<{ id: string; pot: string; position: number }>();

    cards.insert({ id: "card-1", pot: "pot-1", position: 1000 });
    cards.updateOne({ id: "card-1" }, { $set: { position: 2000 } });
    expect(cards.find({ pot: "pot-1" }).fetch()).toEqual([
      { id: "card-1", pot: "pot-1", position: 2000 },
    ]);

    cards.removeOne({ id: "card-1" });
    expect(cards.find().fetch()).toEqual([]);
  });
});
