/**
 * Shared auth types for PropertySignalHQ.
 * Auth logic has been moved to lib/hooks/useAuth.ts (Supabase Auth).
 */

export type AuthUser = {
  email: string
  createdAt: string
}

export type AuthResult =
  | { ok: true;  user: AuthUser }
  | { ok: false; error: string }
