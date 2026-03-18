'use client'

import propertiesData from '@/lib/data/properties.json'
import type { RawProperty } from '@/lib/types/property'

type Props = {
  isDark: boolean
}

const CITY_META: Record<string, { emoji: string; state: string }> = {
  'Miami':         { emoji: '🌴', state: 'FL' },
  'Dallas':        { emoji: '⭐', state: 'TX' },
  'Phoenix':       { emoji: '☀️', state: 'AZ' },
  'Atlanta':       { emoji: '🍑', state: 'GA' },
  'Chicago':       { emoji: '🌬️', state: 'IL' },
  'Cleveland':     { emoji: '🏙️', state: 'OH' },
  'Los Angeles':   { emoji: '🎬', state: 'CA' },
  'New York':      { emoji: '🗽', state: 'NY' },
  'Tampa':         { emoji: '🌊', state: 'FL' },
  'Nashville':     { emoji: '🎸', state: 'TN' },
  'Jacksonville':  { emoji: '🏖️', state: 'FL' },
  'Denver':        { emoji: '🏔️', state: 'CO' },
  'Houston':       { emoji: '🚀', state: 'TX' },
  'San Antonio':   { emoji: '🌵', state: 'TX' },
}

const CITY_ORDER = [
  'Miami', 'Dallas', 'Phoenix', 'Atlanta', 'Chicago', 'Cleveland', 'Los Angeles', 'New York',
  'Tampa', 'Nashville', 'Jacksonville', 'Denver', 'Houston', 'San Antonio',
]

export default function MarketsCovered({ isDark }: Props) {
  const data = propertiesData as unknown as RawProperty[]

  const cities = CITY_ORDER.map((city) => {
    const count = data.filter((p) => p.city.toLowerCase() === city.toLowerCase()).length
    const hotLeads = data
      .filter((p) => p.city.toLowerCase() === city.toLowerCase())
      .filter((p) => (p.days_on_market ?? 0) > 90).length
    const meta = CITY_META[city] || { emoji: '🏙️', state: '' }
    return { city, count, hotLeads, ...meta }
  })

  const totalLeads = cities.reduce((sum, c) => sum + c.count, 0)

  return (
    <section className={`py-24 px-6 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full ${
            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            Markets Covered
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Active Leads Across 20 Major US Markets
          </h2>
          <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Fresh leads updated regularly across every major region.
          </p>
        </div>

        {/* Summary stat */}
        <div className="text-center mb-10">
          <span className={`inline-block text-2xl font-black tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            {totalLeads.toLocaleString()}+
          </span>
          <span className={`ml-2 text-base font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            active leads across 20 major US markets
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {cities.map(({ city, count, hotLeads, emoji, state }) => (
            <div
              key={city}
              className={`rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-blue-950/50 hover:border-blue-800'
                  : 'bg-gray-50 border-gray-100 shadow-md shadow-gray-200/80 hover:shadow-lg hover:shadow-blue-100 hover:border-blue-200'
              }`}
            >
              <div className="text-2xl mb-2">{emoji}</div>
              <div className={`text-base font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {city}
              </div>
              <div className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{state}</div>
              <div className={`text-2xl font-black tabular-nums ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {count}
              </div>
              <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                leads available
              </div>
              {hotLeads > 0 && (
                <div className={`mt-2 text-xs font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  🔥 {hotLeads} hot lead{hotLeads !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/finder"
            className={`inline-block font-semibold text-sm px-6 py-2.5 rounded-lg border transition-colors ${
              isDark
                ? 'border-blue-600 text-blue-400 hover:bg-blue-900/30'
                : 'border-blue-300 text-blue-600 hover:bg-blue-50'
            }`}
          >
            Browse All Leads →
          </a>
        </div>
      </div>
    </section>
  )
}
