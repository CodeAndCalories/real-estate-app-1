'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBestDeal } from '@/lib/utils/getBestDeal'
import type { Signal } from '@/lib/data/getSignals'

type Props = {
  isDark: boolean
}

function leadTypeColor(type: string): string {
  if (type === 'Pre-Foreclosure') return 'bg-red-100 text-red-700 border-red-200'
  if (type === 'Expired Listing') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  return 'bg-emerald-100 text-emerald-700 border-emerald-200'
}

export default function BestDealHighlight({ isDark }: Props) {
  const router = useRouter()
  const [deal, setDeal] = useState<Signal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/signals?limit=500')
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        if (!cancelled) setDeal(getBestDeal(data.signals ?? []))
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleClick = () => {
    if (!deal) return
    router.push(`/property/${encodeURIComponent(deal.id ?? deal.address)}`)
  }

  // Loading skeleton
  if (loading) {
    return (
      <section className={`py-12 px-4 sm:px-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="max-w-[1100px] mx-auto">
          <div className={`rounded-2xl border p-6 animate-pulse ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <div className={`h-4 w-32 rounded mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-7 w-64 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-4 w-48 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        </div>
      </section>
    )
  }

  if (!deal) return null

  const score = deal.opportunity_score ?? 0
  const equity =
    deal.estimated_value > 0 && deal.loan_balance_estimate != null
      ? deal.estimated_value - deal.loan_balance_estimate
      : null

  return (
    <section className={`py-14 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-[1100px] mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔥</span>
          <h2 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
            Today&apos;s Best Deal
          </h2>
        </div>

        {/* Card */}
        <button
          onClick={handleClick}
          className={`w-full text-left rounded-2xl border p-5 sm:p-6 transition-all group ${
            isDark
              ? 'bg-gray-800 border-gray-700 hover:border-orange-600 hover:bg-gray-750'
              : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-100'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left — address + meta */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  🔥 Highest Score Today
                </span>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${leadTypeColor(deal.lead_type)}`}>
                  {deal.lead_type}
                </span>
              </div>

              <h3 className={`text-lg sm:text-xl font-black leading-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {deal.address}
              </h3>
              <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {deal.city}, {deal.zip}
              </p>

              {/* Stats row */}
              <div className={`flex flex-wrap gap-4 mt-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {deal.estimated_value > 0 && (
                  <span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ${deal.estimated_value.toLocaleString()}
                    </span>{' '}
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>est. value</span>
                  </span>
                )}
                {equity != null && equity > 0 && (
                  <span>
                    <span className="font-semibold text-green-500">
                      ${equity.toLocaleString()}
                    </span>{' '}
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>est. equity</span>
                  </span>
                )}
                {deal.days_on_market != null && (
                  <span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {deal.days_on_market}d
                    </span>{' '}
                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>on market</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right — score + CTA */}
            <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 flex-shrink-0">
              {/* Score circle */}
              <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2 ${
                score >= 80
                  ? isDark ? 'bg-green-900/40 border-green-600' : 'bg-green-50 border-green-300'
                  : isDark ? 'bg-yellow-900/40 border-yellow-600' : 'bg-yellow-50 border-yellow-300'
              }`}>
                <span className={`text-2xl font-black leading-none ${
                  score >= 80
                    ? isDark ? 'text-green-400' : 'text-green-700'
                    : isDark ? 'text-yellow-400' : 'text-yellow-700'
                }`}>{score}</span>
                <span className={`text-[9px] font-bold uppercase ${
                  score >= 80
                    ? isDark ? 'text-green-500' : 'text-green-600'
                    : isDark ? 'text-yellow-500' : 'text-yellow-600'
                }`}>score</span>
              </div>

              {/* CTA */}
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:gap-2.5 ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`}>
                View deal <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </div>
        </button>
      </div>
    </section>
  )
}
