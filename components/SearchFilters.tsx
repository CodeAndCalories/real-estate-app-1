'use client'

import { useState } from 'react'
import { Filters } from '@/app/finder/page'

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
