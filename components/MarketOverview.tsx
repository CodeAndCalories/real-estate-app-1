'use client'

import propertiesData from '@/lib/data/properties.json'
import type { RawProperty } from '@/lib/types/property'

const CITIES = [
  'Miami',
  'Los Angeles',
  'New York',
  'Dallas',
  'Atlanta',
  'Chicago',
  'Phoenix',
  'Cleveland',
]

export default function MarketOverview() {
  const data = propertiesData as unknown as RawProperty[]

  const cityCounts = CITIES.map((city) => ({
    city,
    count: data.filter((p) => p.city.toLowerCase() === city.toLowerCase()).length,
  }))

  const total = cityCounts.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Markets Covered</h2>
        <span className="text-xs text-gray-400 font-medium">{total.toLocaleString()} total leads</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cityCounts.map(({ city, count }) => (
          <div
            key={city}
            className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5"
          >
            <span className="text-sm font-medium text-gray-700">{city}</span>
            <span className="text-sm font-bold text-blue-600 ml-2 tabular-nums">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
