'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CityOption {
  city:  string
  count: number
}

export default function FreeReportSection() {
  const router = useRouter()
  const [cities, setCities] = useState<CityOption[]>([])
  const [email,  setEmail]  = useState('')
  const [city,   setCity]   = useState('')

  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(d => {
        const list: CityOption[] = (d.cities ?? [])
          .sort((a: CityOption, b: CityOption) => b.count - a.count)
          .slice(0, 30)
        setCities(list)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (city)  params.set('city',  city)
    if (email) params.set('email', email.trim())
    router.push(`/market-report?${params.toString()}`)
  }

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-[#0a0f1e]">
      <div className="max-w-3xl mx-auto">

        {/* Badge */}
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
            FREE DOWNLOAD
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Download Your Free{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              Market Report
            </span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Pick a city, enter your email, and get an instant PDF packed with the top
            distressed property signals, market stats, and opportunity scores.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#020617] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">

            {/* Email */}
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-colors text-sm"
            />

            {/* City */}
            <select
              required
              value={city}
              onChange={e => setCity(e.target.value)}
              className="sm:w-52 bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-colors text-sm appearance-none"
            >
              <option value="">Pick a city…</option>
              {cities.map(c => (
                <option key={c.city} value={c.city}>{c.city}</option>
              ))}
            </select>

            {/* CTA */}
            <button
              type="submit"
              className="sm:shrink-0 font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-600/20 whitespace-nowrap"
            >
              Get Free Report →
            </button>
          </form>

          {/* Trust line */}
          <p className="text-xs text-center text-gray-600 mt-4">
            Instant PDF download · No credit card · No account required
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {[
            '📊 Market overview',
            '🏠 Top 10 signals',
            '📈 Opportunity scores',
            '🌡️ Market temperature',
          ].map(item => (
            <span
              key={item}
              className="text-xs text-gray-400 bg-white/5 border border-white/8 rounded-full px-3 py-1.5"
            >
              {item}
            </span>
          ))}
        </div>

      </div>
    </section>
  )
}
