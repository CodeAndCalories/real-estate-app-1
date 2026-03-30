'use client'

/**
 * /upgrade — Auth-aware Stripe redirect.
 *
 * 1. If no Supabase session → redirect to /login
 * 2. If session exists → create a Stripe Checkout Session (with 30-day trial)
 *    via /api/stripe/checkout, then redirect to the returned URL.
 *
 * All other CTAs in the app link to /upgrade (this page).
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'
import posthog from 'posthog-js'

export default function UpgradePage() {
  const router = useRouter()
  const { user, loaded } = useAuth()
  const { isPro, loading: proLoading } = useProStatus(user?.email)

  useEffect(() => {
    // Wait until both auth and pro status have resolved
    if (!loaded || proLoading) return

    // Pro users have nothing to upgrade — send them to the app
    if (user && isPro) {
      router.replace('/finder')
      return
    }

    supabaseBrowser.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.email) {
        router.replace('/login')
        return
      }

      posthog.capture('upgrade_clicked')

      try {
        const res = await fetch('/api/stripe/checkout', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: session.user.email }),
        })
        const data = (await res.json()) as { url?: string; error?: string }
        if (data.url) {
          window.location.href = data.url
        } else {
          // Fallback: send to pricing page if checkout creation fails
          router.replace('/pricing')
        }
      } catch {
        router.replace('/pricing')
      }
    })
  }, [router, loaded, proLoading, user, isPro])

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-10 h-10 rounded-full border-4 border-blue-900 border-t-blue-500 animate-spin mx-auto mb-6" />
        <h1 className="text-xl font-bold text-white mb-2">Start your free 30-day trial</h1>
        <p className="text-sm text-gray-400 mb-1">
          Start free — <span className="text-white font-semibold">$0 today</span>, then $39/mo after 30 days.
        </p>
        <p className="text-xs text-gray-600">No charge for 30 days. Cancel anytime.</p>
      </div>
    </div>
  )
}
