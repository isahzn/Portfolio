/**
 * Shared fetch helper for admin dashboard components (client).
 *
 * - Throws AuthError on 401 so sections can bounce to /admin/login.
 * - Parses JSON responses and surfaces server error messages.
 * - All state updates happen in the caller's promise callbacks.
 */
export class AuthError extends Error {
  constructor() {
    super("Unauthorized.");
    this.name = "AuthError";
  }
}

export async function adminFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (response.status === 401) throw new AuthError();
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Request failed.");
  }
  return (await response.json()) as T;
}

/** Shared error handling for load effects: auth bounce or an error message. */
export function handleLoadError(error: unknown, onError: (message: string) => void): void {
  if (error instanceof AuthError) {
    window.location.replace("/admin/login");
    return;
  }
  onError(error instanceof Error ? error.message : "Something went wrong.");
}
