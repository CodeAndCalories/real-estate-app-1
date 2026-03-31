'use client'

import { useEffect, useState } from 'react'

type Props = {
  isDark: boolean
}

type CityCount = { city: string; count: number }

const CITY_META: Record<string, { emoji: string; state: string }> = {
  'Miami':           { emoji: '🌴', state: 'FL' },
  'Dallas':          { emoji: '⭐', state: 'TX' },
  'Phoenix':         { emoji: '☀️', state: 'AZ' },
  'Atlanta':         { emoji: '🍑', state: 'GA' },
  'Chicago':         { emoji: '🌬️', state: 'IL' },
  'Cleveland':       { emoji: '🏙️', state: 'OH' },
  'Los Angeles':     { emoji: '🎬', state: 'CA' },
  'New York':        { emoji: '🗽', state: 'NY' },
  'Tampa':           { emoji: '🌊', state: 'FL' },
  'Nashville':       { emoji: '🎸', state: 'TN' },
  'Jacksonville':    { emoji: '🏖️', state: 'FL' },
  'Denver':          { emoji: '🏔️', state: 'CO' },
  'Houston':         { emoji: '🚀', state: 'TX' },
  'San Antonio':     { emoji: '🌵', state: 'TX' },
  'Austin':          { emoji: '🎵', state: 'TX' },
  'Seattle':         { emoji: '☕', state: 'WA' },
  'Charlotte':       { emoji: '🏦', state: 'NC' },
  'Indianapolis':    { emoji: '🏎️', state: 'IN' },
  'Columbus':        { emoji: '🏙️', state: 'OH' },
  'Baltimore':       { emoji: '🦀', state: 'MD' },
  'Memphis':         { emoji: '🎵', state: 'TN' },
  'Raleigh':         { emoji: '🌲', state: 'NC' },
  'Pittsburgh':      { emoji: '🌉', state: 'PA' },
  'Las Vegas':       { emoji: '🎰', state: 'NV' },
  'Salt Lake City':  { emoji: '🏔️', state: 'UT' },
  'Kansas City':     { emoji: '🥩', state: 'MO' },
  'Detroit':         { emoji: '🚗', state: 'MI' },
  'Minneapolis':     { emoji: '❄️', state: 'MN' },
  'Portland':        { emoji: '🌿', state: 'OR' },
  'New Orleans':     { emoji: '🎺', state: 'LA' },
}

export default function MarketsCovered({ isDark }: Props) {
  const [cities, setCities] = useState<CityCount[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetch('/api/cities')
      .then((r) => r.json())
      .then((data: { total: number; cities: CityCount[] }) => {
        setCities(data.cities ?? [])
        setTotal(data.total ?? 0)
      })
      .catch(() => {})
  }, [])

  if (cities.length === 0) return null

  const allCityCount = cities.length
  const sorted = [...cities].sort((a, b) => b.count - a.count)
  const top12 = sorted.slice(0, 12)

  return (
    <section className="py-20 px-6 bg-[#020617]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full ${
            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            Markets Covered
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Active Leads Across {allCityCount} Major US Markets
          </h2>
          <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Updated weekly with Zillow-powered market data across every major region.
          </p>
        </div>

        {/* Summary stat */}
        <div className="text-center mb-10">
          <span className={`inline-block text-2xl font-black tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {total.toLocaleString()}+
          </span>
          <span className={`ml-2 text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            active leads across {allCityCount} major US markets
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {top12.map(({ city, count }) => {
            const meta = CITY_META[city] ?? { emoji: '🏙️', state: '' }
            return (
              <div
                key={city}
                className={`rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-blue-950/50 hover:border-blue-800'
                    : 'bg-gray-50 border-gray-100 shadow-md shadow-gray-200/80 hover:shadow-lg hover:shadow-blue-100 hover:border-blue-200'
                }`}
              >
                <div className="text-2xl mb-2">{meta.emoji}</div>
                <div className={`text-base font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {city}
                </div>
                <div className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{meta.state}</div>
                <div className={`text-2xl font-black tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {count.toLocaleString()}
                </div>
                <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  leads available
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/cities"
            className={`inline-block font-semibold text-sm px-6 py-2.5 rounded-lg border transition-colors ${
              isDark
                ? 'border-blue-600 text-blue-400 hover:bg-blue-900/30'
                : 'border-blue-300 text-blue-600 hover:bg-blue-50'
            }`}
          >
            View all {allCityCount} markets →
          </a>
          <a
            href="/signup"
            className={`inline-block font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Browse All Leads →
          </a>
        </div>
      </div>
    </section>
  )
}
