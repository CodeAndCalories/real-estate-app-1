'use client'

import { useState } from 'react'
import { Filters } from '@/app/finder/page'

// ── Quick Filter Bar ───────────────────────────────────────────────────────────

export type QuickFilterId = 'hot' | 'equity' | 'pricedrops' | 'rental'

type QuickFilter = {
  id: QuickFilterId
  icon: string
  label: string
  desc: string
}

const QUICK_FILTER_DEFS: QuickFilter[] = [
  { id: 'hot',        icon: '🔥', label: 'Hot Deals',       desc: 'score ≥ 90'        },
  { id: 'equity',     icon: '💰', label: 'High Equity',     desc: 'equity ≥ 30%'      },
  { id: 'pricedrops', icon: '📉', label: 'Price Drops',     desc: '>5% price drop'    },
  { id: 'rental',     icon: '🏠', label: 'Rental Friendly', desc: 'rent yield ≥ 0.9%' },
]

type QuickFiltersProps = {
  isDark: boolean
  activeFilters: Set<QuickFilterId>
  onToggle: (id: QuickFilterId) => void
  resultCount?: number
}

export function QuickFilters({ isDark, activeFilters, onToggle, resultCount }: QuickFiltersProps) {
  const hasActive = activeFilters.size > 0

  const clearAll = () => {
    QUICK_FILTER_DEFS.forEach((f) => {
      if (activeFilters.has(f.id)) onToggle(f.id)
    })
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide mr-1 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Quick Filters
        </span>

        {QUICK_FILTER_DEFS.map((f) => {
          const active = activeFilters.has(f.id)
          return (
            <button
              key={f.id}
              onClick={() => onToggle(f.id)}
              title={f.desc}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                active
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm leading-none">{f.icon}</span>
              {f.label}
              {active && (
                <span className="ml-0.5 opacity-70 text-[10px] font-black">✕</span>
              )}
            </button>
          )
        })}

        {hasActive && (
          <>
            {resultCount != null && (
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {resultCount} result{resultCount !== 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={clearAll}
              className={`text-xs underline underline-offset-2 transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Clear all
            </button>
          </>
        )}
      </div>

      {hasActive && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {QUICK_FILTER_DEFS.filter((f) => activeFilters.has(f.id)).map((f) => (
            <span
              key={f.id}
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
              }`}
            >
              {f.icon} {f.desc}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Original Search Form (unchanged) ──────────────────────────────────────────

type Props = {
  onSearch: (filters: Filters) => void
}

const LEAD_TYPES = [
  { value: '', label: 'All Lead Types' },
  { value: 'Pre-Foreclosure', label: 'Pre-Foreclosure / Distressed Leads' },
  { value: 'Expired Listing', label: 'Recently Expired Listings' },
  { value: 'Investor Opportunity', label: 'Investor Opportunities' },
]

const MAX_RESULTS = [50, 100, 250, 500]

export default function SearchFilters({ onSearch }: Props) {
  const [location, setLocation] = useState('')
  const [leadType, setLeadType] = useState('')
  const [maxResults, setMaxResults] = useState(50)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch({ location, lead_type: leadType, max_results: maxResults })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col sm:flex-row gap-4 items-end"
    >
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City or ZIP Code
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Phoenix or 85001"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="w-full sm:w-64">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lead Type
        </label>
        <select
          value={leadType}
          onChange={(e) => setLeadType(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LEAD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full sm:w-36">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Results
        </label>
        <select
          value={maxResults}
          onChange={(e) => setMaxResults(Number(e.target.value))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MAX_RESULTS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md text-sm transition-colors"
      >
        Generate Lead List
      </button>
    </form>
  )
}
