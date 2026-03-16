'use client'

import { useEffect, useRef, useState } from 'react'
import { Property } from '@/app/finder/page'
import { explainSignal } from '@/lib/utils/explainSignal'
import { getScoreLabel } from '@/lib/utils/scoreProperty'
import { useThemeMode } from '@/lib/hooks/useThemeMode'

type Props = {
  property: Property | null
  onClose: () => void
}

function fmt(value: number | null | undefined, prefix = ''): string {
  if (value == null) return '—'
  return prefix + value.toLocaleString()
}

export default function SignalDrawer({ property, onClose }: Props) {
  const { isDark } = useThemeMode()

  // Preserve content during the close animation
  const [local, setLocal] = useState<Property | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (property) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setLocal(property)
      // Double rAF: element must be in DOM before applying translate class
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsOpen(true))
      )
      return () => cancelAnimationFrame(id)
    }
  }, [property])

  function close() {
    setIsOpen(false)
    timerRef.current = setTimeout(() => {
      setLocal(null)
      onClose()
    }, 300)
  }

  if (!local) return null

  const p = local
  const score = p.opportunity_score ?? 0
  const scoreLabel = getScoreLabel(score)

  const equity =
    p.estimated_value > 0 && p.loan_balance_estimate != null
      ? p.estimated_value - p.loan_balance_estimate
      : null

  const rentPct =
    p.rent_estimate != null && p.estimated_value > 0
      ? ((p.rent_estimate / p.estimated_value) * 100).toFixed(2) + '%'
      : null

  const explanations = explainSignal(p)

  // Score badge colour
  const scoreBadge =
    score >= 80
      ? 'bg-green-500 text-white'
      : score >= 60
      ? 'bg-yellow-400 text-yellow-900'
      : 'bg-gray-600 text-gray-100'

  // Lead type badge colour
  const leadBadge =
    p.lead_type === 'Pre-Foreclosure'
      ? isDark
        ? 'bg-red-900/50 text-red-300 border border-red-700'
        : 'bg-red-50 text-red-700 border border-red-200'
      : p.lead_type === 'Expired Listing'
      ? isDark
        ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
        : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      : isDark
      ? 'bg-green-900/50 text-green-300 border border-green-700'
      : 'bg-green-50 text-green-700 border border-green-200'

  const drawerBg = isDark ? 'bg-gray-900 border-l border-gray-700' : 'bg-white border-l border-gray-200'
  const divider   = isDark ? 'border-gray-700' : 'border-gray-100'
  const rowBg     = isDark ? 'odd:bg-gray-800/40' : 'odd:bg-gray-50/60'
  const labelCls  = isDark ? 'text-gray-400' : 'text-gray-500'
  const valueCls  = isDark ? 'text-gray-100' : 'text-gray-800'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isDark ? 'bg-black/60' : 'bg-black/30'
        } ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          ${drawerBg}`}
        style={{ width: 'min(400px, 100vw)' }}
      >
        {/* Header */}
        <div className={`flex items-start justify-between px-5 py-4 border-b flex-shrink-0 ${divider}`}>
          <div className="flex-1 min-w-0 pr-3">
            <h2 className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {p.address}
            </h2>
            <p className={`text-xs mt-0.5 ${labelCls}`}>{p.city}, {p.zip}</p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${
              isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Score + Lead Type */}
          <div className="flex items-center gap-3">
            <div className={`inline-flex flex-col items-center justify-center rounded-xl px-4 py-2.5 min-w-[72px] ${scoreBadge}`}>
              <span className="text-2xl font-black leading-none">{score}</span>
              <span className="text-[10px] font-semibold mt-0.5 opacity-90">{scoreLabel}</span>
            </div>
            <div>
              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold ${leadBadge}`}>
                {p.lead_type}
              </span>
              <p className={`text-[11px] mt-1 ${labelCls}`}>{p.city}</p>
            </div>
          </div>

          {/* Key metrics */}
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-wide mb-2 ${labelCls}`}>
              Key Metrics
            </p>
            <div className={`rounded-lg border divide-y overflow-hidden ${isDark ? 'border-gray-700 divide-gray-700' : 'border-gray-100 divide-gray-100'}`}>
              {[
                { label: 'Estimated Equity',  value: equity != null ? fmt(equity, '$') : '—', accent: equity != null && equity > 0 ? 'green' : equity != null ? 'red' : null },
                { label: 'Rent Yield',         value: rentPct ?? '—',                          accent: rentPct ? 'green' : null },
                { label: 'Days on Market',     value: p.days_on_market != null ? `${p.days_on_market} days` : '—', accent: (p.days_on_market ?? 0) > 90 ? 'red' : null },
              ].map(({ label, value, accent }) => (
                <div key={label} className={`flex items-center justify-between px-3 py-2.5 ${rowBg}`}>
                  <span className={`text-xs ${labelCls}`}>{label}</span>
                  <span className={`text-xs font-semibold ${
                    accent === 'green'
                      ? 'text-green-500'
                      : accent === 'red'
                      ? 'text-red-400'
                      : valueCls
                  }`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Why This Is an Opportunity */}
          <div className={`rounded-lg border p-4 ${
            isDark ? 'bg-blue-950/40 border-blue-800' : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wide mb-2.5 ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              Why This Is an Opportunity
            </p>
            <ul className="space-y-2">
              {explanations.map((line, i) => (
                <li key={i} className={`flex gap-2 text-xs ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                  <span className="flex-shrink-0 mt-0.5 text-blue-400">•</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-5 py-4 border-t flex-shrink-0 ${divider}`}>
          <button
            onClick={close}
            className={`w-full py-2 rounded-lg text-sm font-semibold border transition-colors ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
