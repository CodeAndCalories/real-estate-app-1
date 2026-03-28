'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabaseBrowser } from '@/lib/supabase-browser'

interface SavedSearch {
  id: string
  user_email: string
  city: string | null
  lead_type: string | null
  min_score: number
  label: string | null
  created_at: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AlertsPage() {
  const { isLoggedIn, loaded, user } = useAuth()
  const router = useRouter()

  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loaded) return
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }

    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) { setIsLoading(false); return }
      fetch('/api/saved-searches', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((data: { searches?: SavedSearch[]; error?: string }) => {
          if (data.searches) setSearches(data.searches)
          else setError(data.error ?? 'Failed to load alerts')
        })
        .catch(() => setError('Failed to load alerts'))
        .finally(() => setIsLoading(false))
    })
  }, [loaded, isLoggedIn, router])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session?.access_token) return
      const res = await fetch(`/api/saved-searches?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        setSearches((prev) => prev.filter((s) => s.id !== id))
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  const pageBg = 'min-h-screen bg-[#020617] text-white'

  if (!loaded || isLoading) {
    return (
      <div className={pageBg}>
        <div className="max-w-2xl mx-auto px-4 py-16 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading your alerts…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={pageBg}>
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Deal Alerts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Daily emails when new properties match your saved searches.
            </p>
          </div>
          <Link
            href="/finder"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Alert
          </Link>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {searches.length === 0 ? (
          /* Empty state */
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-16 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600/20 mx-auto mb-5">
              <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No alerts yet</h2>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Save a search in the finder and we&apos;ll email you daily when new matching deals appear.
            </p>
            <Link
              href="/finder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              Go to Finder
            </Link>
          </div>
        ) : (
          /* Alert list */
          <div className="space-y-3">
            {searches.map((s) => {
              const title = s.label ?? s.city ?? 'All Cities'
              const finderParams = new URLSearchParams()
              if (s.city) finderParams.set('city', s.city)
              if (s.lead_type) finderParams.set('lead_type', s.lead_type)
              const finderHref = `/finder${finderParams.toString() ? `?${finderParams}` : ''}`

              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:bg-white/[0.05] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={finderHref}
                      className="text-sm font-semibold text-white hover:text-blue-400 transition-colors truncate block"
                    >
                      {title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      {s.lead_type && (
                        <span className="text-xs text-gray-500">{s.lead_type}</span>
                      )}
                      {s.min_score > 0 && (
                        <span className="text-xs text-gray-500">Score ≥ {s.min_score}</span>
                      )}
                      <span className="text-xs text-gray-600">Added {formatDate(s.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={finderHref}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-md border border-white/10 hover:border-white/20"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deletingId === s.id}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-md border border-red-500/20 hover:border-red-500/40 disabled:opacity-50"
                    >
                      {deletingId === s.id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {searches.length > 0 && (
          <p className="mt-6 text-xs text-gray-600 text-center">
            Alerts are sent daily at 8am UTC to {user?.email}
          </p>
        )}
      </div>
    </div>
  )
}
