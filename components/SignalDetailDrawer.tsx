'use client'

import { useEffect, useRef, useState } from 'react'
import { Property } from '@/app/finder/page'
import { explainSignal } from '@/lib/utils/explainSignal'
import { getScoreLabel } from '@/lib/utils/scoreProperty'
import { useThemeMode } from '@/lib/hooks/useThemeMode'

type Props = {
  property: Property | null
  onClose: () => void
  isSaved: boolean
  onToggleSave: (p: Property) => void
  isPro: boolean
}

function getFreshnessDays(address: string): number {
  const hash = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return (hash % 7) + 1
}

function FreshnessBadge({ address }: { address: string }) {
  const days = getFreshnessDays(address)
  if (days <= 2)
    return (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-900/30 text-green-400 border border-green-700">
        New
      </span>
    )
  if (days <= 5)
    return (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-900/30 text-blue-400 border border-blue-700">
        Updated
      </span>
    )
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white/5 text-gray-500 border border-white/10">
      Recent
    </span>
  )
}

function fmt(value: number | null | undefined, prefix = ''): string {
  if (value === null || value === undefined) return '—'
  return prefix + value.toLocaleString()
}

function Row({
  label,
  value,
  isDark,
  highlight,
}: {
  label: string
  value: string
  isDark: boolean
  highlight?: 'green' | 'red'
}) {
  const valueClass =
    highlight === 'green'
      ? 'text-green-500 font-semibold'
      : highlight === 'red'
      ? 'text-red-500 font-semibold'
      : 'text-gray-200'

  return (
    <div className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02]">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-medium text-right ${valueClass}`}>{value}</span>
    </div>
  )
}

export default function SignalDetailDrawer({ property, onClose, isSaved, onToggleSave, isPro }: Props) {
  const { isDark } = useThemeMode()

  // localP keeps content visible during the close animation
  const [localP, setLocalP] = useState<Property | null>(null)
  const [isSlideIn, setIsSlideIn] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (property) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setLocalP(property)
      // Double rAF: ensure element is in DOM before applying translate class
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsSlideIn(true))
      )
      return () => cancelAnimationFrame(id)
    }
  }, [property])

  function close() {
    setIsSlideIn(false)
    timerRef.current = setTimeout(() => {
      setLocalP(null)
      onClose()
    }, 300)
  }

  if (!localP) return null

  const p = localP
  const score = p.opportunity_score ?? 0
  const equity =
    p.estimated_value && p.loan_balance_estimate !== null
      ? p.estimated_value - p.loan_balance_estimate
      : null
  const rentRatio =
    p.rent_estimate && p.estimated_value
      ? ((p.rent_estimate / p.estimated_value) * 100).toFixed(2) + '%'
      : null
  const explanations = explainSignal(p)
  const scoreLabel = getScoreLabel(score)

  const scoreBg =
    score >= 80
      ? 'bg-green-900/30 border-green-700 text-green-400'
      : score >= 60
      ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400'
      : 'bg-red-900/30 border-red-800 text-red-400'

  const leadTypeBg =
    p.lead_type === 'Pre-Foreclosure'
      ? 'bg-red-900/30 text-red-400'
      : p.lead_type === 'Expired Listing'
      ? 'bg-yellow-900/30 text-yellow-400'
      : 'bg-green-900/30 text-green-400'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 bg-black/60 ${isSlideIn ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />

      {/* Drawer — slides in from the right */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isSlideIn ? 'translate-x-0' : 'translate-x-full'}
          bg-[#0a0f1e] border-l border-white/10
        `}
        style={{ width: 'min(420px, 100vw)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl leading-snug text-white">
              {p.address}
            </h2>
            <p className="text-xs mt-0.5 text-gray-400">
              {p.city}, {p.zip}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.address}, ${p.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-0.5 inline-block"
            >
              View on Map →
            </a>
          </div>
          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <button
              onClick={() => onToggleSave(p)}
              className={`text-xl leading-none transition-colors ${
                isSaved
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-600 hover:text-yellow-400'
              }`}
              aria-label={isSaved ? 'Unsave signal' : 'Save signal'}
            >
              {isSaved ? '★' : '☆'}
            </button>
            <button
              onClick={close}
              className="p-1.5 rounded-md transition-colors text-gray-400 hover:bg-white/5"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Score / Freshness / Lead Type row */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`rounded-lg border p-3 text-center ${scoreBg}`}>
              <div className="flex items-end justify-center gap-1.5 mb-0.5">
                <svg
                  width="16" height="16" viewBox="0 0 20 20" fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                  aria-hidden="true"
                >
                  <rect x="3" y="11" width="3" height="6" rx="1" fill="currentColor" />
                  <rect x="8.5" y="7" width="3" height="10" rx="1" fill="currentColor" />
                  <rect x="14" y="3" width="3" height="14" rx="1" fill="currentColor" />
                </svg>
                <div className="font-display text-2xl font-bold leading-none">{score}</div>
              </div>
              <div className="text-[11px] font-medium mt-0.5 opacity-80">{scoreLabel}</div>
            </div>
            <div className="rounded-lg border p-3 text-center bg-white/5 border-white/10">
              <div className="flex justify-center mb-1">
                <FreshnessBadge address={p.address} />
              </div>
              <div className="text-[11px] text-gray-400">Data Age</div>
            </div>
            <div className="rounded-lg border p-3 text-center flex flex-col items-center justify-center gap-1 bg-white/5 border-white/10">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${leadTypeBg}`}>
                {p.lead_type}
              </span>
              <span className="text-[11px] text-gray-400">Lead Type</span>
            </div>
          </div>

          {/* Owner Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Owner Contact
            </p>
            <div className={`rounded-lg border p-3 space-y-2.5 bg-white/5 border-white/10 ${isPro ? 'border-l-2 border-emerald-500/40' : ''}`}>
              {isPro ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold shrink-0 text-gray-500">
                      📞 Owner Contact (Best Available)
                    </span>
                    <span className="text-xs font-mono text-emerald-400 text-right">
                      {p.owner_phone ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[11px] font-semibold shrink-0 text-gray-500">
                      📬 Mailing Address (Best Available)
                    </span>
                    <span className="text-xs text-right text-gray-300">
                      {p.owner_mailing_address ?? '—'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-2">
                    Best available contact data · Verify before outreach
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-gray-600">
                      📞 Owner Contact (Best Available)
                    </span>
                    <span className="text-xs font-mono text-gray-600 blur-sm select-none">
                      (***) ***-****
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-gray-600">
                      📬 Mailing Address (Best Available)
                    </span>
                    <span className="text-xs text-gray-600 blur-sm select-none">
                      *** Hidden St, ***
                    </span>
                  </div>
                  <a
                    href="/upgrade"
                    className="block text-xs text-blue-400 hover:underline pt-0.5"
                  >
                    Unlock Skip Trace Data →
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Why This Is an Opportunity */}
          <div className="rounded-lg border p-3.5 bg-blue-950/40 border-blue-800">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
              Why This Is an Opportunity
            </p>
            <ul className="space-y-1.5">
              {explanations.map((line, i) => (
                <li
                  key={i}
                  className="flex gap-2 bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]"
                >
                  <span className="flex-shrink-0 mt-0.5 text-blue-400">•</span>
                  <span className="text-xs text-blue-300">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Property details */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Property Details
            </p>
            <div className="rounded-lg border divide-y text-sm overflow-hidden border-white/10 divide-white/10">
              <Row label="Est. Value" value={fmt(p.estimated_value, '$')} isDark={isDark} />
              <Row
                label="Est. Equity"
                value={equity !== null ? fmt(equity, '$') : '—'}
                isDark={isDark}
                highlight={equity !== null ? (equity > 0 ? 'green' : 'red') : undefined}
              />
              <Row label="Loan Balance" value={fmt(p.loan_balance_estimate, '$')} isDark={isDark} />
              <Row
                label="Days on Market"
                value={p.days_on_market !== null ? `${p.days_on_market} days` : '—'}
                isDark={isDark}
              />
              <Row
                label="Days in Default"
                value={p.days_in_default !== null ? `${p.days_in_default} days` : '—'}
                isDark={isDark}
              />
              <Row
                label="Price Drop"
                value={p.price_drop_percent !== null ? `${p.price_drop_percent}%` : '—'}
                isDark={isDark}
              />
              <Row
                label="Rent Estimate"
                value={p.rent_estimate !== null ? `${fmt(p.rent_estimate, '$')}/mo` : '—'}
                isDark={isDark}
              />
              {rentRatio && (
                <Row label="Rent Yield" value={rentRatio} isDark={isDark} highlight="green" />
              )}
              <Row label="Owner" value={p.owner_name ?? '—'} isDark={isDark} />
              <Row label="Agent" value={p.agent_name ?? '—'} isDark={isDark} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={close}
            className="w-full py-2 rounded-lg text-sm font-semibold border transition-colors bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
