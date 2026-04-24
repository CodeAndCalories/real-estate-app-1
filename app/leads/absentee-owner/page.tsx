import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Absentee Owner Leads 2026 — Find Motivated Sellers | PropertySignalHQ',
  description:
    'Find absentee owner property leads across all 50 states. Landlords, inherited properties, and out-of-state owners — among the most consistently motivated sellers. Start free.',
  openGraph: {
    title: 'Absentee Owner Leads 2026 — Find Motivated Sellers | PropertySignalHQ',
    description:
      'Find absentee owner property leads across all 50 states. Updated weekly. Start free — no credit card required.',
    url: 'https://propertysignalhq.com/leads/absentee-owner',
  },
}

const FAQ = [
  {
    q: 'What is an absentee owner property?',
    a: "An absentee owner property is one where the owner's mailing address doesn't match the property address — they own the home but don't live there. This includes landlords who own rentals in other cities, heirs who inherited a property they don't want to manage, relocated owners who kept their old home, and out-of-state investors. The mailing address mismatch is tracked in county tax records and is the primary signal for absentee ownership.",
  },
  {
    q: 'Why do absentee owners sell at a discount?',
    a: 'Three factors push absentee owners toward discounted sales: distance (managing a property from another city or state is expensive and stressful), emotional detachment (unlike an owner-occupant, many absentee owners — especially heirs — have limited attachment to the property), and carrying costs (an absentee owner paying taxes, insurance, and maintenance on a vacant or under-performing asset has real monthly costs with no benefit). These combine to create sellers who prioritize speed and certainty over maximum price.',
  },
  {
    q: 'How do I find absentee owner properties for free?',
    a: "County tax assessor websites track owner mailing addresses separately from property addresses. You can download or filter property records to identify where the owner address differs from the property address. The process is manual, limited to one county at a time, and requires cross-referencing multiple data sources — but the underlying data is public.",
  },
  {
    q: "What's the best way to contact absentee owners?",
    a: "Direct mail to the owner's mailing address is the most reliable first contact — it reaches them where they actually live. Skip tracing services can surface phone numbers for follow-up calls. A personalized letter that acknowledges their specific situation (distance, cost of ownership, difficulty managing from afar) significantly outperforms generic 'we buy houses' templates. Follow up 4–5 times over 90 days before moving on.",
  },
  {
    q: 'Does absentee ownership alone make someone a motivated seller?',
    a: 'Not always — but it is a meaningful starting signal. The strongest leads combine multiple factors: absentee ownership plus tax delinquency, or absentee ownership plus pre-foreclosure, or absentee ownership on a vacant property. PropertySignalHQ scores every property 0–100 based on stacked signals, so you can filter for absentee owners who also carry other distress indicators — those are your highest-probability targets.',
  },
]

export default async function AbsenteeOwnerPage() {
  const [{ count: national }, { data: stateRows }] = await Promise.all([
    supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('absentee_owner', true),
    supabaseAdmin
      .from('properties')
      .select('state')
      .eq('absentee_owner', true)
      .not('state', 'is', null)
      .limit(5000),
  ])

  const totalCount = national ?? 0

  const stateCounts: Record<string, number> = {}
  for (const row of (stateRows ?? [])) {
    if (row.state) stateCounts[row.state] = (stateCounts[row.state] ?? 0) + 1
  }
  const topStates = Object.entries(stateCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Absentee Owner Leads</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-4">
            Consistently Motivated Sellers
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            Absentee Owner Leads — Find Motivated Sellers Nationwide
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} properties owned by out-of-state or non-resident owners across all 50 states. Landlords, heirs, and relocated owners — updated weekly.`
              : 'Owners who live somewhere other than their property — landlords, heirs, relocated owners — are among the most consistently motivated sellers in real estate.'}
          </p>
        </div>

        {/* National count highlight */}
        {totalCount > 0 && (
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-4xl font-black text-purple-400">{totalCount.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Absentee Owner Leads Nationwide</div>
            </div>
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors shadow-lg shadow-purple-600/25 whitespace-nowrap"
            >
              Access All Leads →
            </Link>
          </div>
        )}

        {/* Top 10 states */}
        {topStates.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Top 10 States by Absentee Owner Volume</h2>
              <p className="text-xs text-gray-500 mt-0.5">States with the highest number of absentee owner property signals</p>
            </div>
            <ul className="divide-y divide-white/5">
              {topStates.map(([state, count], i) => (
                <li key={state} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-bold text-gray-600 w-6 flex-shrink-0">#{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-gray-200">{state}</span>
                  <span className="text-sm font-bold text-purple-400">{count.toLocaleString()} leads</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Why absentee owners section */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5 mb-8">
          <h2 className="text-sm font-bold text-white mb-3">Why Absentee Owners Are High-Value Leads</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            Absentee owners face a combination of factors that push them toward selling: distance from the property makes maintenance and management difficult, carrying costs accumulate every month the property sits, and many — especially heirs — have limited emotional attachment to the home.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            When absentee ownership stacks with other distress signals — tax delinquency, pre-foreclosure, vacancy, or a recent price drop — motivation intensifies. PropertySignalHQ scores these combinations 0–100 so you can target the highest-urgency absentee owners first, not just anyone whose mailing address doesn't match their property.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-950/60 to-indigo-950/60 p-8 text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">30-Day Free Trial</p>
          <h2 className="text-2xl font-black text-white mb-3">
            Start Your Free 30-Day Trial — No Credit Card Required
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Full access to absentee owner leads nationwide with opportunity scores, equity data,
            and owner mailing addresses. Filter by state and stack with tax delinquency or pre-foreclosure. No commitment.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-base transition-colors shadow-xl shadow-purple-600/30"
          >
            Start Free Trial — No Credit Card →
          </Link>
          <p className="text-xs text-gray-600 mt-4">30 days free · $39/mo after · Cancel anytime</p>
        </div>

        {/* FAQ */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#0f172a] p-5">
                <h3 className="text-sm font-bold text-white mb-2">{item.q}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer nav */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Home</Link>
          <Link href="/leads/pre-foreclosure" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Pre-Foreclosure Leads</Link>
          <Link href="/leads/tax-delinquent" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Tax Delinquent Leads</Link>
          <Link href="/states" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Browse by State</Link>
        </div>

      </div>
    </div>
  )
}
