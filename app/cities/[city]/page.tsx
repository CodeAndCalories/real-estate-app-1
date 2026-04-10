import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ── Slug → City name ──────────────────────────────────────────────────────────

// Overrides for city names that don't follow simple title-case
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

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

// ── Static params for top 20 cities ─────────────────────────────────────────

export async function generateStaticParams() {
  return [
    'phoenix', 'miami', 'dallas', 'atlanta', 'chicago',
    'cleveland', 'nashville', 'denver', 'charlotte', 'austin',
    'houston', 'tampa', 'seattle', 'raleigh', 'columbus',
    'indianapolis', 'las-vegas', 'memphis', 'baltimore', 'pittsburgh',
  ].map((city) => ({ city }))
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> }
): Promise<Metadata> {
  const { city: slug } = await params
  const cityName = slugToCity(slug)

  const { count } = await supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .ilike('city', cityName)

  const total = count ?? 0
  const desc = `Find distressed properties and motivated sellers in ${cityName}. Access ${total.toLocaleString()} property signals with owner contact info, equity data, and opportunity scores.`

  return {
    title: `${cityName} Distressed Property Signals | PropertySignalHQ`,
    description: desc,
    openGraph: {
      title: `${cityName} Distressed Property Signals | PropertySignalHQ`,
      description: desc,
      url: `https://propertysignalhq.com/cities/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cityName} Distressed Property Signals | PropertySignalHQ`,
      description: desc,
    },
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

interface PropertyRow {
  address: string
  zip: string
  lead_type: string
  opportunity_score: number | null
  estimated_value: number | null
  loan_balance_estimate: number | null
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CityPage(
  { params }: { params: Promise<{ city: string }> }
) {
  const { city: slug } = await params
  const cityName = slugToCity(slug)

  // Fetch top 100 for stats + count
  const { data, count } = await supabaseAdmin
    .from('properties')
    .select('address, zip, lead_type, opportunity_score, estimated_value, loan_balance_estimate', { count: 'exact' })
    .ilike('city', cityName)
    .order('opportunity_score', { ascending: false })
    .limit(100)

  const total = count ?? 0

  if (total === 0) notFound()

  const rows = (data ?? []) as PropertyRow[]

  // Fetch zip distribution for "Browse by ZIP" section
  const { data: zipData } = await supabaseAdmin
    .from('properties')
    .select('zip')
    .ilike('city', cityName)
    .not('zip', 'is', null)
    .limit(5000)

  const zipCounts: Record<string, number> = {}
  for (const r of (zipData ?? []) as { zip: string }[]) {
    if (r.zip) zipCounts[r.zip] = (zipCounts[r.zip] ?? 0) + 1
  }
  const topZips = Object.entries(zipCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  const top5 = rows.slice(0, 5)

  // Derive stats
  const validScores = rows.map((r) => r.opportunity_score ?? 0).filter((s) => s > 0)
  const avgScore = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0
  const topScore = validScores[0] ?? 0

  const leadCounts: Record<string, number> = {}
  for (const r of rows) {
    leadCounts[r.lead_type] = (leadCounts[r.lead_type] ?? 0) + 1
  }
  const topLeadType = Object.entries(leadCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Mixed'

  const hotLeads = rows.filter((r) => (r.opportunity_score ?? 0) >= 80).length

  // SEO city blurb
  const cityBlurb: Record<string, string> = {
    Phoenix:      'Phoenix is one of the fastest-growing real estate markets in the US, with strong rental demand and a high volume of distressed properties driven by rapid appreciation and investor activity.',
    Miami:        'Miami\'s competitive market produces a steady stream of pre-foreclosures and motivated sellers, especially in suburban neighborhoods outside the luxury core.',
    Dallas:       'Dallas–Fort Worth is a top target for real estate investors, with affordable entry points, population growth, and a large inventory of off-market opportunities.',
    Atlanta:      'Atlanta offers some of the best cash-flow fundamentals in the Southeast, with distressed inventory spread across dozens of zip codes.',
    Chicago:      'Chicago\'s diverse neighborhoods produce a wide mix of distressed signals — from expired listings on the North Side to high-equity opportunities in the suburbs.',
    Cleveland:    'Cleveland consistently ranks among the top cash-flow markets in the country, with low acquisition costs and strong rental yields on distressed properties.',
    Nashville:    'Nashville\'s rapid appreciation has created significant equity in older properties, making it a prime market for finding motivated sellers.',
    Denver:       'Denver\'s high price-per-sqft means equity-rich distressed properties offer significant upside for investors willing to act quickly.',
    Charlotte:    'Charlotte is one of the Southeast\'s most active investment markets, with a growing population and consistent deal flow across all price points.',
    Austin:       'Austin\'s boom-and-correction cycle has created a new wave of motivated sellers, particularly in suburban and semi-rural zip codes.',
    Houston:      'Houston\'s massive size and diverse economy ensure a constant pipeline of distressed properties across every price point and neighborhood type.',
    Tampa:        'Tampa\'s growth as a relocation destination has driven both appreciation and distress, creating opportunities for savvy investors across Hillsborough County.',
    Seattle:      'Seattle\'s high home values mean even modest equity positions represent significant dollar amounts — distressed sellers here often have 40%+ equity.',
    Raleigh:      'Raleigh is one of the nation\'s fastest-growing metros, with strong demand from tech workers and a growing inventory of pre-foreclosure signals.',
    Columbus:     'Columbus offers affordable entry points and strong rental demand, making it a consistent performer for buy-and-hold real estate investors.',
    Indianapolis: 'Indianapolis is a perennial favorite among cash-flow investors, with a large distressed inventory and predictable rental market.',
    'Las Vegas':  'Las Vegas cycles between boom and bust, creating recurring waves of motivated sellers and distressed inventory for well-timed investors.',
    Memphis:      'Memphis is one of the highest-yielding rental markets in the country, with a large volume of distressed single-family properties.',
    Baltimore:    'Baltimore\'s dense urban market has high concentrations of vacant and distressed properties, particularly in transitioning neighborhoods.',
    Pittsburgh:   'Pittsburgh\'s stable economy and low prices make it ideal for buy-and-hold investors looking for consistent yields from distressed acquisitions.',
  }
  const blurb = cityBlurb[cityName] ?? `${cityName} is an active real estate investment market with a consistent pipeline of distressed properties, motivated sellers, and high-equity opportunities.`

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cities" className="hover:text-gray-300 transition-colors">Markets</Link>
          <span>/</span>
          <span className="text-gray-400">{cityName}</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Find Distressed Properties in {cityName}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            {total.toLocaleString()} investment signals updated daily — pre-foreclosures, price drops,
            high-equity owners, and motivated sellers in {cityName}.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Signals',  value: total.toLocaleString(), color: 'text-blue-400' },
            { label: 'Avg Score',      value: `${avgScore}/100`,       color: 'text-white' },
            { label: 'Hot Leads',      value: hotLeads.toLocaleString(), color: 'text-emerald-400' },
            { label: 'Top Lead Type',  value: topLeadType.replace('Pre-Foreclosure', 'Pre-FC').replace('Investor Opportunity', 'Inv. Opp'), color: 'text-yellow-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top 5 teaser table */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden mb-8">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white">Top Signals in {cityName}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Highest opportunity scores — preview only</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-600/10 text-blue-400 font-medium">
              Top score: {topScore}/100
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {top5.map((p, i) => {
              const score = p.opportunity_score ?? 0
              const equity =
                p.estimated_value && p.loan_balance_estimate != null
                  ? p.estimated_value - p.loan_balance_estimate
                  : null
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
                    {equity && equity > 0 && (
                      <span className="text-xs text-emerald-400 hidden sm:block">{fmt(equity)} equity</span>
                    )}
                    <span className={`text-lg font-bold w-10 text-right ${scoreColor(score)}`}>{score}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pro lock row */}
          <div className="px-5 py-4 bg-blue-950/30 border-t border-blue-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-blue-300">
                🔒 Owner contact info hidden — {total.toLocaleString()} more signals available
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

        {/* Lead type breakdown */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5 mb-8">
          <h2 className="text-sm font-bold text-white mb-4">Signal Breakdown in {cityName}</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'Pre-Foreclosure',      label: 'Pre-Foreclosure',       color: 'text-red-400',    bg: 'bg-red-600/10 border-red-600/20' },
              { key: 'Expired Listing',      label: 'Expired Listing',       color: 'text-yellow-400', bg: 'bg-yellow-600/10 border-yellow-600/20' },
              { key: 'Investor Opportunity', label: 'Investor Opp',          color: 'text-blue-400',   bg: 'bg-blue-600/10 border-blue-600/20' },
            ].map((lt) => {
              const c = leadCounts[lt.key] ?? 0
              const pct = rows.length > 0 ? Math.round((c / rows.length) * 100) : 0
              return (
                <div key={lt.key} className={`rounded-lg border p-3 text-center ${lt.bg}`}>
                  <div className={`text-xl font-bold ${lt.color}`}>{pct}%</div>
                  <div className="text-xs text-gray-500 mt-1">{lt.label}</div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-600 mt-3">Based on sample of {rows.length} signals</p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-8 text-center mb-10">
          <h2 className="text-xl font-bold text-white mb-2">
            View All {total.toLocaleString()} Signals in {cityName}
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Full list with opportunity scores, equity data, days on market, and owner contact info for Pro users.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/finder?city=${encodeURIComponent(cityName)}`}
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/25"
            >
              View All {total.toLocaleString()} Signals in {cityName} →
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm transition-colors"
            >
              See Pro Plans
            </Link>
          </div>
        </div>

        {/* SEO body text */}
        <div className="prose prose-invert prose-sm max-w-none">
          <h2 className="text-lg font-bold text-white mb-3">
            Real Estate Investment Signals in {cityName}
          </h2>
          <p className="text-gray-400 leading-relaxed mb-4">{blurb}</p>
          <p className="text-gray-400 leading-relaxed mb-4">
            PropertySignalHQ tracks {total.toLocaleString()} distressed property signals in {cityName},
            scoring each one 0–100 based on price drop percentage, days on market, estimated equity,
            owner distress indicators, and Zillow market data. The higher the score, the stronger the
            off-market opportunity.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Pro members unlock full owner contact information — phone numbers, mailing addresses, and
            skip-trace data — for every signal in {cityName} and all 108 markets we cover.{' '}
            <Link href="/finder" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              Search the full database
            </Link>{' '}
            or{' '}
            <Link href="/analyze" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
              analyze a specific property
            </Link>.
          </p>
        </div>

        {/* Browse by ZIP Code */}
        {topZips.length > 0 && (
          <div className="mt-10 pt-8 border-t border-white/10">
            <h2 className="text-base font-bold text-white mb-1">Browse by ZIP Code</h2>
            <p className="text-xs text-gray-500 mb-5">
              Top ZIP codes in {cityName} by signal volume
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {topZips.map(([zip, cnt]) => (
                <Link
                  key={zip}
                  href={`/cities/${slug}/${zip}`}
                  className="rounded-lg border border-white/10 bg-[#0f172a] p-3 text-center hover:border-blue-500/30 hover:bg-[#0f172a]/80 transition-colors group"
                >
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {zip}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {cnt} signal{cnt !== 1 ? 's' : ''}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <Link href="/cities" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Browse all 108 markets
          </Link>
        </div>
      </div>
    </div>
  )
}
