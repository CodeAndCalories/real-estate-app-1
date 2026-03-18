'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'
import { supabaseBrowser } from '@/lib/supabase-browser'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Favorite {
  id:          string
  property_id: string
  address:     string
  city:        string
  score:       number | null
  signal_type: string | null
  created_at:  string
}

type SortOrder = 'newest' | 'highest_score'

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function signalTypeBadge(type: string): string {
  if (type === 'Pre-Foreclosure')
    return 'bg-red-900/30 text-red-400 border border-red-800/40'
  if (type === 'Expired Listing')
    return 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/40'
  return 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/40'
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function FavoritesPage() {
  const router = useRouter()
  const { user, loaded } = useAuth()
  const { isPro, loading: proLoading } = useProStatus(user?.email)

  const [rawFavorites, setRawFavorites] = useState<Favorite[]>([])
  const [fetching,     setFetching]     = useState(true)
  const [sortOrder,    setSortOrder]    = useState<SortOrder>('newest')

  // Auth guard
  useEffect(() => {
    if (loaded && !user) router.replace('/login')
  }, [loaded, user, router])

  // Fetch favorites once
  useEffect(() => {
    if (!loaded || !user?.email || proLoading) return
    if (!isPro) { setFetching(false); return }

    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) { setFetching(false); return }

      fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((data: { favorites?: Favorite[] }) => {
          if (data.favorites) setRawFavorites(data.favorites)
          setFetching(false)
        })
        .catch(() => setFetching(false))
    })
  }, [loaded, user, isPro, proLoading])

  // Client-side sort (no re-fetch)
  const favorites = useMemo(() => {
    return [...rawFavorites].sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : (b.score ?? 0) - (a.score ?? 0)
    )
  }, [rawFavorites, sortOrder])

  // ── Loading ────────────────────────────────────────────────────────────────

  if (!loaded || proLoading || fetching) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-blue-500" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    )
  }

  // ── Not pro ───────────────────────────────────────────────────────────────

  if (!isPro) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#020617] relative overflow-hidden flex items-center justify-center px-4">
        <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl shadow-2xl space-y-4">
          <span className="text-4xl">⭐</span>
          <p className="text-xl font-bold text-white">Pro Feature</p>
          <p className="text-sm text-gray-400">
            Upgrade to Pro to save and track favorite properties from the signal finder.
          </p>
          <Link
            href="/upgrade"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500"
          >
            Unlock Pro
          </Link>
        </div>
      </div>
    )
  }

  // ── Main page ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#020617] relative overflow-hidden px-4 py-12">

      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="mb-2 inline-block rounded-full border border-blue-600/20 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-400">
              Pro Plan • Signal Finder
            </span>
            <h1 className="text-3xl font-bold text-white">
              Favorites ({favorites.length})
            </h1>
            <p className="mt-1 text-gray-400">
              Properties you&apos;ve saved from the finder
            </p>
          </div>

          {/* Sort toggle */}
          {favorites.length > 1 && (
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
              {(['newest', 'highest_score'] as SortOrder[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortOrder(s)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    sortOrder === s
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {s === 'newest' ? 'Newest' : 'Highest Score'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <p className="text-4xl mb-4">⭐</p>
            <p className="text-lg font-semibold text-white mb-2">No favorites yet</p>
            <p className="text-sm text-gray-400 mb-6">
              Browse signals and star properties you like.
            </p>
            <Link
              href="/finder"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500"
            >
              Browse Signals
            </Link>
          </div>
        ) : (

          /* Property cards */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl space-y-3"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white leading-snug">{fav.address}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{fav.city}</p>
                    <p className="mt-0.5 text-xs text-gray-600">Saved {formatDate(fav.created_at)}</p>
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    {fav.score !== null ? (
                      <p className={`text-3xl font-bold leading-none ${scoreColor(fav.score)}`}>
                        {fav.score}
                      </p>
                    ) : (
                      <p className="text-3xl font-bold leading-none text-gray-600">—</p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-500">Signal Score</p>
                  </div>
                </div>

                {/* Signal type badge */}
                {fav.signal_type && (
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${signalTypeBadge(fav.signal_type)}`}>
                    {fav.signal_type}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center">
          <Link
            href="/finder"
            className="text-sm text-blue-400 underline hover:text-blue-300 transition-colors"
          >
            ← Back to Signal Finder
          </Link>
        </p>

      </div>
    </div>
  )
}
