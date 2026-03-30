'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface CityRow {
  city: string
  count: number
}

interface Props {
  cities: CityRow[]
  totalSignals: number
}

const PAGE_SIZE = 24

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

function scoreColor(count: number): string {
  if (count >= 700) return 'text-emerald-400'
  if (count >= 400) return 'text-blue-400'
  return 'text-gray-400'
}

export default function CitiesClient({ cities, totalSignals }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const pageParam = parseInt(searchParams.get('page') ?? '1', 10)
  const initialPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(initialPage)

  // Reset to page 1 when search query changes
  useEffect(() => {
    setPage(1)
    if (searchParams.get('page')) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      router.replace(`/cities?${params.toString()}`, { scroll: false })
    }
  }, [query]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = query.trim()
    ? cities.filter((c) => c.city.toLowerCase().includes(query.toLowerCase().trim()))
    : cities

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const paginated = filtered.slice(start, start + PAGE_SIZE)

  const goToPage = useCallback((p: number) => {
    setPage(p)
    const params = new URLSearchParams(searchParams.toString())
    if (p === 1) {
      params.delete('page')
    } else {
      params.set('page', String(p))
    }
    const qs = params.toString()
    router.push(`/cities${qs ? `?${qs}` : ''}`, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [router, searchParams])

  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{totalSignals.toLocaleString()}+</div>
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

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities..."
            className="w-full rounded-xl border border-white/10 bg-[#0f172a] py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {query.trim()
            ? `${filtered.length} ${filtered.length === 1 ? 'city' : 'cities'} found`
            : `${cities.length} cities total`}
        </p>
      </div>

      {/* City grid */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {paginated.map((c) => {
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
      ) : (
        <div className="text-center py-16 text-gray-500 text-sm mb-8">
          No cities match &ldquo;{query}&rdquo;
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={() => goToPage(safePage - 1)}
            disabled={safePage <= 1}
            className="px-4 py-2 rounded-lg border border-white/10 bg-[#0f172a] text-sm text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-400 px-2">
            Page <span className="text-white font-semibold">{safePage}</span> of{' '}
            <span className="text-white font-semibold">{totalPages}</span>
          </span>
          <button
            onClick={() => goToPage(safePage + 1)}
            disabled={safePage >= totalPages}
            className="px-4 py-2 rounded-lg border border-white/10 bg-[#0f172a] text-sm text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

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
    </>
  )
}
