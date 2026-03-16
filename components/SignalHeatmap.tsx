'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Signal } from '@/lib/data/getSignals'

type Props = {
  isDark: boolean
  onCityClick: (city: string) => void
}

type CityStats = {
  city: string
  count: number
  avgScore: number
}

export default function SignalHeatmap({ isDark, onCityClick }: Props) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/signals?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { signals: Signal[] }) => setSignals(data.signals))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cityStats = useMemo<CityStats[]>(() => {
    const map: Record<string, { total: number; count: number }> = {}
    for (const s of signals) {
      if (!map[s.city]) map[s.city] = { total: 0, count: 0 }
      map[s.city].total += s.opportunity_score ?? 0
      map[s.city].count += 1
    }
    return Object.entries(map)
      .map(([city, { total, count }]) => ({ city, count, avgScore: Math.round(total / count) }))
      .sort((a, b) => b.avgScore - a.avgScore)
  }, [signals])

  if (loading || cityStats.length === 0) return null

  const cardCls = (avg: number) =>
    avg >= 75
      ? isDark
        ? 'bg-green-900/40 border-green-700 hover:border-green-500 hover:bg-green-900/60'
        : 'bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-100'
      : avg >= 60
      ? isDark
        ? 'bg-yellow-900/30 border-yellow-700 hover:border-yellow-500'
        : 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:bg-yellow-100'
      : isDark
      ? 'bg-red-900/30 border-red-800 hover:border-red-600'
      : 'bg-red-50 border-red-200 hover:border-red-300 hover:bg-red-100'

  const scoreCls = (avg: number) =>
    avg >= 75
      ? isDark ? 'text-green-400' : 'text-green-700'
      : avg >= 60
      ? isDark ? 'text-yellow-400' : 'text-yellow-700'
      : isDark ? 'text-red-400'   : 'text-red-600'

  return (
    <div className={`rounded-xl border mb-5 overflow-hidden ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Signal Heatmap
          </h2>
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            avg score by city — click to filter
          </span>
        </div>
        <div className={`flex items-center gap-3 text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> ≥75
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> ≥60
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &lt;60
          </span>
        </div>
      </div>

      {/* City grid */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {cityStats.map(({ city, count, avgScore }) => (
            <button
              key={city}
              onClick={() => onCityClick(city)}
              className={`rounded-lg border px-3 py-3 text-left transition-all duration-150 hover:-translate-y-0.5 ${cardCls(avgScore)}`}
            >
              <div className={`text-xs font-bold mb-1.5 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {city}
              </div>
              <div className={`text-xl font-black leading-none ${scoreCls(avgScore)}`}>
                {avgScore}
              </div>
              <div className={`text-[10px] mt-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {count} signals
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
