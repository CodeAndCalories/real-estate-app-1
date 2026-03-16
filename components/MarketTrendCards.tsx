'use client'

import { useState, useEffect } from 'react'
import type { Signal } from '@/lib/data/getSignals'

type CityStats = {
  city: string
  avgScore: number
  totalSignals: number
  topScore: number
}

type Props = {
  isDark: boolean
}

function colorForScore(score: number, isDark: boolean): string {
  if (score >= 75) return isDark
    ? 'bg-green-900/30 border-green-700'
    : 'bg-green-50 border-green-200'
  if (score >= 60) return isDark
    ? 'bg-yellow-900/30 border-yellow-700'
    : 'bg-yellow-50 border-yellow-200'
  return isDark
    ? 'bg-red-900/30 border-red-700'
    : 'bg-red-50 border-red-200'
}

function textColorForScore(score: number, isDark: boolean): string {
  if (score >= 75) return isDark ? 'text-green-400' : 'text-green-700'
  if (score >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-700'
  return isDark ? 'text-red-400' : 'text-red-600'
}

export default function MarketTrendCards({ isDark }: Props) {
  const [stats, setStats]     = useState<CityStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/signals?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { signals: Signal[] }) => {
        const byCity: Record<string, { scores: number[]; top: number }> = {}
        for (const s of data.signals) {
          const score = s.opportunity_score ?? 0
          if (!byCity[s.city]) byCity[s.city] = { scores: [], top: 0 }
          byCity[s.city].scores.push(score)
          if (score > byCity[s.city].top) byCity[s.city].top = score
        }
        const result: CityStats[] = Object.entries(byCity)
          .map(([city, d]) => ({
            city,
            avgScore:     Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
            totalSignals: d.scores.length,
            topScore:     d.top,
          }))
          .sort((a, b) => b.avgScore - a.avgScore)
        setStats(result)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const textPrimary = isDark ? 'text-white'     : 'text-gray-900'
  const textMuted   = isDark ? 'text-gray-500'  : 'text-gray-400'

  if (loading) return (
    <div className={`text-xs text-center py-4 ${textMuted}`}>Loading market trends…</div>
  )

  if (stats.length === 0) return null

  return (
    <div className="mb-5">
      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textMuted}`}>
        Market Trends by City
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.city}
            className={`rounded-xl border px-4 py-4 ${colorForScore(s.avgScore, isDark)}`}
          >
            <p className={`text-sm font-bold leading-tight mb-2 ${textPrimary}`}>{s.city}</p>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black leading-none ${textColorForScore(s.avgScore, isDark)}`}>
                  {s.avgScore}
                </span>
                <span className={`text-[10px] ${textMuted}`}>avg score</span>
              </div>
              <div className={`text-xs ${textMuted}`}>
                {s.totalSignals.toLocaleString()} signals
              </div>
              <div className={`text-xs font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                Top deal: {s.topScore}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
