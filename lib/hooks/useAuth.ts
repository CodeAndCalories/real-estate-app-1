'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { AuthUser, AuthResult } from '@/lib/utils/auth'

export type { AuthUser }

export function useAuth() {
  const [user, setUser]     = useState<AuthUser | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Read the initial session
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ email: session.user.email!, createdAt: session.user.created_at })
      }
      setLoaded(true)
    })

    // Stay in sync with auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        setUser(
          session?.user
            ? { email: session.user.email!, createdAt: session.user.created_at }
            : null,
        )
        setLoaded(true)
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return { ok: false, error: error.message }
      const u = data.user
      const authUser: AuthUser = { email: u.email!, createdAt: u.created_at }
      setUser(authUser)
      return { ok: true, user: authUser }
    },
    [],
  )

  const signup = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabaseBrowser.auth.signUp({ email, password })
      if (error) return { ok: false, error: error.message }
      const u = data.user
      if (!u) return { ok: false, error: 'Signup failed. Please try again.' }
      const authUser: AuthUser = { email: u.email!, createdAt: u.created_at }
      setUser(authUser)
      return { ok: true, user: authUser }
    },
    [],
  )

  const logout = useCallback(() => {
    setUser(null)
    supabaseBrowser.auth.signOut() // fire-and-forget — UI clears immediately
  }, [])

  return {
    user,
    loaded,
    isLoggedIn: !!user,
    login,
    signup,
    logout,
  }
}
