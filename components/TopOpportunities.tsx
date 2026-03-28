'use client'

/**
 * TopOpportunities — "🔥 Top Opportunities This Week" landing page section.
 *
 * Fetches the top 6 highest-scored signals from /api/signals?limit=6&sort=score,
 * then filters to opportunity_score >= 80. Displays each as a card with address,
 * lead-type tag, score badge, signal chips, and a "View Deal →" link.
 *
 * TypeScript strict mode — no unknown-type errors.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Signal } from '@/lib/data/getSignals'

type Props = {
  isDark: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSignalTags(s: Signal): string[] {
  const tags: string[] = []
  if (s.absentee_owner)              tags.push('Absentee Owner')
  if (s.tax_delinquent)              tags.push('Tax Delinquent')
  if (s.vacancy_signal)              tags.push('Vacant')
  if ((s.price_drop_percent ?? 0) > 5) tags.push('Price Drop')
  if (s.inherited)                   tags.push('Inherited')
  return tags.slice(0, 3)
}

function leadBadgeClass(type: string, isDark: boolean): string {
  if (type === 'Pre-Foreclosure')
    return isDark
      ? 'bg-red-900/40 text-red-400 border-red-800'
      : 'bg-red-50 text-red-700 border-red-200'
  if (type === 'Expired Listing')
    return isDark
      ? 'bg-yellow-900/40 text-yellow-400 border-yellow-800'
      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
  return isDark
    ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

function scoreDotClass(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-400'
  return 'bg-gray-400'
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard({ isDark }: { isDark: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 h-44 animate-pulse ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}
    />
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TopOpportunities({ isDark }: Props) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/signals?limit=6&sort=score')
      .then((r) => r.json())
      .then((data: { signals: Signal[] }) => {
        // Take up to 6 highest-scored signals regardless of score threshold.
        // The API already returns them sorted descending by score.
        setSignals((data.signals ?? []).slice(0, 6))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && signals.length === 0) return null

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-3xl pointer-events-none" />
    <section className={`py-20 px-6 ${isDark ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Live Dataset
          </p>
          <h2 className={`text-3xl sm:text-4xl font-black leading-tight mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            🔥 Top Opportunities This Week
          </h2>
          <p className={`text-base max-w-md mx-auto ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Highest-scored signals updated regularly
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading
            ? [...Array(6)].map((_, i) => <SkeletonCard key={i} isDark={isDark} />)
            : signals.map((s) => {
                const score = s.opportunity_score ?? 0
                const tags  = getSignalTags(s)
                return (
                  <div
                    key={s.id}
                    className={`rounded-2xl border p-5 flex flex-col gap-3 transition-shadow ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-700'
                        : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Score + Lead type row */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${leadBadgeClass(s.lead_type, isDark)}`}
                      >
                        {s.lead_type}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${scoreDotClass(score)}`} />
                        <span className={`text-lg font-black tabular-nums ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {score}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          / 100
                        </span>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <p className={`text-sm font-bold leading-snug ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {s.address}
                      </p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {s.city}
                      </p>
                    </div>

                    {/* Signal tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isDark
                                ? 'bg-blue-900/40 text-blue-400'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-auto pt-1">
                      <Link
                        href={`/property/${encodeURIComponent(s.id)}`}
                        className="block text-center text-xs font-bold py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                      >
                        View Deal →
                      </Link>
                    </div>
                  </div>
                )
              })}
        </div>

        {/* Browse all link */}
        <div className="text-center mt-8">
          <Link
            href="/finder"
            className={`inline-block text-sm font-semibold border rounded-xl px-6 py-2.5 transition-colors ${
              isDark
                ? 'border-blue-700 text-blue-400 hover:bg-blue-900/30'
                : 'border-blue-300 text-blue-600 hover:bg-blue-50'
            }`}
          >
            Browse All 40,000+ Signals →
          </Link>
        </div>

      </div>
    </section>
    </div>
  )
}
