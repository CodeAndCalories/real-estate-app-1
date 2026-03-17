'use client'

/**
 * /upgrade — Auth-aware Lemon Squeezy redirect.
 *
 * 1. If no pshq-session in localStorage → redirect to /login
 * 2. If session exists → redirect to Lemon checkout with email pre-filled:
 *    CHECKOUT_URL?checkout[email]=USER_EMAIL
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHECKOUT_URL } from '@/lib/constants/checkout'

type Session = { email: string }

function getSession(): Session | null {
  try {
    const raw = localStorage.getItem('pshq-session')
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export default function UpgradePage() {
  const router = useRouter()

  useEffect(() => {
    const session = getSession()

    if (!session?.email) {
      // Not logged in — send to login first
      router.replace('/login')
      return
    }

    // Pre-fill the checkout email so the user doesn't have to type it
    const url = `${CHECKOUT_URL}?checkout[email]=${encodeURIComponent(session.email)}`
    window.location.href = url
  }, [router])

  // Show a neutral loading screen while the redirect fires
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-500">Taking you to checkout…</p>
      </div>
    </div>
  )
}
