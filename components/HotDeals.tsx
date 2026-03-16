'use client'

import { useState, useEffect } from 'react'
import type { Signal } from '@/lib/data/getSignals'

type Props = {
  isDark: boolean
}

export default function HotDeals({ isDark }: Props) {
  const [deals, setDeals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/signals?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { signals: Signal[] }) => {
        const hot = data.signals
          .filter((s) => (s.opportunity_score ?? 0) >= 80)
          .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0))
          .slice(0, 5)
        setDeals(hot)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || deals.length === 0) return null

  const leadColor = (type: string) =>
    type === 'Pre-Foreclosure'
      ? isDark ? 'text-red-400' : 'text-red-600'
      : type === 'Expired Listing'
      ? isDark ? 'text-yellow-400' : 'text-yellow-600'
      : isDark ? 'text-green-400' : 'text-green-600'

  const scoreBg = (score: number) =>
    score >= 80
      ? 'bg-green-500 text-white'
      : score >= 60
      ? 'bg-yellow-400 text-yellow-900'
      : isDark ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-700'

  return (
    <div className={`rounded-xl border mb-6 overflow-hidden ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Hot Deals
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
          }`}>
            Score ≥ 80
          </span>
        </div>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Top {deals.length} opportunities right now
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
              <th className="text-right px-5 py-2.5">Score</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((s, i) => (
              <tr
                key={`${s.address}||${s.city}`}
                className={`border-b transition-colors ${
                  isDark
                    ? 'border-gray-700/50 hover:bg-gray-700/40'
                    : 'border-gray-50 hover:bg-blue-50/60'
                }`}
              >
                <td className={`px-5 py-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                      {i + 1}
                    </span>
                    <a
                      href={`/property/${s.id ?? encodeURIComponent(s.address)}`}
                      className={`hover:underline underline-offset-2 ${
                        isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'
                      }`}
                    >
                      {s.address}
                    </a>
                  </div>
                </td>
                <td className={`px-3 py-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {s.city}
                </td>
                <td className={`px-3 py-3 text-xs font-semibold ${leadColor(s.lead_type)}`}>
                  {s.lead_type}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${scoreBg(s.opportunity_score ?? 0)}`}>
                    {s.opportunity_score ?? 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
