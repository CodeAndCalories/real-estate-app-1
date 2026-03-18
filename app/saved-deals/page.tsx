'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'
import { supabaseBrowser } from '@/lib/supabase-browser'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SavedDeal {
  id:         string
  address:    string
  price:      number | null
  beds:       number | null
  baths:      number | null
  sqft:       number | null
  year_built: number | null
  score:      number
  confidence: string
  bullets:    string[]
  saved_at:   string
}

type SortOrder = 'newest' | 'highest_score'

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function confidenceStyle(confidence: string): string {
  if (confidence === 'High')   return 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20'
  if (confidence === 'Medium') return 'bg-yellow-600/10 text-yellow-400 border-yellow-600/20'
  return 'bg-gray-600/10 text-gray-400 border-gray-600/20'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

/** Format ISO timestamp as MM/DD/YYYY for CSV output */
function toCSVDate(iso: string): string {
  const d  = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${mm}/${dd}/${d.getFullYear()}`
}

/** Wrap a CSV cell value in quotes if it contains commas, quotes, or newlines */
function csvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

function downloadCSV(rows: (string | number | null | undefined)[][], filename: string): void {
  const csv  = rows.map((r) => r.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SavedDealsPage() {
  const router = useRouter()
  const { user, loaded } = useAuth()
  const { isPro, loading: proLoading } = useProStatus(user?.email)

  const [deals,     setDeals]     = useState<SavedDeal[]>([])
  const [fetching,  setFetching]  = useState(true)
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [showToast, setShowToast] = useState(false)

  const handleExportCSV = () => {
    const today    = new Date().toISOString().slice(0, 10)
    const filename = `propertysignalhq-saved-deals-${today}.csv`
    const headers  = ['Address', 'Score', 'Confidence', 'Price', 'Beds', 'Baths', 'Sqft', 'Year Built', 'Saved Date']
    const rows     = deals.map((d) => [
      d.address,
      d.score,
      d.confidence,
      d.price      ?? '',
      d.beds       ?? '',
      d.baths      ?? '',
      d.sqft       ?? '',
      d.year_built ?? '',
      toCSVDate(d.saved_at),
    ])
    downloadCSV([headers, ...rows], filename)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 1000)
  }

  // Redirect if not logged in
  useEffect(() => {
    if (loaded && !user) router.replace('/login')
  }, [loaded, user, router])

  // Fetch saved deals
  useEffect(() => {
    if (!loaded || !user?.email || proLoading) return
    if (!isPro) { setFetching(false); return }

    const email = user.email.toLowerCase().trim()

    supabaseBrowser
      .from('saved_analyses')
      .select('id, address, price, beds, baths, sqft, year_built, score, confidence, bullets, saved_at')
      .eq('email', email)
      .order(sortOrder === 'newest' ? 'saved_at' : 'score', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setDeals(data as SavedDeal[])
        setFetching(false)
      })
  }, [loaded, user, isPro, proLoading, sortOrder])

  // ── Loading ─────────────────────────────────────────────────────────────────
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

  // ── Not pro ─────────────────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#020617] relative overflow-hidden flex items-center justify-center px-4">
        <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl shadow-2xl space-y-4">
          <span className="text-4xl">🔒</span>
          <p className="text-xl font-bold text-white">This is a Pro feature</p>
          <p className="text-sm text-gray-400">
            Upgrade to Pro to save and track analyzed deals across sessions.
          </p>
          <Link
            href="/upgrade"
            className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500"
          >
            Unlock Unlimited Analysis
          </Link>
        </div>
      </div>
    )
  }

  // ── Main page ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#020617] relative overflow-hidden px-4 py-12">

      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="mb-2 inline-block rounded-full border border-blue-600/20 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-400">
              Pro Plan • Unlimited Saves
            </span>
            <h1 className="text-3xl font-bold text-white">Saved Deals ({deals.length})</h1>
            <p className="mt-1 text-gray-400">Your analyzed properties</p>
          </div>

          {/* Sort toggle + Export — only when deals exist */}
          {deals.length > 0 && (
            <div className="flex items-center gap-2">
              {deals.length > 1 && (
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
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 px-3 py-1.5 text-sm transition-all"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {deals.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
            <p className="text-lg font-semibold text-white mb-2">No saved deals yet</p>
            <p className="text-sm text-gray-400 mb-6">
              Analyze a property and save it to track it here.
            </p>
            <Link
              href="/analyze"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500"
            >
              Analyze a Deal
            </Link>
          </div>
        ) : (

          /* Deal cards grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl space-y-4"
              >
                {/* Top row: address + date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-white leading-snug truncate capitalize">
                      {deal.address}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Saved {formatDate(deal.saved_at)}
                    </p>
                  </div>

                  {/* Score + confidence */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-3xl font-bold leading-none ${scoreColor(deal.score)}`}>
                      {deal.score}
                    </p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${confidenceStyle(deal.confidence)}`}>
                      {deal.confidence}
                    </span>
                  </div>
                </div>

                {/* Property details */}
                {(deal.price || deal.beds || deal.baths || deal.sqft) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                    {deal.price    && <span>${deal.price.toLocaleString()}</span>}
                    {deal.beds     && <span>{deal.beds} bd</span>}
                    {deal.baths    && <span>{deal.baths} ba</span>}
                    {deal.sqft     && <span>{deal.sqft.toLocaleString()} sqft</span>}
                    {deal.year_built && <span>Built {deal.year_built}</span>}
                  </div>
                )}

                {/* Bullets */}
                <ul className="space-y-1.5">
                  {deal.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <p className="mt-8 text-center">
          <Link href="/analyze" className="text-sm text-blue-400 underline hover:text-blue-300 transition-colors">
            ← Analyze another deal
          </Link>
        </p>

      </div>

      {/* CSV download toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg pointer-events-none">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Downloading CSV…
        </div>
      )}
    </div>
  )
}
