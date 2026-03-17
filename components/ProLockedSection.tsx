'use client'

/**
 * ProLockedSection — blurs its children for free users and shows an upgrade prompt.
 * Plan is read from localStorage (pshq-session / pshq-users) on mount.
 * Renders a skeleton placeholder until the plan check completes to prevent
 * layout shift and hydration mismatches.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Props = {
  children: React.ReactNode
  /** Text shown inside the lock overlay. Defaults to "Unlock with Pro" */
  label?: string
  /** Approximate height used for the loading skeleton. Defaults to 120 */
  minHeight?: number
}

function getPlan(): 'pro' | 'free' {
  try {
    const sessionRaw = localStorage.getItem('pshq-session')
    if (!sessionRaw) return 'free'
    const session = JSON.parse(sessionRaw) as { email?: string; plan?: string }
    if (session.plan === 'pro') return 'pro'
    const usersRaw = localStorage.getItem('pshq-users')
    if (!usersRaw || !session.email) return 'free'
    const users = JSON.parse(usersRaw) as Array<{ email?: string; plan?: string }>
    const match = users.find(
      (u) => u?.email?.toLowerCase() === session.email?.toLowerCase?.()
    )
    return match?.plan === 'pro' ? 'pro' : 'free'
  } catch {
    return 'free'
  }
}

export default function ProLockedSection({
  children,
  label = 'Unlock with Pro',
  minHeight = 120,
}: Props) {
  const [plan, setPlan] = useState<'pro' | 'free' | null>(null)

  useEffect(() => {
    setPlan(getPlan())
  }, [])

  // Skeleton while plan is being read from localStorage
  if (plan === null) {
    return (
      <div
        className="rounded-xl bg-gray-100 border border-gray-200 animate-pulse"
        style={{ minHeight }}
      />
    )
  }

  // Pro user — render children normally
  if (plan === 'pro') return <>{children}</>

  // Free user — blur children and show upgrade overlay
  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Blurred content — kept in DOM for layout, not interactive */}
      <div
        className="select-none pointer-events-none"
        style={{ filter: 'blur(4px)', userSelect: 'none' }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-2.5 bg-white rounded-2xl border border-gray-200 shadow-lg px-6 py-4">
          <span className="text-sm font-bold text-gray-700">🔒 {label}</span>
          <Link
            href="/upgrade"
            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-5 py-1.5 rounded-full transition-colors"
          >
            Upgrade to Pro →
          </Link>
        </div>
      </div>
    </div>
  )
}
