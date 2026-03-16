'use client'

import type { Property } from '@/app/finder/page'
import { useThemeMode } from '@/lib/hooks/useThemeMode'

type Props = {
  properties: Property[]
  onRemove: (p: Property) => void
  onClear: () => void
}

function fmt(v: number | null | undefined, prefix = ''): string {
  if (v === null || v === undefined) return '—'
  return prefix + v.toLocaleString()
}

function pct(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  return v.toFixed(2) + '%'
}

const ROWS: {
  label: string
  render: (p: Property, isDark: boolean) => React.ReactNode
}[] = [
  {
    label: 'Est. Value',
    render: (p) => fmt(p.estimated_value, '$'),
  },
  {
    label: 'Est. Equity',
    render: (p, isDark) => {
      const eq =
        p.estimated_value && p.loan_balance_estimate != null
          ? p.estimated_value - p.loan_balance_estimate
          : null
      if (eq === null) return <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>—</span>
      return (
        <span className={eq > 0 ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
          {fmt(eq, '$')}
        </span>
      )
    },
  },
  {
    label: 'Score',
    render: (p) => {
      const s = p.opportunity_score ?? 0
      const color = s >= 80 ? 'text-green-500' : s >= 60 ? 'text-yellow-500' : 'text-red-500'
      return <span className={`font-bold ${color}`}>{s}</span>
    },
  },
  {
    label: 'Rent Est.',
    render: (p) => fmt(p.rent_estimate, '$'),
  },
  {
    label: 'Rent Yield',
    render: (p) => {
      if (!p.rent_estimate || !p.estimated_value) return '—'
      return pct((p.rent_estimate / p.estimated_value) * 100)
    },
  },
  {
    label: 'Days on Market',
    render: (p) => (p.days_on_market != null ? `${p.days_on_market}d` : '—'),
  },
  {
    label: 'Lead Type',
    render: (p) => p.lead_type,
  },
  {
    label: 'City',
    render: (p) => `${p.city}, ${p.zip}`,
  },
]

export default function DealComparison({ properties, onRemove, onClear }: Props) {
  const { isDark } = useThemeMode()

  if (properties.length === 0) return null

  const card    = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const divider = isDark ? 'border-gray-700' : 'border-gray-100'
  const textPrimary = isDark ? 'text-white'    : 'text-gray-900'
  const textMuted   = isDark ? 'text-gray-500' : 'text-gray-400'
  const rowBg       = isDark ? 'bg-gray-750'   : 'bg-gray-50'
  const thBg        = isDark ? 'bg-gray-700'   : 'bg-gray-50'

  return (
    <div className={`rounded-xl border mt-5 overflow-hidden ${card}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span>⚖️</span>
          <h2 className={`text-sm font-bold ${textPrimary}`}>Deal Comparison</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
          }`}>
            {properties.length} / 3
          </span>
        </div>
        <button
          onClick={onClear}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Clear All
        </button>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          {/* Property headers */}
          <thead>
            <tr className={thBg}>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${textMuted} w-32`}>
                Field
              </th>
              {properties.map((p) => (
                <th key={p.address} className={`px-4 py-3 text-left ${divider} border-l`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-xs font-bold leading-snug ${textPrimary}`}>{p.address}</p>
                      <p className={`text-[10px] mt-0.5 ${textMuted}`}>{p.city}</p>
                    </div>
                    <button
                      onClick={() => onRemove(p)}
                      title="Remove from comparison"
                      className={`flex-shrink-0 text-[11px] px-1.5 py-0.5 rounded border mt-0.5 transition-colors ${
                        isDark
                          ? 'border-gray-600 text-gray-500 hover:text-red-400 hover:border-red-700'
                          : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                      }`}
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {ROWS.map((row, i) => (
              <tr
                key={row.label}
                className={i % 2 === 0 ? '' : `${rowBg}`}
              >
                <td className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide ${textMuted} whitespace-nowrap`}>
                  {row.label}
                </td>
                {properties.map((p) => (
                  <td
                    key={p.address}
                    className={`px-4 py-2.5 text-sm ${textPrimary} border-l ${divider}`}
                  >
                    {row.render(p, isDark)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {properties.length < 3 && (
        <div className={`px-5 py-3 border-t text-xs ${divider} ${textMuted}`}>
          Click <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Compare</span> on up to {3 - properties.length} more row{3 - properties.length !== 1 ? 's' : ''} to add to this comparison.
        </div>
      )}
    </div>
  )
}
