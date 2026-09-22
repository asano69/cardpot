import { createSignal } from "solid-js";

import pb from "@/lib/api/pb";

// Minimal GET-only API tester, replacing the need to run fetch() by hand in
// the browser console with a manually copied auth token (see pb.ts's own
// authStore). Not a SwaggerUI-style explorer -- just a URL box, a Go
// button, and a response viewer -- since that's all manual endpoint testing
// actually needs.
export default function ApiDocs() {
  const [url, setUrl] = createSignal("/api/version");
  const [status, setStatus] = createSignal<number>();
  const [body, setBody] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const run = async (e: SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setStatus(undefined);
    setBody("");
    try {
      const res = await fetch(url(), {
        headers: pb.authStore.token
          ? { Authorization: pb.authStore.token }
          : {},
      });
      setStatus(res.status);
      const text = await res.text();
      // Pretty-print JSON responses; fall back to raw text for anything
      // else (e.g. plain "ok" health checks).
      try {
        setBody(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setBody(text);
      }
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-4 py-8">
      <h1 class="font-sans text-xl font-bold">API Debug</h1>

      <form onSubmit={run} class="flex gap-2">
        <input
          type="text"
          value={url()}
          onInput={(e) => setUrl(e.currentTarget.value)}
          placeholder="/api/pages/pot/slug/links1hop"
          class="flex-1 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm text-text"
        />
        <button type="submit" class="btn" disabled={loading()}>
          {loading() ? "Running…" : "Go"}
        </button>
      </form>

      {error() && <p class="text-sm text-[#dc3545]">{error()}</p>}

      {status() !== undefined && (
        <p class="font-mono text-sm text-text">Status: {status()}</p>
      )}

      <pre class="max-h-[70vh] overflow-auto rounded-md border border-border bg-field p-3 font-mono text-xs text-text">
        {body()}
      </pre>
    </div>
  );
}
