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

export async function login(email: string, password: string): Promise<void> {
  await pb.collection("_superusers").authWithPassword(email, password);
}

export function logout(): void {
  pb.authStore.clear();
}
