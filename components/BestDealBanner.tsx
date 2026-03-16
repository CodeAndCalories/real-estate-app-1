'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Signal } from '@/lib/data/getSignals'
import { bestDealToday } from '@/lib/utils/bestDealToday'

type Props = {
  isDark: boolean
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Hot Lead'
  if (score >= 60) return 'Strong Opportunity'
  if (score >= 40) return 'Moderate'
  return 'Low Priority'
}

export default function BestDealBanner({ isDark }: Props) {
  const [deal, setDeal]       = useState<Signal | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/signals?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { signals: Signal[] }) => {
        setDeal(bestDealToday(data.signals))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleClick = () => {
    if (!deal) return
    const id = encodeURIComponent(deal.id ?? deal.address)
    router.push(`/property/${id}`)
  }

  if (loading) {
    return (
      <div className={`rounded-xl border px-5 py-4 mb-5 animate-pulse ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-orange-50 border-orange-200'
      }`}>
        <div className={`h-4 w-48 rounded ${isDark ? 'bg-gray-700' : 'bg-orange-100'}`} />
      </div>
    )
  }

  if (!deal) return null

  const score = deal.opportunity_score ?? 0

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left rounded-xl border px-5 py-4 mb-5 transition-all group ${
        isDark
          ? 'bg-orange-900/20 border-orange-700 hover:bg-orange-900/30 hover:border-orange-600'
          : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:border-orange-400 hover:shadow-md hover:shadow-orange-100'
      }`}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left — label + property */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl leading-none flex-shrink-0">🔥</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`text-xs font-black uppercase tracking-widest ${
                isDark ? 'text-orange-400' : 'text-orange-600'
              }`}>
                Best Deal Today
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-orange-900/40 border-orange-700 text-orange-400'
                  : 'bg-orange-100 border-orange-300 text-orange-700'
              }`}>
                Updated daily
              </span>
            </div>
            <p className={`text-sm font-bold truncate leading-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {deal.address}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {deal.city} · {deal.lead_type}
            </p>
          </div>
        </div>

        {/* Right — score + arrow */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <div className={`text-2xl font-black leading-none ${
              score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-gray-500'
            }`}>
              {score}
            </div>
            <div className={`text-[10px] font-semibold uppercase tracking-wide mt-0.5 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {getScoreLabel(score)}
            </div>
          </div>
          <svg
            className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}
