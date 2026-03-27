'use client'

import { useEffect, useState } from 'react'

type Props = {
  onCityClick: (city: string) => void
}

const FALLBACK_CITIES = ['Miami', 'Dallas', 'Phoenix', 'Atlanta', 'Chicago', 'Cleveland']

export default function PopularCities({ onCityClick }: Props) {
  const [cities, setCities] = useState<string[]>(FALLBACK_CITIES)

  useEffect(() => {
    fetch('/api/cities')
      .then((r) => r.json())
      .then((data: { cities?: { city: string; count: number }[] }) => {
        if (data.cities && data.cities.length > 0) {
          setCities(data.cities.slice(0, 6).map((c) => c.city))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
        Popular Markets
      </p>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => onCityClick(city)}
            className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm text-gray-700 font-medium hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  )
}
