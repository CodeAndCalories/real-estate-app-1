'use client'

import { useState, useEffect } from 'react'
import type { Signal } from '@/lib/data/getSignals'
import { useFavorites } from '@/lib/hooks/useFavorites'

type Props = {
  isDark: boolean
}

function getFreshnessDays(address: string): number {
  const hash = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return (hash % 7) + 1
}

export default function DashboardSummary({ isDark }: Props) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const { favorites } = useFavorites()

  useEffect(() => {
    fetch('/api/signals?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { signals: Signal[] }) => setSignals(data.signals))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const signalsToday = signals.filter((s) => getFreshnessDays(s.address) <= 2).length
  const hotDeals = signals.filter((s) => (s.opportunity_score ?? 0) >= 80).length
  const marketsActive = new Set(signals.map((s) => s.city)).size
  const favoritesCount = favorites.length

  const stats = [
    {
      label: 'Signals Today',
      value: loading ? '—' : signalsToday.toString(),
      icon: '🔥',
      color: isDark
        ? 'bg-orange-900/30 border-orange-700 text-orange-400'
        : 'bg-orange-50 border-orange-200 text-orange-600',
      valueColor: isDark ? 'text-orange-300' : 'text-orange-700',
    },
    {
      label: 'Hot Deals',
      value: loading ? '—' : hotDeals.toString(),
      icon: '⚡',
      color: isDark
        ? 'bg-green-900/30 border-green-700 text-green-400'
        : 'bg-green-50 border-green-200 text-green-600',
      valueColor: isDark ? 'text-green-300' : 'text-green-700',
    },
    {
      label: 'Markets Active',
      value: loading ? '—' : marketsActive.toString(),
      icon: '📍',
      color: isDark
        ? 'bg-blue-900/30 border-blue-700 text-blue-400'
        : 'bg-blue-50 border-blue-200 text-blue-600',
      valueColor: isDark ? 'text-blue-300' : 'text-blue-700',
    },
    {
      label: 'Favorites',
      value: favoritesCount.toString(),
      icon: '⭐',
      color: isDark
        ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400'
        : 'bg-yellow-50 border-yellow-200 text-yellow-600',
      valueColor: isDark ? 'text-yellow-300' : 'text-yellow-700',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl border px-4 py-4 flex items-center gap-3 ${stat.color}`}
        >
          <span className="text-2xl leading-none flex-shrink-0">{stat.icon}</span>
          <div className="min-w-0">
            <div className={`text-2xl font-black leading-none ${stat.valueColor}`}>
              {stat.value}
            </div>
            <div className={`text-xs mt-1 font-medium truncate ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {stat.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
