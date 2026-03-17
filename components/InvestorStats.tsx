'use client'

import { useState, useEffect } from 'react'

type Signal = {
  city: string
  opportunity_score: number | null
  estimated_value: number
  loan_balance_estimate: number | null
}

type Stats = {
  total: number
  markets: number
  avgScore: number
  highEquityDeals: number
}

function computeStats(signals: Signal[]): Stats {
  if (signals.length === 0) return { total: 0, markets: 0, avgScore: 0, highEquityDeals: 0 }

  const cities = new Set(signals.map((s) => s.city))
  const totalScore = signals.reduce((sum, s) => sum + (s.opportunity_score ?? 0), 0)
  const highEquity = signals.filter((s) => {
    if (s.estimated_value <= 0 || s.loan_balance_estimate == null) return false
    const equity = s.estimated_value - s.loan_balance_estimate
    return equity / s.estimated_value >= 0.30
  }).length

  return {
    total: signals.length,
    markets: cities.size,
    avgScore: Math.round(totalScore / signals.length),
    highEquityDeals: highEquity,
  }
}

type Props = {
  isDark: boolean
}

type StatCardProps = {
  label: string
  value: string | number
  icon: string
  accent: string
  isDark: boolean
}

function StatCard({ label, value, icon, accent, isDark }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 flex items-center gap-3 ${
        isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <span className={`text-2xl leading-none flex-shrink-0 ${accent}`}>{icon}</span>
      <div>
        <div className={`text-xl font-black leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </div>
        <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {label}
        </div>
      </div>
    </div>
  )
}

export default function InvestorStats({ isDark }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/signals?limit=500')
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        if (!cancelled) {
          setStats(computeStats(data.signals ?? []))
        }
      } catch {
        if (!cancelled) setStats({ total: 0, markets: 0, avgScore: 0, highEquityDeals: 0 })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const CARDS = stats
    ? [
        { label: 'Signals Analyzed Today', value: stats.total.toLocaleString(), icon: '📊', accent: 'text-blue-500' },
        { label: 'Markets Tracked', value: stats.markets, icon: '🏙️', accent: 'text-indigo-500' },
        { label: 'Average Deal Score', value: stats.avgScore, icon: '⭐', accent: 'text-yellow-500' },
        { label: 'High Equity Deals', value: stats.highEquityDeals, icon: '💰', accent: 'text-green-500' },
      ]
    : []

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`rounded-xl border px-4 py-3.5 animate-pulse h-16 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-5">
      <p className={`text-xs font-bold uppercase tracking-widest mb-2.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Investor Stats
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CARDS.map((c) => (
          <StatCard key={c.label} isDark={isDark} {...c} />
        ))}
      </div>
    </div>
  )
}
