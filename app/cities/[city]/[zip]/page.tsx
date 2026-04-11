import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ── Slug → City name (mirrors parent city page) ──────────────────────────────

const SLUG_TO_CITY: Record<string, string> = {
  'portland-me': 'Portland ME',
  'st-louis':    'St Louis',
}

function slugToCity(slug: string): string {
  if (SLUG_TO_CITY[slug]) return SLUG_TO_CITY[slug]
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ── generateStaticParams: pre-render top 5 zips per top 20 cities ─────────────

const TOP_CITIES = [
  'phoenix', 'miami', 'dallas', 'atlanta', 'chicago',
  'cleveland', 'nashville', 'denver', 'charlotte', 'austin',
  'houston', 'tampa', 'seattle', 'raleigh', 'columbus',
  'indianapolis', 'las-vegas', 'memphis', 'baltimore', 'pittsburgh',
]

export async function generateStaticParams(): Promise<{ city: string; zip: string }[]> {
  const params: { city: string; zip: string }[] = []

  for (const citySlug of TOP_CITIES) {
    try {
      const cityName = slugToCity(citySlug)
      const { data } = await supabaseAdmin
        .from('properties')
        .select('zip')
        .ilike('city', cityName)
        .not('zip', 'is', null)
        .limit(2000)

      if (!data?.length) continue

      const zipCounts: Record<string, number> = {}
      for (const row of data) {
        if (row.zip) zipCounts[row.zip] = (zipCounts[row.zip] ?? 0) + 1
      }

      Object.entries(zipCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([zip]) => params.push({ city: citySlug, zip }))
    } catch {
      // skip city on error
    }
  }

  return params
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PropertyRow {
  id: string
  address: string
  city: string
  zip: string
  lead_type: string
  opportunity_score: number | null
  estimated_value: number | null
  loan_balance_estimate: number | null
  tax_delinquent: boolean | null
  absentee_owner: boolean | null
}

function scoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-600/10 border-emerald-600/20'
  if (score >= 40) return 'bg-yellow-600/10 border-yellow-600/20'
  return 'bg-red-600/10 border-red-600/20'
}

function fmt(n: number): string {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : `$${Math.round(n / 1000)}k`
}

const LEAD_TYPE_CONTEXT: Record<string, string> = {
  'Pre-Foreclosure':      'owners facing financial distress and potential foreclosure proceedings',
  'Tax Delinquent':       'properties with overdue tax obligations and highly motivated sellers',
  'Expired Listing':      'properties that failed to sell and now have motivated sellers open to negotiation',
  'Investor Opportunity': 'high-equity properties with strong fundamentals for investment',
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ city: string; zip: string }> }
): Promise<Metadata> {
  const { city: slug, zip } = await params
  const cityName = slugToCity(slug)

  const { data, count } = await supabaseAdmin
    .from('properties')
    .select('opportunity_score, lead_type', { count: 'exact' })
    .eq('zip', zip)
    .limit(500)

  const total = count ?? 0
  const rows = (data ?? []) as Pick<PropertyRow, 'opportunity_score' | 'lead_type'>[]

  const scores = rows.map((r) => r.opportunity_score ?? 0).filter((s) => s > 0)
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  const preFCCount = rows.filter((r) => r.lead_type === 'Pre-Foreclosure').length

  const title = `Investment Properties in ${zip} ${cityName} — ${total} Distressed Signals | PropertySignalHQ`
  const desc = `Find ${total} distressed property signals in zip code ${zip}, ${cityName}. ${preFCCount} pre-foreclosures, avg opportunity score ${avgScore}/100. Free to explore.`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://propertysignalhq.com/cities/${slug}/${zip}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ZipPage(
  { params }: { params: Promise<{ city: string; zip: string }> }
) {
  const { city: slug, zip } = await params
  const cityName = slugToCity(slug)

  // Fetch properties for this zip (zip is the primary key — city slug is
  // for SEO-friendly URLs only; actual city stored in DB may differ, e.g.
  // /cities/cleveland/44107 has city="Lakewood" in the DB)
  const { data, count } = await supabaseAdmin
    .from('properties')
    .select(
      'id, address, city, zip, lead_type, opportunity_score, estimated_value, loan_balance_estimate, tax_delinquent, absentee_owner',
      { count: 'exact' }
    )
    .eq('zip', zip)
    .order('opportunity_score', { ascending: false })
    .limit(500)

  const total = count ?? 0


  if (total === 0) notFound()

  const rows = (data ?? []) as PropertyRow[]
  const top5 = rows.slice(0, 3)

  // Derive stats
  const validScores = rows.map((r) => r.opportunity_score ?? 0).filter((s) => s > 0)
  const avgScore = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0

  const leadCounts: Record<string, number> = {}
  for (const r of rows) {
    leadCounts[r.lead_type] = (leadCounts[r.lead_type] ?? 0) + 1
  }
  const topLeadType = Object.entries(leadCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Mixed'

  const preFCCount = leadCounts['Pre-Foreclosure'] ?? 0
  const expiredCount = leadCounts['Expired Listing'] ?? 0
  const investorCount = leadCounts['Investor Opportunity'] ?? 0
  const taxDelCount = rows.filter((r) => r.tax_delinquent === true).length
  const absenteeCount = rows.filter((r) => r.absentee_owner === true).length
  const highEquityCount = rows.filter((r) => (r.opportunity_score ?? 0) >= 80).length

  const leadContext = LEAD_TYPE_CONTEXT[topLeadType] ?? 'diverse real estate investment opportunities'

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cities" className="hover:text-gray-300 transition-colors">Markets</Link>
          <span>/</span>
          <Link href={`/cities/${slug}`} className="hover:text-gray-300 transition-colors">{cityName}</Link>
          <span>/</span>
          <span className="text-gray-400">{zip}</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Distressed Properties in {zip} — {cityName}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            {total.toLocaleString()} distressed property signals in ZIP {zip} with an average
            opportunity score of {avgScore}/100.
          </p>
          <div className="mt-5">
            <Link
              href={`/finder?city=${encodeURIComponent(cityName)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
            >
              View All Signals in {zip} →
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: 'Total Properties',   value: total.toLocaleString(),          color: 'text-blue-400' },
            { label: 'Average Score',       value: `${avgScore}/100`,               color: 'text-white' },
            { label: 'Pre-Foreclosure',     value: preFCCount.toLocaleString(),     color: 'text-red-400' },
            { label: 'Expired Listing',     value: expiredCount.toLocaleString(),   color: 'text-yellow-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Investor Opportunity', value: investorCount.toLocaleString(),  color: 'text-emerald-400' },
            { label: 'Tax Delinquent',        value: taxDelCount.toLocaleString(),    color: 'text-orange-400' },
            { label: 'Absentee Owner',         value: absenteeCount.toLocaleString(), color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top 5 opportunities table */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-base font-bold text-white">Top Opportunities in ZIP {zip}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Highest opportunity scores — preview only, no owner data</p>
          </div>

          <div className="divide-y divide-white/5">
            {top5.map((p, i) => {
              const score = p.opportunity_score ?? 0
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-gray-600 w-5 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{p.address}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cityName}, {p.zip}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${scoreBg(score)} ${scoreColor(score)}`}>
                      {p.lead_type.replace('Pre-Foreclosure', 'Pre-FC').replace('Investor Opportunity', 'Inv. Opp')}
                    </span>
                    {p.estimated_value && (
                      <span className="text-xs text-gray-400 hidden sm:block">{fmt(p.estimated_value)}</span>
                    )}
                    <span className={`text-lg font-bold w-10 text-right ${scoreColor(score)}`}>{score}</span>
                    <Link
                      href={`/property/${p.id}`}
                      className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap transition-colors"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pro lock row */}
          <div className="px-5 py-4 bg-blue-950/30 border-t border-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-blue-300">
                🔒 Owner contact info hidden — {total.toLocaleString()} signals available
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Unlock phone numbers, mailing addresses, and skip-trace data with Pro.
              </p>
            </div>
            <Link
              href="/pricing"
              className="flex-shrink-0 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Unlock Owner Data →
            </Link>
          </div>
        </div>

        {/* Investment context paragraph */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5 mb-8">
          <h2 className="text-sm font-bold text-white mb-3">Investment Overview — ZIP {zip}</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            ZIP code {zip} in {cityName} currently has {total.toLocaleString()} distressed property
            signals with an average opportunity score of {avgScore}/100. The most common signal type
            is <span className="text-gray-300 font-medium">{topLeadType}</span>, indicating {leadContext}.{' '}
            {highEquityCount > 0 && (
              <>{highEquityCount} {highEquityCount === 1 ? 'property shows' : 'properties show'} high equity
              potential (score ≥ 80){preFCCount > 0 ? `, and ${preFCCount} ${preFCCount === 1 ? 'signal is' : 'signals are'} flagged as pre-foreclosure` : ''}.</>
            )}
            {taxDelCount > 0 && (
              <> {taxDelCount} {taxDelCount === 1 ? 'property has' : 'properties have'} tax delinquency signals.</>
            )}
          </p>
        </div>

        {/* CTA section */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-8 text-center mb-10">
          <h2 className="text-xl font-bold text-white mb-2">
            See All {total.toLocaleString()} Signals in {zip}
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Full list with opportunity scores, equity data, days on market, and owner contact info for Pro members.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/finder?city=${encodeURIComponent(cityName)}`}
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/25"
            >
              View All {total.toLocaleString()} Signals in {zip} →
            </Link>
            <Link
              href="/market-report"
              className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm transition-colors"
            >
              Get Free {cityName} Market Report
            </Link>
          </div>
        </div>

        {/* Back links */}
        <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-6">
          <Link href={`/cities/${slug}`} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to {cityName}
          </Link>
          <Link href="/cities" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Browse all markets
          </Link>
        </div>

      </div>
    </div>
  )
}
