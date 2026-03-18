'use client'

import { useState, useEffect } from 'react'
import { useDealPipeline } from '@/lib/hooks/useDealPipeline'
import { useSavedDeals } from '@/lib/hooks/useSavedDeals'

type Props = {
  isDark: boolean
  savedAnalysesCount?: number
}

type StatItem = {
  label: string
  value: number
  icon: string
  accent: {
    card: string
    value: string
    iconBg: string
  }
}

export default function PortfolioSummary({ isDark, savedAnalysesCount }: Props) {
  const { counts }      = useDealPipeline()
  const { deals }       = useSavedDeals()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — all counts come from localStorage
  useEffect(() => { setMounted(true) }, [])

  const stats: StatItem[] = [
    {
      label: 'Saved Deals',
      value: savedAnalysesCount ?? deals.length,
      icon: '⭐',
      accent: {
        card:    isDark ? 'bg-yellow-900/20 border-yellow-700/50'  : 'bg-yellow-50 border-yellow-200',
        value:   isDark ? 'text-yellow-300' : 'text-yellow-700',
        iconBg:  isDark ? 'bg-yellow-800/40' : 'bg-yellow-100',
      },
    },
    {
      label: 'Contacted',
      value: counts.contacted,
      icon: '📞',
      accent: {
        card:    isDark ? 'bg-blue-900/20 border-blue-700/50'   : 'bg-blue-50 border-blue-200',
        value:   isDark ? 'text-blue-300'   : 'text-blue-700',
        iconBg:  isDark ? 'bg-blue-800/40'  : 'bg-blue-100',
      },
    },
    {
      label: 'Negotiating',
      value: counts.negotiating,
      icon: '🤝',
      accent: {
        card:    isDark ? 'bg-orange-900/20 border-orange-700/50'  : 'bg-orange-50 border-orange-200',
        value:   isDark ? 'text-orange-300'  : 'text-orange-700',
        iconBg:  isDark ? 'bg-orange-800/40' : 'bg-orange-100',
      },
    },
    {
      label: 'Closed Deals',
      value: counts.closed,
      icon: '🏆',
      accent: {
        card:    isDark ? 'bg-green-900/20 border-green-700/50'   : 'bg-green-50 border-green-200',
        value:   isDark ? 'text-green-300'   : 'text-green-700',
        iconBg:  isDark ? 'bg-green-800/40'  : 'bg-green-100',
      },
    },
  ]

  // Total active deals (all non-closed stages)
  const activeTotal =
    counts.new + counts.contacted + counts.negotiating + counts.under_contract

  return (
    <div className={`rounded-xl border mb-5 overflow-hidden ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${
        isDark ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-base">📁</span>
          <h2 className={`text-sm font-bold uppercase tracking-wide ${isDark ? 'text-white' : 'text-gray-700'}`}>
            Portfolio Summary
          </h2>
        </div>
        {mounted && activeTotal > 0 && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isDark ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            {activeTotal} active deal{activeTotal !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Stat grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl border px-4 py-3.5 flex items-center gap-3 transition-colors ${stat.accent.card}`}
            >
              {/* Icon circle */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${stat.accent.iconBg}`}>
                {stat.icon}
              </div>

              {/* Text */}
              <div className="min-w-0">
                <div className={`text-2xl font-black leading-none ${stat.accent.value}`}>
                  {mounted ? stat.value : '—'}
                </div>
                <div className={`text-xs font-medium mt-0.5 truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Under contract row — shown only if non-zero, as a secondary stat */}
        {mounted && counts.under_contract > 0 && (
          <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
            isDark ? 'bg-indigo-900/20 border-indigo-700/50 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
          }`}>
            <span>📜</span>
            <span>
              {counts.under_contract} deal{counts.under_contract !== 1 ? 's' : ''} currently under contract
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
