'use client'

import { useState, useEffect } from 'react'

type Signal = {
  city: string
  opportunity_score: number | null
}

type CityRow = {
  city: string
  count: number
  avgScore: number
  topScore: number
}

function buildLeaderboard(signals: Signal[]): CityRow[] {
  const map: Record<string, { scores: number[] }> = {}

  for (const s of signals) {
    if (!s.city) continue
    if (!map[s.city]) map[s.city] = { scores: [] }
    map[s.city].scores.push(s.opportunity_score ?? 0)
  }

  return Object.entries(map)
    .map(([city, { scores }]) => ({
      city,
      count: scores.length,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      topScore: Math.max(...scores),
    }))
    .sort((a, b) => b.count - a.count)
}

function medalIcon(rank: number): string {
  return rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`
}

type Props = {
  isDark: boolean
}

export default function MarketLeaderboard({ isDark }: Props) {
  const [rows, setRows] = useState<CityRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/signals?limit=500')
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        if (!cancelled) setRows(buildLeaderboard(data.signals ?? []))
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const card = isDark
    ? 'bg-gray-800 border border-gray-700 rounded-xl shadow-sm'
    : 'bg-white border border-gray-200 rounded-xl shadow-sm'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400'
  const divider = isDark ? 'border-gray-700' : 'border-gray-100'
  const barBg = isDark ? 'bg-gray-700' : 'bg-gray-100'

  const maxCount = rows[0]?.count ?? 1

  if (loading) {
    return (
      <div className={`${card} mb-5 p-4`}>
        <div className={`h-4 w-40 rounded animate-pulse mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`h-10 rounded animate-pulse mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`} />
        ))}
      </div>
    )
  }

  if (rows.length === 0) return null

  return (
    <div className={`${card} mb-5`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">🏆</span>
          <h2 className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>
            Top Markets Today
          </h2>
        </div>
        <span className={`text-xs ${textMuted}`}>by signal volume</span>
      </div>

      {/* Rows */}
      <div className="px-4 py-2">
        {rows.map((row, i) => (
          <div
            key={row.city}
            className={`flex items-center gap-3 py-2.5 border-b last:border-0 ${divider}`}
          >
            {/* Rank */}
            <span className="w-7 text-center text-sm flex-shrink-0 font-bold">
              {medalIcon(i)}
            </span>

            {/* City + bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-semibold ${textPrimary}`}>{row.city}</span>
                <span className={`text-xs font-medium ${textSecondary}`}>
                  {row.count} signal{row.count !== 1 ? 's' : ''}
                </span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${barBg}`}>
                <div
                  className={`h-full rounded-full ${
                    i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-blue-400' : i === 2 ? 'bg-blue-300' : 'bg-blue-200'
                  }`}
                  style={{ width: `${(row.count / maxCount) * 100}%` }}
                />
              </div>
            </div>

            {/* Avg score pill */}
            <div className="flex-shrink-0 text-right">
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  row.avgScore >= 75
                    ? isDark ? 'text-green-400 bg-green-900/30' : 'text-green-700 bg-green-50'
                    : row.avgScore >= 55
                    ? isDark ? 'text-yellow-400 bg-yellow-900/30' : 'text-yellow-700 bg-yellow-50'
                    : isDark ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100'
                }`}
              >
                avg {row.avgScore}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
