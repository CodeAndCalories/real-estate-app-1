import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase-admin'
import CitiesClient from './CitiesClient'

export const metadata: Metadata = {
  title: 'Real Estate Investment Markets | PropertySignalHQ',
  description:
    'Browse 129 real estate investment markets across all 50 US states. Find distressed properties, motivated sellers, and high-equity opportunities in your city.',
  openGraph: {
    title: 'Real Estate Investment Markets | PropertySignalHQ',
    description:
      'Browse 129 real estate investment markets across all 50 US states. Find distressed properties, motivated sellers, and high-equity opportunities in your city.',
    url: 'https://propertysignalhq.com/cities',
  },
}

interface CityRow {
  city: string
  count: number
}

export default async function CitiesPage() {
  // City list from RPC
  const { data, error } = await supabaseAdmin.rpc('get_city_counts')
  const cities = error
    ? ([] as CityRow[])
    : ((data as CityRow[]) ?? []).filter((r) => r.city).sort((a, b) => b.count - a.count)

  // Actual row count from the properties table — avoids summing inflated RPC counts
  const { count: actualTotal } = await supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact', head: true })
  const totalSignals = actualTotal ?? 88000

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
            {totalSignals.toLocaleString()} distressed property signals across {cities.length} cities
            in all 50 US states — updated daily.
          </p>
        </div>

        {/* Client component handles stats, search, grid, pagination */}
        <Suspense fallback={
          <div className="text-center py-20 text-gray-500 text-sm">Loading markets…</div>
        }>
          <CitiesClient cities={cities} totalSignals={totalSignals} />
        </Suspense>
      </div>
    </div>
  )
}
