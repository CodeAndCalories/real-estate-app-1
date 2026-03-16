'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Signal } from '@/lib/data/getSignals'
import type { Property } from '@/app/finder/page'

type Props = {
  isDark: boolean
  onRowClick: (p: Property) => void
}

// Mirrors the freshness logic in ResultsTable
function getFreshnessDays(address: string): number {
  const hash = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return (hash % 7) + 1
}

function firstExplanation(s: Signal): string {
  if ((s.price_drop_percent ?? 0) > 10) return 'Recent price drop signals a motivated seller.'
  if ((s.days_in_default ?? 0) > 60)    return 'Owner in default — distressed sale potential.'
  if ((s.days_on_market ?? 0) > 90)     return 'Extended days on market — seller may be flexible.'
  if (
    s.loan_balance_estimate != null &&
    s.estimated_value > 0 &&
    s.loan_balance_estimate < s.estimated_value * 0.6
  ) return 'High equity relative to loan balance.'
  if (
    s.rent_estimate != null &&
    s.estimated_value > 0 &&
    s.rent_estimate >= s.estimated_value * 0.01
  ) return 'Strong rental yield potential.'
  return 'Multiple positive indicators detected.'
}

export default function DailyOpportunities({ isDark, onRowClick }: Props) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/signals?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { signals: Signal[] }) => setSignals(data.signals))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const opportunities = useMemo(() => {
    return signals
      .filter((s) => getFreshnessDays(s.address) <= 2 || (s.opportunity_score ?? 0) >= 80)
      .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0))
      .slice(0, 10)
  }, [signals])

  if (loading || opportunities.length === 0) return null

  const leadColor = (type: string) =>
    type === 'Pre-Foreclosure'
      ? isDark ? 'text-red-400'    : 'text-red-600'
      : type === 'Expired Listing'
      ? isDark ? 'text-yellow-400' : 'text-yellow-600'
      : isDark ? 'text-green-400'  : 'text-green-600'

  const scoreBg = (score: number) =>
    score >= 80 ? 'bg-green-500 text-white' :
    score >= 60 ? 'bg-yellow-400 text-yellow-900' :
    isDark      ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-700'

  return (
    <div className={`rounded-xl border mb-5 overflow-hidden ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Today's Opportunities
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
          }`}>
            {opportunities.length}
          </span>
        </div>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Fresh listings + score ≥ 80
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase tracking-wide ${
              isDark ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'
            }`}>
              <th className="text-left px-5 py-2.5">Address</th>
              <th className="text-left px-3 py-2.5">City</th>
              <th className="text-left px-3 py-2.5">Lead Type</th>
              <th className="text-left px-3 py-2.5 hidden lg:table-cell">Signal</th>
              <th className="text-center px-3 py-2.5">Score</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {opportunities.map((s) => (
              <tr
                key={`${s.address}||${s.city}`}
                className={`border-b last:border-0 transition-colors ${
                  isDark ? 'border-gray-700/50 hover:bg-gray-700/40' : 'border-gray-50 hover:bg-blue-50/60'
                }`}
              >
                <td className={`px-5 py-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {s.address}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {s.city}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-xs font-semibold ${leadColor(s.lead_type)}`}>
                  {s.lead_type}
                </td>
                <td className={`px-3 py-3 text-xs hidden lg:table-cell ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {firstExplanation(s)}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${scoreBg(s.opportunity_score ?? 0)}`}>
                    {s.opportunity_score ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => onRowClick(s as unknown as Property)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      isDark
                        ? 'border-blue-700 text-blue-400 hover:bg-blue-900/30'
                        : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
