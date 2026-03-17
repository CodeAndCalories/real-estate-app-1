'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getSession,
  setSession,
  clearSession,
  signUp,
  logIn,
  logOut as authLogOut,
} from '@/lib/utils/auth'
import type { AuthUser, AuthResult } from '@/lib/utils/auth'

export type { AuthUser }

export function useAuth() {
  const [user, setUser]     = useState<AuthUser | null>(null)
  const [loaded, setLoaded] = useState(false)

  // Read session from localStorage once on mount
  useEffect(() => {
    setUser(getSession())
    setLoaded(true)
  }, [])

  const login = useCallback((email: string, password: string): AuthResult => {
    const result = logIn(email, password)
    if (result.ok) setUser(result.user)
    return result
  }, [])

  const signup = useCallback((email: string, password: string): AuthResult => {
    const result = signUp(email, password)
    if (result.ok) setUser(result.user)
    return result
  }, [])

  const logout = useCallback(() => {
    authLogOut()
    setUser(null)
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
