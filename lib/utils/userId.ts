/**
 * Returns a stable, anonymous user ID for the current browser session.
 * Persists across page loads via localStorage under 'pshq-user-id'.
 * When real authentication is wired up, replace this with your auth
 * provider's userId and the rest of the workspace system will follow.
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  try {
    let id = localStorage.getItem('pshq-user-id')
    if (!id) {
      // Generate a random stable ID: "u-<8 random chars>-<base36 timestamp>"
      const rand = Math.random().toString(36).slice(2, 10)
      const ts   = Date.now().toString(36)
      id = `u-${rand}-${ts}`
      localStorage.setItem('pshq-user-id', id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}

/** Compound key used for per-user, per-property storage. */
export function workspaceKey(userId: string, propertyId: string): string {
  return `${userId}::${propertyId}`
}
