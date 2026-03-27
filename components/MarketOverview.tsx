'use client'

import { useEffect, useState } from 'react'

type CityCount = { city: string; count: number }

export default function MarketOverview() {
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Markets Covered</h2>
        <span className="text-xs text-gray-400 font-medium">{total.toLocaleString()} total leads</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cities.map(({ city, count }) => (
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
