'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'
import { supabaseBrowser } from '@/lib/supabase-browser'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnalyzeResult {
  score:           number
  confidence:      'High' | 'Medium' | 'Low'
  bullets:         string[]
  analyses_used:   number | null
  analyses_limit:  number | null
}

interface SimilarSignal {
  id:                string
  address:           string
  city:              string
  opportunity_score: number
  lead_type:         string
}

type PageState        = 'form' | 'loading' | 'result' | 'limit' | 'error'
type SaveState        = 'idle' | 'saving' | 'saved' | 'already_saved' | 'error'
type ShareState       = 'idle' | 'copied'
type SimilarSaveState = 'idle' | 'saving' | 'saved'

// ── Loading copy ──────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  'Scanning address…',
  'Comparing market benchmarks…',
  'Calculating signal score…',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function scoreGlow(score: number): string {
  if (score >= 70) return 'drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]'
  if (score >= 40) return 'drop-shadow-[0_0_35px_rgba(245,158,11,0.3)]'
  return 'drop-shadow-[0_0_35px_rgba(239,68,68,0.3)]'
}

function confidenceStyle(confidence: string): string {
  if (confidence === 'High')   return 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20'
  if (confidence === 'Medium') return 'bg-yellow-600/10 text-yellow-400 border-yellow-600/20'
  return 'bg-gray-600/10 text-gray-400 border-gray-600/20'
}

function cityFromAddress(addr: string): string {
  const parts = addr.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length < 2) return addr.trim()
  return parts.slice(-2).join(', ')
}

function extractCityName(addr: string): string {
  const parts = addr.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 3) return parts[parts.length - 2]
  if (parts.length === 2) return parts[0]
  return addr.trim()
}

function leadTypeBadgeCls(type: string): string {
  if (type === 'Pre-Foreclosure')  return 'bg-red-500/20 text-red-400 border border-red-500/20'
  if (type === 'Expired Listing')  return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
  return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
}

const inputCls =
  'w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all'

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { user, loaded } = useAuth()
  const { isPro }        = useProStatus(user?.email)

  // Form fields
  const [address,   setAddress]   = useState('')
  const [price,     setPrice]     = useState('')
  const [beds,      setBeds]      = useState('')
  const [baths,     setBaths]     = useState('')
  const [sqft,      setSqft]      = useState('')
  const [yearBuilt, setYearBuilt] = useState('')

  // UI state
  const [pageState,   setPageState]   = useState<PageState>('form')
  const [result,      setResult]      = useState<AnalyzeResult | null>(null)
  const [errorMsg,    setErrorMsg]    = useState('')
  const [loadStep,    setLoadStep]    = useState(0)
  const [saveState,    setSaveState]    = useState<SaveState>('idle')
  const [shareState,   setShareState]   = useState<ShareState>('idle')
  const [showToast,    setShowToast]    = useState(false)
  const [similarDeals,   setSimilarDeals]   = useState<SimilarSignal[]>([])
  const [similarSaveMap, setSimilarSaveMap] = useState<Record<string, SimilarSaveState>>({})

  const loadIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch similar deals when a result becomes available
  useEffect(() => {
    if (pageState !== 'result' || !result) return
    const city = extractCityName(address)
    if (!city) return
    const abortCtrl = new AbortController()
    ;(async () => {
      try {
        const res = await fetch(
          `/api/signals?city=${encodeURIComponent(city)}&limit=50`,
          { signal: abortCtrl.signal }
        )
        if (!res.ok) return
        const data = (await res.json()) as { signals: SimilarSignal[] }
        // Sort by score proximity first, then prioritise same lead_type
        const candidates = (data.signals ?? [])
          .filter(
            (s) =>
              Math.abs(s.opportunity_score - result.score) <= 15 &&
              s.address.toLowerCase() !== address.toLowerCase().trim()
          )
          .sort(
            (a, b) =>
              Math.abs(a.opportunity_score - result.score) -
              Math.abs(b.opportunity_score - result.score)
          )
        // Infer lead type from the closest-scoring match
        const inferredType = candidates[0]?.lead_type ?? null
        const sorted = inferredType
          ? [
              ...candidates.filter((s) => s.lead_type === inferredType),
              ...candidates.filter((s) => s.lead_type !== inferredType),
            ]
          : candidates
        setSimilarDeals(sorted.length >= 3 ? sorted.slice(0, 3) : [])
      } catch {
        // ignore abort / network errors
      }
    })()
    return () => abortCtrl.abort()
  }, [pageState, result, address])

  // Cycle loading text
  useEffect(() => {
    if (pageState !== 'loading') {
      if (loadIntervalRef.current) clearInterval(loadIntervalRef.current)
      return
    }
    setLoadStep(0)
    loadIntervalRef.current = setInterval(() => {
      setLoadStep((s) => (s + 1) % LOADING_STEPS.length)
    }, 600)
    return () => {
      if (loadIntervalRef.current) clearInterval(loadIntervalRef.current)
    }
  }, [pageState])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return

    setPageState('loading')
    setErrorMsg('')

    // Minimum 2-second delay for UX
    const minDelay = new Promise<void>((res) => setTimeout(res, 2000))

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session?.access_token) {
        setErrorMsg('You must be logged in to analyze a deal.')
        setPageState('error')
        return
      }

      const body: Record<string, string | number | null> = {
        address: address.trim(),
        price:      price     ? Number(price)     : null,
        beds:       beds      ? Number(beds)      : null,
        baths:      baths     ? Number(baths)     : null,
        sqft:       sqft      ? Number(sqft)      : null,
        year_built: yearBuilt ? Number(yearBuilt) : null,
      }

      const [res] = await Promise.all([
        fetch('/api/analyze', {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        }),
        minDelay,
      ])

      const data = (await res.json()) as
        | AnalyzeResult
        | { error: string; analyses_used?: number; analyses_limit?: number }

      if (!res.ok) {
        const err = (data as { error: string }).error
        if (err === 'limit_reached') {
          setPageState('limit')
          return
        }
        if (err === 'duplicate_submission') {
          setErrorMsg('This address was already submitted in the last 60 seconds.')
          setPageState('error')
          return
        }
        if (err === 'unauthorized') {
          setErrorMsg('Session expired. Please log in again.')
          setPageState('error')
          return
        }
        setErrorMsg('Something went wrong. Please try again.')
        setPageState('error')
        return
      }

      setResult(data as AnalyzeResult)
      setPageState('result')
    } catch {
      await minDelay
      setErrorMsg('Network error. Please try again.')
      setPageState('error')
    }
  }

  const reset = () => {
    setPageState('form')
    setResult(null)
    setErrorMsg('')
    setSaveState('idle')
    setShareState('idle')
    setShowToast(false)
    setSimilarDeals([])
    setSimilarSaveMap({})
  }

  const handleShare = async () => {
    if (!result) return
    const city = cityFromAddress(address)
    const text = `Just found a ${result.score}/100 signal score deal in ${city} 🔥\nAnalyzed on PropertySignalHQ\npropertysignalhq.com/analyze`
    try {
      await navigator.clipboard.writeText(text)
    } catch { /* ignore — clipboard may be unavailable */ }
    setShareState('copied')
    setShowToast(true)
    setTimeout(() => {
      setShareState('idle')
      setShowToast(false)
    }, 2000)
  }

  const handleSave = async () => {
    if (!result || saveState === 'saving') return
    setSaveState('saving')

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session?.access_token) {
        setErrorMsg('Please log in to save deals')
        setSaveState('error')
        return
      }

      const res = await fetch('/api/analyze/save', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          address,
          price:      price     ? Number(price)     : null,
          beds:       beds      ? Number(beds)      : null,
          baths:      baths     ? Number(baths)     : null,
          sqft:       sqft      ? Number(sqft)      : null,
          year_built: yearBuilt ? Number(yearBuilt) : null,
          score:      result.score,
          confidence: result.confidence,
          bullets:    result.bullets,
        }),
      })

      const data = (await res.json()) as { saved?: boolean; already_saved?: boolean; error?: string }

      if (data.already_saved) { setSaveState('already_saved'); return }
      if (data.saved)         { setSaveState('saved');         return }
      setSaveState('error')
    } catch {
      setSaveState('error')
    }
  }

  const handleSaveSimilar = async (s: SimilarSignal) => {
    if (!isPro) return
    const current = similarSaveMap[s.id]
    if (current === 'saving' || current === 'saved') return
    setSimilarSaveMap((prev) => ({ ...prev, [s.id]: 'saving' }))
    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session?.access_token) {
        setSimilarSaveMap((prev) => ({ ...prev, [s.id]: 'idle' }))
        return
      }
      const confidence: 'High' | 'Medium' | 'Low' =
        s.opportunity_score >= 70 ? 'High' :
        s.opportunity_score >= 40 ? 'Medium' : 'Low'
      const res = await fetch('/api/analyze/save', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          address:    s.address,
          score:      s.opportunity_score,
          confidence,
          bullets:    [`${s.lead_type} signal detected in ${s.city}`],
        }),
      })
      const data = (await res.json()) as { saved?: boolean; already_saved?: boolean }
      setSimilarSaveMap((prev) => ({
        ...prev,
        [s.id]: data.saved || data.already_saved ? 'saved' : 'idle',
      }))
    } catch {
      setSimilarSaveMap((prev) => ({ ...prev, [s.id]: 'idle' }))
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#020617] relative overflow-hidden flex items-start justify-center px-4 py-16">

      {/* Glow orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          {isPro ? (
            <span className="inline-block mb-3 rounded-full border border-blue-600/20 bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-400">
              Pro Plan • Unlimited Analyses
            </span>
          ) : (
            <span className="inline-block mb-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-gray-400">
              3 free analyses per day • Pro: Unlimited
            </span>
          )}
          <h1 className="text-3xl font-bold text-white">Analyze Any Deal</h1>
          <p className="mt-2 text-gray-400">
            Enter any property details and get an instant Signal Score based on market data.
          </p>
          <p className="mt-1 text-xs text-gray-600">Powered by 18,000+ property signals</p>
        </div>

        {/* ── FORM ── */}
        {(pageState === 'form' || pageState === 'loading' || pageState === 'error') && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl">

            {/* Error banner */}
            {pageState === 'error' && errorMsg && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Address — full width */}
              <div>
                <label className="mb-1 block text-sm text-gray-400">Address <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 1234 Oak St, Tampa, FL 33601"
                  className={inputCls}
                />
              </div>

              {/* 2-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 285000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Beds</label>
                  <input
                    type="number"
                    min={0}
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    placeholder="e.g. 3"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Baths</label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    placeholder="e.g. 2"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Sqft</label>
                  <input
                    type="number"
                    min={0}
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    placeholder="e.g. 1450"
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm text-gray-400">Year Built</label>
                  <input
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    placeholder="e.g. 1987"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Auth nudge if not loaded or not logged in */}
              {loaded && !user && (
                <p className="text-xs text-gray-500">
                  <Link href="/login" className="text-blue-400 underline hover:text-blue-300">Log in</Link>
                  {' '}or{' '}
                  <Link href="/signup" className="text-blue-400 underline hover:text-blue-300">sign up</Link>
                  {' '}to analyze deals.
                </p>
              )}

              <button
                type="submit"
                disabled={pageState === 'loading' || !address.trim() || (loaded && !user)}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pageState === 'loading' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {LOADING_STEPS[loadStep]}
                  </>
                ) : (
                  'Analyze Deal'
                )}
              </button>

            </form>
          </div>
        )}

        {/* ── RESULT ── */}
        {pageState === 'result' && result && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl space-y-6">

            {/* Score + confidence + save button */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`flex items-end gap-3 ${scoreColor(result.score)}`}>
                  {/* Animated Signal Bars */}
                  <svg
                    key={result.score}
                    width="24" height="24" viewBox="0 0 20 20" fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-2 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="3" height="6" rx="1" fill="currentColor" className="signal-bar signal-bar-1" />
                    <rect x="8.5" y="7" width="3" height="10" rx="1" fill="currentColor" className="signal-bar signal-bar-2" />
                    <rect x="14" y="3" width="3" height="14" rx="1" fill="currentColor" className="signal-bar signal-bar-3" />
                  </svg>
                  <p className={`text-8xl font-black font-display leading-none ${scoreGlow(result.score)}`}>
                    {result.score}
                  </p>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-gray-500">Signal Score</p>
                <span className={`mt-2 inline-block rounded-full border px-4 py-2 text-sm font-semibold ${confidenceStyle(result.confidence)}`}>
                  {result.confidence} Confidence
                </span>
                <p className="mt-2 text-sm text-gray-400">Based on {address}</p>
              </div>

              {/* Save button — pro solid, non-pro locked */}
              <div className="flex-shrink-0 text-right">
                {isPro ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saveState === 'saving' || saveState === 'saved' || saveState === 'already_saved'}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saveState === 'saving'        ? 'Saving…'         :
                       saveState === 'saved'         ? '✓ Saved'         :
                       saveState === 'already_saved' ? '✓ Already Saved' :
                       'Save Deal'}
                    </button>
                    {saveState === 'saved' && (
                      <>
                        <p className="mt-1 text-xs text-emerald-400">Saved to your deal tracker</p>
                        <Link href="/saved-deals" className="mt-1 block text-xs text-blue-400 hover:underline">
                          View Saved Deals →
                        </Link>
                      </>
                    )}
                    {saveState === 'error' && (
                      <p className="mt-1 text-xs text-red-400">Failed to save</p>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => { window.location.href = '/upgrade' }}
                    className="rounded-lg bg-emerald-600/10 border border-emerald-600/20 text-emerald-400 px-5 py-2.5 text-sm font-medium transition-all hover:bg-emerald-600/20"
                  >
                    🔒 Save Deal
                  </button>
                )}
              </div>
            </div>

            {/* Bullets */}
            <ul className="space-y-2">
              {result.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>

            {/* Usage counter — free users only */}
            {result.analyses_used !== null && result.analyses_limit !== null && (
              <p className="text-xs text-gray-500">
                {result.analyses_used} of {result.analyses_limit} daily analyses used
              </p>
            )}

            {/* Share button */}
            <div>
              <button
                onClick={handleShare}
                className="rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 px-4 py-2 text-sm transition-all"
              >
                {shareState === 'copied' ? '✓ Copied' : 'Share Deal 🔥'}
              </button>
            </div>

            {/* CTA */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="mb-3 text-sm font-semibold text-white">
                Want more deals like this automatically?
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/finder"
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 active:scale-95"
                >
                  View Signals
                </Link>
                {!isPro && (
                  <Link
                    href="/upgrade"
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
                  >
                    Unlock Unlimited Analysis
                  </Link>
                )}
              </div>
            </div>

            {/* Similar Deals */}
            {similarDeals.length >= 3 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  Similar Deals in {extractCityName(address)}
                </p>
                <p className="text-xs text-gray-500 italic mt-1 mb-3">
                  Investors are actively analyzing similar properties in this area.
                </p>
                <div className="space-y-2">
                  {similarDeals.map((s) => {
                    const simSave = similarSaveMap[s.id] ?? 'idle'
                    return (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-all hover:bg-white/[0.06] hover:border-white/20"
                      >
                        {/* Clickable address + score area */}
                        <Link
                          href={`/finder?city=${encodeURIComponent(extractCityName(address))}`}
                          className="flex flex-1 items-center justify-between gap-3 min-w-0"
                        >
                          <span className="truncate text-xs text-gray-300 min-w-0">
                            {s.address}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-sm font-bold ${scoreColor(s.opportunity_score)}`}>
                              {s.opportunity_score}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${leadTypeBadgeCls(s.lead_type)}`}>
                              {s.lead_type}
                            </span>
                          </div>
                        </Link>

                        {/* Save button — pro only */}
                        {isPro && (
                          <button
                            onClick={() => { void handleSaveSimilar(s) }}
                            disabled={simSave === 'saving' || simSave === 'saved'}
                            className={`flex-shrink-0 text-base leading-none transition-colors disabled:cursor-not-allowed ${
                              simSave === 'saved'
                                ? 'text-yellow-400'
                                : 'text-gray-600 hover:text-yellow-400'
                            }`}
                            aria-label={simSave === 'saved' ? 'Saved' : 'Save this deal'}
                            title={simSave === 'saved' ? 'Saved' : 'Save deal'}
                          >
                            {simSave === 'saved' ? '★' : simSave === 'saving' ? '…' : '☆'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-right">
                  <Link
                    href={`/finder?city=${encodeURIComponent(extractCityName(address))}`}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Find similar deals →
                  </Link>
                </p>
              </div>
            )}

            {/* Reset */}
            <p className="text-center">
              <button
                onClick={reset}
                className="text-sm text-blue-400 underline hover:text-blue-300 transition-colors"
              >
                Analyze Another Deal
              </button>
            </p>
          </div>
        )}

        {/* Disclaimer — shown below result card */}
        {pageState === 'result' && result && (
          <p className="text-xs text-gray-500 text-center max-w-lg mx-auto mt-2">
            Score is based on market signals and historical data. It does not account for physical
            property condition or interior renovations. Not financial advice.
          </p>
        )}

        {/* ── LIMIT REACHED ── */}
        {pageState === 'limit' && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl">
                🔒
              </span>
            </div>
            <div>
              <p className="text-xl font-bold text-white">Daily Limit Reached</p>
              <p className="mt-2 text-sm text-gray-400">
                You&apos;ve used your 3 free analyses for today.<br />
                Upgrade to Pro for unlimited deal analysis.
              </p>
            </div>
            <Link
              href="/upgrade"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500"
            >
              Unlock Unlimited Analysis
            </Link>
            <p className="text-xs text-gray-500">Limit resets every 24 hours</p>
          </div>
        )}

      </div>

      {/* Share toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg pointer-events-none">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied! Share your deal 🔥
        </div>
      )}
    </div>
  )
}
