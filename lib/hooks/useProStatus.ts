'use client'

/**
 * useProStatus
 *
 * Checks /api/pro-status for the given email and returns whether they are Pro.
 * Email should come from the Supabase session via useAuth().
 *
 * Usage:
 *   const { user } = useAuth()
 *   const { isPro, loading } = useProStatus(user?.email)
 */

import { useState, useEffect } from 'react'

export function useProStatus(email: string | null | undefined) {
  const [isPro, setIsPro]     = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!email) {
      setIsPro(false)
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
        if (!cancelled) setIsPro(data.isPro)
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
