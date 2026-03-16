'use client'

import { useEffect, useState } from 'react'
import type { Signal } from '@/lib/data/getSignals'
import { useThemeMode } from '@/lib/hooks/useThemeMode'

type DailyDealsResponse = {
  date: string
  deals: Signal[]
}

function getFirstExplanation(s: Signal): string {
  if ((s.price_drop_percent ?? 0) > 7)
    return `Price dropped ${s.price_drop_percent}% — motivated seller`
  if ((s.days_on_market ?? 0) > 90)
    return `Listed for ${s.days_on_market} days — long market exposure`
  if (
    s.loan_balance_estimate !== null &&
    s.estimated_value > 0 &&
    s.loan_balance_estimate < s.estimated_value * 0.6
  )
    return 'High equity — loan balance well below market value'
  return 'Multiple strong investment signals detected'
}

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-green-100 text-green-800 border-green-300'
      : score >= 60
      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
      : 'bg-red-100 text-red-800 border-red-300'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${color}`}>
      {score}
    </span>
  )
}

export default function DailyDeals({ isDark }: { isDark: boolean }) {
  const [data, setData] = useState<DailyDealsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/daily-deals')
      .then((r) => r.json())
      .then((d: DailyDealsResponse) => setData(d))
      .catch(() => {/* silently ignore */})
      .finally(() => setLoading(false))
  }, [])

  const sectionBg = isDark
    ? 'bg-gray-950'
    : 'bg-gradient-to-b from-white to-slate-50'

  const cardBg = isDark
    ? 'bg-gray-900 border border-gray-700'
    : 'bg-white border border-gray-200'

  const rowBorder = isDark ? 'border-gray-800' : 'border-gray-100'

  if (!loading && (!data || data.deals.length === 0)) return null

  return (
    <section className={`py-16 px-6 ${sectionBg}`}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🔥</span>
              <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Today's Hot Opportunities
              </h2>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Top-scored signals updated daily — highest opportunity scores first
            </p>
          </div>
          {data?.date && (
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0 ${
                isDark
                  ? 'bg-blue-900/30 border-blue-800 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}
            >
              {data.date}
            </span>
          )}
        </div>

        {/* Card */}
        <div className={`rounded-2xl shadow-lg overflow-hidden ${cardBg}`}>
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16">
              <svg className="w-5 h-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading today's deals…
              </span>
            </div>
          ) : (
            <>
              <div className={`divide-y ${rowBorder}`}>
                {data!.deals.map((deal, i) => {
                  const leadTypeBg =
                    deal.lead_type === 'Pre-Foreclosure'
                      ? 'bg-red-100 text-red-700'
                      : deal.lead_type === 'Expired Listing'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'

                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-4 px-5 py-4 ${
                        isDark ? 'hover:bg-gray-800/60' : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      {/* Rank */}
                      <span
                        className={`text-sm font-bold w-5 text-center flex-shrink-0 ${
                          isDark ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        {i + 1}
                      </span>

                      {/* Address + city */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {deal.address}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {deal.city}
                        </p>
                      </div>

                      {/* Explanation (hidden on small screens) */}
                      <p
                        className={`hidden md:block text-xs flex-1 min-w-0 truncate ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {getFirstExplanation(deal)}
                      </p>

                      {/* Lead type badge */}
                      <span
                        className={`hidden sm:inline-block flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded ${leadTypeBg}`}
                      >
                        {deal.lead_type}
                      </span>

                      {/* Score */}
                      <div className="flex-shrink-0">
                        <ScorePill score={deal.opportunity_score ?? 0} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Footer CTA */}
              <div
                className={`flex items-center justify-between px-5 py-4 border-t ${
                  isDark
                    ? 'border-gray-700 bg-gray-800/40'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Showing top {data!.deals.length} signals with score ≥ 80
                </p>
                <a
                  href="/finder"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  View in Finder →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
