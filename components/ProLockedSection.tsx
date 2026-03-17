'use client'

/**
 * ProLockedSection — blurs its children for free users and shows an upgrade prompt.
 * Plan is checked via Supabase Auth + /api/pro-status on mount.
 * Renders a skeleton placeholder until the check completes.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { useProStatus } from '@/lib/hooks/useProStatus'

type Props = {
  children: React.ReactNode
  /** Text shown inside the lock overlay. Defaults to "Unlock with Pro" */
  label?: string
  /** Approximate height used for the loading skeleton. Defaults to 120 */
  minHeight?: number
}

export default function ProLockedSection({
  children,
  label = 'Unlock with Pro',
  minHeight = 120,
}: Props) {
  const [email, setEmail] = useState<string | null | undefined>(undefined)

  // Resolve the Supabase session email once on mount
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setEmail(session?.user?.email ?? null)
    })
  }, [])

  const { isPro, loading } = useProStatus(email)

  // Skeleton while resolving session + pro status
  if (email === undefined || loading) {
    return (
      <div
        className="rounded-xl bg-gray-100 border border-gray-200 animate-pulse"
        style={{ minHeight }}
      />
    )
  }

  // Pro user — render children normally
  if (isPro) return <>{children}</>

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
          <p className="text-xs text-gray-400 text-center mt-1">New high-score deals added daily</p>
        </div>
      </div>
    </div>
  )
}
