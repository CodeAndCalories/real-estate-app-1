'use client'

/**
 * /upgrade — Auth-aware Stripe redirect.
 *
 * 1. If no Supabase session → redirect to /login
 * 2. If session exists → redirect to Stripe checkout with email pre-filled
 *
 * All other CTAs in the app link to /upgrade (this page).
 * Only this file imports CHECKOUT_URL from lib/constants/checkout.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CHECKOUT_URL } from '@/lib/constants/checkout'
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

    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.email) {
        router.replace('/login')
        return
      }

      const url = `${CHECKOUT_URL}?prefilled_email=${encodeURIComponent(session.user.email)}`
      posthog.capture('upgrade_clicked')
      window.location.href = url
    })
  }, [router, loaded, proLoading, user, isPro])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-500">Taking you to checkout…</p>
      </div>
    </div>
  )
}
