import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const metadata: Metadata = {
  title: 'Real Estate Investment Markets | PropertySignalHQ',
  description:
    'Browse 108 real estate investment markets across all 50 US states. Find distressed properties, motivated sellers, and high-equity opportunities in your city.',
  openGraph: {
    title: 'Real Estate Investment Markets | PropertySignalHQ',
    description:
      'Browse 108 real estate investment markets across all 50 US states. Find distressed properties, motivated sellers, and high-equity opportunities in your city.',
    url: 'https://propertysignalhq.com/cities',
  },
}

interface CityRow {
  city: string
  count: number
}

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

function scoreColor(count: number): string {
  if (count >= 700) return 'text-emerald-400'
  if (count >= 400) return 'text-blue-400'
  return 'text-gray-400'
}

export default async function CitiesPage() {
  const { data, error } = await supabaseAdmin.rpc('get_city_counts')

  const cities = error
    ? ([] as CityRow[])
    : ((data as CityRow[]) ?? []).filter((r) => r.city)

  const total = cities.reduce((s, c) => s + c.count, 0)

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-400">Markets</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Real Estate Investment Markets
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            {total.toLocaleString()} distressed property signals across {cities.length} cities
            in all 50 US states — updated daily.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{total.toLocaleString()}+</div>
            <div className="text-xs text-gray-500 mt-1">Total Signals</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-center">
            <div className="text-2xl font-bold text-white">{cities.length}</div>
            <div className="text-xs text-gray-500 mt-1">Cities Covered</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">50</div>
            <div className="text-xs text-gray-500 mt-1">States</div>
          </div>
        </div>

        {/* City grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {cities.map((c) => {
            const slug = cityToSlug(c.city)
            return (
              <Link
                key={c.city}
                href={`/cities/${slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3.5 hover:bg-white/[0.05] hover:border-white/20 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors truncate">
                    {c.city}
                  </p>
                  <p className={`text-xs mt-0.5 font-medium ${scoreColor(c.count)}`}>
                    {c.count.toLocaleString()} signals
                  </p>
                </div>
                <svg
                  className="h-4 w-4 text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Ready to find deals?</h2>
          <p className="text-sm text-gray-400 mb-5 max-w-md mx-auto">
            Search any city, filter by lead type, and export contacts directly to your CRM or dialer.
          </p>
          <Link
            href="/finder"
            className="inline-block px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/25"
          >
            Open Signal Finder →
          </Link>
        </div>
      </div>
    </div>
  )
}
