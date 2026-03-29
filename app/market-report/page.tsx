'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'

interface CityOption {
  city:  string
  count: number
}

function MarketReportInner() {
  const searchParams = useSearchParams()
  const { user }     = useAuth()
  const { isPro }    = useProStatus(user?.email)

  const [cities,  setCities]  = useState<CityOption[]>([])
  const [email,   setEmail]   = useState('')
  const [city,    setCity]    = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const autoFired = useRef(false)

  // ── Load cities ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/cities')
      .then(r => r.json())
      .then(d => {
        const list: CityOption[] = (d.cities ?? []).sort(
          (a: CityOption, b: CityOption) => a.city.localeCompare(b.city),
        )
        setCities(list)
      })
      .catch(() => {/* non-critical */})
  }, [])

  // ── Pre-fill from URL params ──────────────────────────────────────────────
  useEffect(() => {
    const urlCity  = searchParams.get('city')
    const urlEmail = searchParams.get('email')
    if (urlCity)  setCity(urlCity)
    if (urlEmail) setEmail(urlEmail)
  }, [searchParams])

  // ── Auto-generate if both params present (one-time) ──────────────────────
  useEffect(() => {
    if (autoFired.current) return
    const urlCity  = searchParams.get('city')
    const urlEmail = searchParams.get('email')
    if (urlCity && urlEmail && cities.length > 0) {
      autoFired.current = true
      handleGenerate(urlEmail, urlCity)
    }
  }, [cities, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Generate report ───────────────────────────────────────────────────────
  async function handleGenerate(emailVal = email, cityVal = city) {
    setError(null)

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailVal.trim() || !emailRe.test(emailVal.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (!cityVal) {
      setError('Please select a city.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/market-report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: emailVal.trim(), city: cityVal, isPro: isPro ?? false }),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error((d as { error?: string }).error ?? 'Failed to generate report.')
      }

      // Trigger direct file download — user opens the .html file locally and prints to PDF
      const html     = await res.text()
      const blob     = new Blob([html], { type: 'text/html' })
      const url      = URL.createObjectURL(blob)
      const anchor   = document.createElement('a')
      anchor.href    = url
      anchor.download = `${cityVal.replace(/\s+/g, '-').toLowerCase()}-market-report.html`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleGenerate()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center px-4 py-20">

      {/* Back link */}
      <div className="w-full max-w-lg mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to home
        </Link>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-[#0a0f1e] border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            FREE
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-3 tracking-tight">
            Get Your Free Market Report
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Enter your email and pick a city — we'll open a printable report with the
            top distressed property signals in that market.
          </p>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Report Downloaded!</h2>
            <p className="text-gray-400 text-sm mb-2">
              Your <span className="text-white font-medium">{city}</span> report was saved
              as an HTML file.
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Open the downloaded file in your browser, then press{' '}
              <kbd className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl+P</kbd>{' '}
              and choose <span className="text-gray-300">Save as PDF</span>.
              We also emailed you a summary.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => { setSuccess(false); setError(null) }}
                className="block w-full text-sm font-semibold text-gray-300 border border-white/10 hover:bg-white/5 px-4 py-2.5 rounded-lg transition-colors"
              >
                Generate Another Report
              </button>
              {isPro ? (
                <Link
                  href="/finder"
                  className="block w-full text-center text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
                >
                  View Full Signals →
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="block w-full text-center text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                >
                  Upgrade for Owner Contact Info →
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={onSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Your Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors text-sm"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Select a City
              </label>
              <select
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors text-sm appearance-none"
              >
                <option value="">Choose a market…</option>
                {cities.map(c => (
                  <option key={c.city} value={c.city}>
                    {c.city} ({c.count.toLocaleString()} signals)
                  </option>
                ))}
              </select>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating Report…
                </>
              ) : (
                <>Generate My Free Report</>
              )}
            </button>

            <p className="text-xs text-center text-gray-600">
              No account needed · Downloads as HTML · Open &amp; print to PDF
            </p>
          </form>
        )}
      </div>

      {/* What's included */}
      <div className="w-full max-w-lg mt-8 grid grid-cols-2 gap-3">
        {[
          { icon: '📊', title: 'Market Overview',    desc: 'Median value, typical rent, market temp' },
          { icon: '🏠', title: 'Top 10 Signals',     desc: 'Highest scored distressed properties'    },
          { icon: '📈', title: 'Opportunity Scores',  desc: 'Pre-ranked by investment potential'      },
          { icon: '🖨️', title: 'Printable PDF',       desc: 'Clean layout, save via Ctrl+P'           },
        ].map(item => (
          <div
            key={item.title}
            className="bg-[#0a0f1e] border border-white/10 rounded-xl p-4"
          >
            <div className="text-xl mb-1.5">{item.icon}</div>
            <div className="text-sm font-semibold text-white mb-0.5">{item.title}</div>
            <div className="text-xs text-gray-500">{item.desc}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default function MarketReportPage() {
  return (
    <Suspense fallback={null}>
      <MarketReportInner />
    </Suspense>
  )
}
