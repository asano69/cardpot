// frontend/src/components/AuthGate.tsx
import { createSignal, onCleanup, Show, type JSX } from "solid-js";

import { isAuthenticated, onAuthChange, refreshSession } from "@/lib/api/auth";
import Login from "@/pages/Login";

// How often the token is re-validated with the server (see refreshSession).
const REFRESH_INTERVAL_MS = 10 * 60_000;

interface AuthGateProps {
  children: JSX.Element;
}

// AuthGate blocks the whole app behind Login until a valid session (a
// regular user or a superuser) exists, tracking the auth state (see
// lib/api/auth.ts) so it reacts immediately to both login and logout.
export default function AuthGate(props: AuthGateProps) {
  const [authed, setAuthed] = createSignal(isAuthenticated());
  const unsubscribe = onAuthChange(() => setAuthed(isAuthenticated()));
  onCleanup(unsubscribe);

  // isAuthenticated() already accounts for token expiry, but nothing
  // re-checks it while the tab stays open with no login/logout activity.
  // Poll periodically so an expired token falls back to Login on its own,
  // instead of waiting for a page reload or a failed API call.
  const expiryCheck = setInterval(() => setAuthed(isAuthenticated()), 30_000);
  onCleanup(() => clearInterval(expiryCheck));

  // The expiry check above cannot see a token the server has invalidated
  // (e.g. after a password change), so it is re-validated at startup and
  // periodically. This also extends the token's lifetime.
  void refreshSession();
  const refreshTimer = setInterval(
    () => void refreshSession(),
    REFRESH_INTERVAL_MS,
  );
  onCleanup(() => clearInterval(refreshTimer));

  return (
    <Show when={authed()} fallback={<Login />}>
      {props.children}
    </Show>
  );
}
