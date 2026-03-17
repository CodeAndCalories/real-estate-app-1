/**
 * Browser-local authentication layer.
 *
 * ⚠️  This is a demo-quality, localStorage-only implementation.
 * The password is hashed with a simple FNV-1a-style function — NOT
 * cryptographically safe. Replace with a real auth provider (NextAuth,
 * Supabase, Clerk, etc.) before going to production.
 *
 * Storage keys:
 *   pshq-users   — Record<email, StoredUser>
 *   pshq-session — AuthUser (the current signed-in user)
 */

export type AuthUser = {
  email: string
  createdAt: string
}

type StoredUser = AuthUser & { passwordHash: string }

const USERS_KEY   = 'pshq-users'
const SESSION_KEY = 'pshq-session'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Deterministic FNV-1a-ish hash — demo only, not secure. */
function hashPassword(password: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

function readUsers(): Record<string, StoredUser> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {}
  } catch {
    return {}
  }
}

function writeUsers(users: Record<string, StoredUser>) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)) } catch { /* ignore */ }
}

// ── Session ───────────────────────────────────────────────────────────────────

export function getSession(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function setSession(user: AuthUser) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)) } catch { /* ignore */ }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
}

// ── Auth operations ───────────────────────────────────────────────────────────

export type AuthResult =
  | { ok: true;  user: AuthUser }
  | { ok: false; error: string }

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function signUp(email: string, password: string): AuthResult {
  const key = email.toLowerCase().trim()

  if (!key || !password)
    return { ok: false, error: 'Email and password are required.' }
  if (!validateEmail(key))
    return { ok: false, error: 'Please enter a valid email address.' }
  if (password.length < 6)
    return { ok: false, error: 'Password must be at least 6 characters.' }

  const users = readUsers()
  if (users[key])
    return { ok: false, error: 'An account with this email already exists.' }

  const user: AuthUser = { email: key, createdAt: new Date().toISOString() }
  users[key] = { ...user, passwordHash: hashPassword(password) }
  writeUsers(users)
  setSession(user)
  return { ok: true, user }
}

export function logIn(email: string, password: string): AuthResult {
  const key = email.toLowerCase().trim()

  if (!key || !password)
    return { ok: false, error: 'Email and password are required.' }

  const users = readUsers()
  const stored = users[key]
  if (!stored)
    return { ok: false, error: 'No account found with this email.' }
  if (stored.passwordHash !== hashPassword(password))
    return { ok: false, error: 'Incorrect password. Please try again.' }

  const user: AuthUser = { email: stored.email, createdAt: stored.createdAt }
  setSession(user)
  return { ok: true, user }
}

export function logOut() {
  clearSession()
}
