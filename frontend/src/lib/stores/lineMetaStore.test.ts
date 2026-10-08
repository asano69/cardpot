import { createRoot } from "solid-js";
import * as Y from "yjs";
import { describe, expect, it } from "vitest";
import type { WebsocketProvider } from "y-websocket";
import { lineMetaMap } from "../models/lineMeta";
import { createLineMeta } from "./lineMetaStore";

const entry = { userId: "u", name: "n", at: 1 };

function fakeProvider() {
  const listeners = new Set<(synced: boolean) => void>();
  const provider = {
    synced: false,
    on: (_event: string, fn: (synced: boolean) => void) => listeners.add(fn),
    off: (_event: string, fn: (synced: boolean) => void) =>
      listeners.delete(fn),
  };
  return {
    provider: provider as unknown as WebsocketProvider,
    sync() {
      provider.synced = true;
      listeners.forEach((fn) => fn(true));
    },
  };
}

// Applies a meta write of another client to `ydoc` as a remote update.
function remoteWrite(ydoc: Y.Doc, key: string) {
  const other = new Y.Doc();
  Y.applyUpdate(other, Y.encodeStateAsUpdate(ydoc));
  lineMetaMap(other).set(key, entry);
  Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(other));
}

function mount(ydoc: Y.Doc, provider?: WebsocketProvider) {
  let dispose!: () => void;
  const store = createRoot((d) => {
    dispose = d;
    return createLineMeta(ydoc, provider);
  });
  return { store, dispose };
}

describe("createLineMeta", () => {
  it("collects only changes made after the first sync", () => {
    const ydoc = new Y.Doc();
    const { provider, sync } = fakeProvider();
    const { store, dispose } = mount(ydoc, provider);

    remoteWrite(ydoc, "1:1"); // the server's state arriving during sync
    expect(store.updated().size).toBe(0);

    sync();
    remoteWrite(ydoc, "1:2");
    expect([...store.updated()]).toEqual(["1:2"]);
    expect(Object.keys(store.meta()).sort()).toEqual(["1:1", "1:2"]);
    dispose();
  });

  it("also collects the user's own writes after the first sync", () => {
    const ydoc = new Y.Doc();
    const { provider, sync } = fakeProvider();
    const { store, dispose } = mount(ydoc, provider);

    lineMetaMap(ydoc).set("1:5", entry); // before the sync: not collected
    expect(store.updated().size).toBe(0);

    sync();
    lineMetaMap(ydoc).set("1:3", entry);
    expect([...store.updated()]).toEqual(["1:3"]);
    expect(Object.keys(store.meta()).sort()).toEqual(["1:3", "1:5"]);
    dispose();
  });

  it("collects nothing without a provider", () => {
    const ydoc = new Y.Doc();
    const { store, dispose } = mount(ydoc);
    remoteWrite(ydoc, "1:4");
    expect(store.updated().size).toBe(0);
    dispose();
  });
});
