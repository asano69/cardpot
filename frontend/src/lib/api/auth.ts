import { ClientResponseError } from "pocketbase";
import pb from "./pb";

// Thin wrapper around PocketBase's auth state, so components never need
// to know which backend they are talking to.

// Whether a valid (non-expired) session currently exists.
export function isAuthenticated(): boolean {
  return pb.authStore.isValid;
}

// Calls `callback` whenever the session changes (login, logout, token
// invalidation). Returns an unsubscribe function.
export function onAuthChange(callback: () => void): () => void {
  return pb.authStore.onChange(() => callback());
}

// URL of the logged-in user's avatar thumbnail, or undefined when none is set.
// The avatar is a field of the "users" collection (PocketBase provides it by
// default); superusers have none, so they get undefined and the menu falls
// back to its icon. Read from the record stored at login, so a newly uploaded
// avatar shows up after the next login or authRefresh().
export function avatarURL(): string | undefined {
  const record = pb.authStore.record;
  const file = record?.avatar;
  if (!record || !file) return undefined;
  return pb.files.getURL(record, file, { thumb: "64x64" });
}

// First character of the logged-in user's name (or email, for a superuser,
// who has no name), uppercased. Used as the avatar fallback. Array.from keeps
// a non-BMP character (e.g. an emoji) in one piece.
export function userInitial(): string {
  const label = currentUser()?.name ?? "";
  return Array.from(label)[0]?.toUpperCase() ?? "?";
}

// The logged-in user's id and display name (the name, falling back to the
// local part of the email, i.e. the text before "@": a superuser has no
// name), or undefined without a session.
export function currentUser(): { id: string; name: string } | undefined {
  const record = pb.authStore.record;
  if (!record) return undefined;
  const emailLocalPart = String(record.email ?? "").split("@")[0];
  return { id: record.id, name: record.name || emailLocalPart };
}

// Logs in a regular user, or a superuser: one form serves both. "users" is
// tried first; wrong credentials for it (400) fall back to "_superusers".
// Anything else (network, ...) is a real failure and is rethrown.
export async function login(email: string, password: string): Promise<void> {
  try {
    await pb.collection("users").authWithPassword(email, password);
  } catch (err) {
    if (!(err instanceof ClientResponseError) || err.status !== 400) throw err;
    await pb.collection("_superusers").authWithPassword(email, password);
  }
}

// Re-validates the stored token with the server and extends it. This catches
// a token the server has already invalidated (e.g. after a password change),
// which the client-side expiry check cannot see. Only a response from the
// server clears the session: a network error (status 0) must not log out an
// offline user.
export async function refreshSession(): Promise<void> {
  const record = pb.authStore.record;
  if (!pb.authStore.isValid || !record) return;
  try {
    await pb.collection(record.collectionName).authRefresh({ requestKey: null });
  } catch (err) {
    if (err instanceof ClientResponseError && err.status !== 0) {
      pb.authStore.clear();
    }
  }
}

export function logout(): void {
  pb.authStore.clear();
}
