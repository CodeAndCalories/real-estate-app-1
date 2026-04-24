import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

// ── State slug → display name ─────────────────────────────────────────────────

const US_STATES: { slug: string; name: string }[] = [
  { slug: 'alabama',        name: 'Alabama' },
  { slug: 'alaska',         name: 'Alaska' },
  { slug: 'arizona',        name: 'Arizona' },
  { slug: 'arkansas',       name: 'Arkansas' },
  { slug: 'california',     name: 'California' },
  { slug: 'colorado',       name: 'Colorado' },
  { slug: 'connecticut',    name: 'Connecticut' },
  { slug: 'delaware',       name: 'Delaware' },
  { slug: 'florida',        name: 'Florida' },
  { slug: 'georgia',        name: 'Georgia' },
  { slug: 'hawaii',         name: 'Hawaii' },
  { slug: 'idaho',          name: 'Idaho' },
  { slug: 'illinois',       name: 'Illinois' },
  { slug: 'indiana',        name: 'Indiana' },
  { slug: 'iowa',           name: 'Iowa' },
  { slug: 'kansas',         name: 'Kansas' },
  { slug: 'kentucky',       name: 'Kentucky' },
  { slug: 'louisiana',      name: 'Louisiana' },
  { slug: 'maine',          name: 'Maine' },
  { slug: 'maryland',       name: 'Maryland' },
  { slug: 'massachusetts',  name: 'Massachusetts' },
  { slug: 'michigan',       name: 'Michigan' },
  { slug: 'minnesota',      name: 'Minnesota' },
  { slug: 'mississippi',    name: 'Mississippi' },
  { slug: 'missouri',       name: 'Missouri' },
  { slug: 'montana',        name: 'Montana' },
  { slug: 'nebraska',       name: 'Nebraska' },
  { slug: 'nevada',         name: 'Nevada' },
  { slug: 'new-hampshire',  name: 'New Hampshire' },
  { slug: 'new-jersey',     name: 'New Jersey' },
  { slug: 'new-mexico',     name: 'New Mexico' },
  { slug: 'new-york',       name: 'New York' },
  { slug: 'north-carolina', name: 'North Carolina' },
  { slug: 'north-dakota',   name: 'North Dakota' },
  { slug: 'ohio',           name: 'Ohio' },
  { slug: 'oklahoma',       name: 'Oklahoma' },
  { slug: 'oregon',         name: 'Oregon' },
  { slug: 'pennsylvania',   name: 'Pennsylvania' },
  { slug: 'rhode-island',   name: 'Rhode Island' },
  { slug: 'south-carolina', name: 'South Carolina' },
  { slug: 'south-dakota',   name: 'South Dakota' },
  { slug: 'tennessee',      name: 'Tennessee' },
  { slug: 'texas',          name: 'Texas' },
  { slug: 'utah',           name: 'Utah' },
  { slug: 'vermont',        name: 'Vermont' },
  { slug: 'virginia',       name: 'Virginia' },
  { slug: 'washington',     name: 'Washington' },
  { slug: 'west-virginia',  name: 'West Virginia' },
  { slug: 'wisconsin',      name: 'Wisconsin' },
  { slug: 'wyoming',        name: 'Wyoming' },
]

const SLUG_TO_STATE: Record<string, string> = Object.fromEntries(
  US_STATES.map(({ slug, name }) => [slug, name])
)

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ state: string }[]> {
  return US_STATES.map(({ slug }) => ({ state: slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ state: string }> }
): Promise<Metadata> {
  const { state: slug } = await params
  const stateName = SLUG_TO_STATE[slug]
  if (!stateName) return {}

  const { count } = await supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .ilike('state', stateName)

  const total = count ?? 0

  const title = `Pre-Foreclosure & Motivated Seller Leads in ${stateName} (2026) | PropertySignalHQ`
  const description = `Find ${total.toLocaleString()} distressed property leads in ${stateName}. Pre-foreclosure, absentee owners, and tax delinquent lists updated weekly. Start free.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://propertysignalhq.com/states/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function StatePage(
  { params }: { params: Promise<{ state: string }> }
) {
  const { state: slug } = await params
  const stateName = SLUG_TO_STATE[slug]

  if (!stateName) notFound()

  const [
    { count: totalCount },
    { count: preFCCount },
    { count: absenteeCount },
    { count: taxDelCount },
    { data: cityRows },
  ] = await Promise.all([
    supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .ilike('state', stateName),
    supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .ilike('state', stateName)
      .eq('lead_type', 'Pre-Foreclosure'),
    supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .ilike('state', stateName)
      .eq('absentee_owner', true),
    supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .ilike('state', stateName)
      .eq('tax_delinquent', true),
    supabaseAdmin
      .from('properties')
      .select('city')
      .ilike('state', stateName)
      .not('city', 'is', null)
      .limit(5000),
  ])

  const total = totalCount ?? 0
  if (total === 0) notFound()

  // Top 5 cities by property count
  const cityCounts: Record<string, number> = {}
  for (const row of (cityRows ?? [])) {
    if (row.city) cityCounts[row.city] = (cityCounts[row.city] ?? 0) + 1
  }
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const preFC     = preFCCount ?? 0
  const absentee  = absenteeCount ?? 0
  const taxDel    = taxDelCount ?? 0

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/states" className="hover:text-gray-300 transition-colors">States</Link>
          <span>/</span>
          <span className="text-gray-400">{stateName}</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            Distressed Property Leads in {stateName}
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            {total.toLocaleString()} motivated seller signals across {stateName} — pre-foreclosure,
            absentee owners, and tax delinquent properties updated weekly.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/25"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/finder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm transition-colors"
            >
              Browse All Signals
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Signals',     value: total.toLocaleString(),    color: 'text-blue-400' },
            { label: 'Pre-Foreclosure',   value: preFC.toLocaleString(),    color: 'text-red-400' },
            { label: 'Absentee Owner',    value: absentee.toLocaleString(), color: 'text-purple-400' },
            { label: 'Tax Delinquent',    value: taxDel.toLocaleString(),   color: 'text-orange-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[#0f172a] p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top cities table */}
        {topCities.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Top Markets in {stateName}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Cities ranked by number of distressed property signals</p>
            </div>

            <div className="divide-y divide-white/5">
              {topCities.map(([city, count], i) => (
                <div key={city} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-gray-600 w-5 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200">{city}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{count.toLocaleString()} signals</p>
                  </div>
                  <Link
                    href={`/cities/${cityToSlug(city)}`}
                    className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap transition-colors flex-shrink-0"
                  >
                    View Market →
                  </Link>
                </div>
              ))}
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
        )}

        {/* Lead type breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: 'Pre-Foreclosure',
              count: preFC,
              color: 'text-red-400',
              border: 'border-red-500/20',
              bg: 'bg-red-950/20',
              desc: 'Homeowners 90+ days behind on mortgage payments facing foreclosure proceedings.',
            },
            {
              label: 'Absentee Owners',
              count: absentee,
              color: 'text-purple-400',
              border: 'border-purple-500/20',
              bg: 'bg-purple-950/20',
              desc: 'Properties where the owner lives out of state — highly motivated to sell.',
            },
            {
              label: 'Tax Delinquent',
              count: taxDel,
              color: 'text-orange-400',
              border: 'border-orange-500/20',
              bg: 'bg-orange-950/20',
              desc: 'Properties with overdue tax obligations and owners under financial pressure.',
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-5`}>
              <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.count.toLocaleString()}</div>
              <div className="text-sm font-semibold text-white mb-2">{s.label}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* SEO body text */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5 mb-8">
          <h2 className="text-sm font-bold text-white mb-3">
            Motivated Seller Leads in {stateName} — Updated Weekly
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            PropertySignalHQ tracks {total.toLocaleString()} distressed properties across {stateName},
            combining pre-foreclosure filings, absentee owner records, and tax delinquency data into
            a single ranked lead list. Each signal includes an opportunity score (0–100), estimated
            property value, equity position, and days on market so investors can prioritize the best
            deals. {preFC > 0 && `${preFC.toLocaleString()} properties in ${stateName} are flagged as pre-foreclosure — the highest-urgency lead type with motivated sellers facing imminent auction. `}
            {taxDel > 0 && `${taxDel.toLocaleString()} properties show tax delinquency, signaling financial distress and willingness to sell below market. `}
            Start your free trial to access owner phone numbers, mailing addresses, and skip-trace data.
          </p>
        </div>

        {/* CTA section */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-8 text-center mb-10">
          <h2 className="text-xl font-bold text-white mb-2">
            Access All {total.toLocaleString()} {stateName} Leads
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Pre-foreclosure, absentee owner, and tax delinquent lists with owner contact info —
            updated weekly. No contracts, cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/25"
            >
              Start Free Trial →
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-sm transition-colors"
            >
              See Pro Plans
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-white/10 flex items-center gap-6">
          <Link href="/states" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Browse all states
          </Link>
          <Link href="/cities" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Browse all markets
          </Link>
        </div>

      </div>
    </div>
  )
}
