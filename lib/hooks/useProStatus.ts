'use client'

/**
 * useProStatus
 *
 * Checks /api/pro-status for the current user's email and, if they are Pro,
 * stamps { plan: "pro" } onto:
 *   1. Their record in pshq-users (the users array in localStorage)
 *   2. Their active session in pshq-session
 *
 * Call this hook once inside a component that mounts after login
 * (e.g. the Finder layout or a post-auth wrapper).
 *
 * Usage:
 *   const { isPro, loading } = useProStatus(userEmail)
 */

import { useState, useEffect } from 'react'

type StoredUser = {
  email: string
  password: string
  createdAt: number
  plan?: 'pro' | 'free'
}

type Session = {
  email: string
  createdAt: string
  plan?: 'pro' | 'free'
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem('pshq-users')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : Object.values(parsed)
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem('pshq-users', JSON.stringify(users))
  } catch { /* ignore */ }
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem('pshq-session')
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function writeSession(session: Session): void {
  try {
    localStorage.setItem('pshq-session', JSON.stringify(session))
  } catch { /* ignore */ }
}

/** Stamps plan: "pro" into pshq-users + pshq-session for the given email. */
function grantLocalPro(email: string): void {
  const normalised = email.toLowerCase().trim()

  // Update the user record in pshq-users
  const users = readUsers()
  const updated = users.map((u) =>
    u.email === normalised ? { ...u, plan: 'pro' as const } : u,
  )
  writeUsers(updated)

  // Update the active session
  const session = readSession()
  if (session && session.email === normalised) {
    writeSession({ ...session, plan: 'pro' })
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProStatus(email: string | null | undefined) {
  const [isPro, setIsPro]     = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!email) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function check() {
      try {
        const res = await fetch(
          `/api/pro-status?email=${encodeURIComponent(email as string)}`,
        )
        if (!res.ok) throw new Error('Network error')
        const data = (await res.json()) as { isPro: boolean }

        if (cancelled) return

        if (data.isPro) {
          grantLocalPro(email as string)
          setIsPro(true)
        }
      } catch {
        // Silent fail — pro check is non-critical
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    check()
    return () => { cancelled = true }
  }, [email])

  return { isPro, loading }
}

/**
 * Standalone helper — reads plan from the active pshq-session.
 * Useful for components that need a synchronous pro check.
 */
export function getLocalPlan(): 'pro' | 'free' {
  if (typeof window === 'undefined') return 'free'
  try {
    const raw = localStorage.getItem('pshq-session')
    if (!raw) return 'free'
    const session = JSON.parse(raw) as Session
    return session.plan === 'pro' ? 'pro' : 'free'
  } catch {
    return 'free'
  }
}
