// frontend/src/lib/pb.ts
import PocketBase from "pocketbase";

// Single shared PocketBase client, used to call custom API routes
// (e.g. POST /api/admin/jobs/rescan) from the frontend.
const pb = new PocketBase("/");

// A 401 means the server rejected the request as unauthenticated: the
// client-side JWT expiry check in pb.authStore.isValid missed a session the
// server has already invalidated (revoked token, password change, etc.).
// Clearing the store here triggers AuthGate's onChange listener and falls
// back to Login.
//
// A 403 is deliberately NOT handled here: it is an ordinary "not allowed"
// error for a regular user, and clearing the session on it would log the
// user out. An invalid token sent to a collection route is treated as no
// auth at all and yields empty lists rather than a 403, which is why
// refreshSession() (see auth.ts) re-validates the token on its own.
pb.afterSend = function (response: Response, data: unknown) {
  if (response.status === 401) {
    pb.authStore.clear();
  }
  // In dev, also log the full response body for failed requests
  // (validation errors, etc.) so a bare status code in the UI doesn't
  // leave you guessing what actually went wrong. Stripped out of prod
  // builds since it's gated behind Vite's import.meta.env.DEV.
  if (import.meta.env.DEV && !response.ok) {
    console.error(`[pb] ${response.status} ${response.url}`, data);
  }
  return data;
};

// Dev only: lets you inspect the client from the browser console,
// e.g. pb.authStore.record or pb.collection("_superusers").authRefresh().
if (import.meta.env.DEV) Object.assign(window, { pb });

export default pb;
