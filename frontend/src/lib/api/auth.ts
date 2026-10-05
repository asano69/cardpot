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

export async function login(email: string, password: string): Promise<void> {
  await pb.collection("_superusers").authWithPassword(email, password);
}

export function logout(): void {
  pb.authStore.clear();
}
