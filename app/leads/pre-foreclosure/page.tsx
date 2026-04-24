import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pre-Foreclosure Leads List 2026 — All 50 States | PropertySignalHQ',
  description:
    'Find pre-foreclosure property leads across all 50 states. Updated weekly from public court filings. Filter by state, score, and equity position. Start free — no credit card required.',
  openGraph: {
    title: 'Pre-Foreclosure Leads List 2026 — All 50 States | PropertySignalHQ',
    description:
      'Find pre-foreclosure property leads across all 50 states. Updated weekly from public court filings.',
    url: 'https://propertysignalhq.com/leads/pre-foreclosure',
  },
}

const FAQ = [
  {
    q: 'What is a pre-foreclosure property?',
    a: 'A pre-foreclosure property is one where the homeowner has fallen 90+ days behind on mortgage payments and the lender has filed a notice of default — a public record marking the start of foreclosure proceedings. The owner still holds title and can sell before the bank takes possession, creating a motivated-seller window for investors.',
  },
  {
    q: 'How early should I contact homeowners in pre-foreclosure?',
    a: 'The earlier the better. The pre-foreclosure window in most states runs 90–180 days from the notice of default to the foreclosure auction. Contacting an owner in the first 30–60 days of that window gives you the best chance at a deal — they still have time and options. Investors who show up at the courthouse steps on auction day are competing on price, not on solutions.',
  },
  {
    q: "What's the difference between pre-foreclosure and foreclosure?",
    a: "Pre-foreclosure is the period after a lender files a notice of default but before the property goes to auction or the bank repossesses it. The owner still holds title and can sell or refinance. Foreclosure is when the bank takes ownership — usually through an auction. Pre-foreclosure leads are more valuable because you can negotiate directly with the homeowner rather than compete at auction.",
  },
  {
    q: 'Are pre-foreclosure leads legal to market to?',
    a: "Yes. Pre-foreclosure filings are public records — filed with county courts and accessible to anyone. There are no federal restrictions on contacting homeowners in pre-foreclosure. Some states have specific rules around foreclosure consultant services, so consult local counsel if you're providing advice beyond a straight purchase offer.",
  },
  {
    q: 'How does PropertySignalHQ score pre-foreclosure leads?',
    a: 'Every pre-foreclosure property receives a 0–100 opportunity score based on stacked distress signals. A property that is pre-foreclosure AND tax delinquent AND absentee-owned scores significantly higher than one with only a single missed payment. The highest-score leads surface the most motivated sellers. Filter by minimum score to work only your top-priority targets.',
  },
]

export default async function PreForeclosurePage() {
  const [{ count: national }, { data: stateRows }] = await Promise.all([
    supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('lead_type', 'Pre-Foreclosure'),
    supabaseAdmin
      .from('properties')
      .select('state')
      .eq('lead_type', 'Pre-Foreclosure')
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
          <span className="text-gray-400">Pre-Foreclosure Leads</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-4">
            Highest-Urgency Lead Type
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            Pre-Foreclosure Leads — All 50 States
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} homeowners facing foreclosure proceedings across all 50 states. Updated weekly from public court filings — before they hit any auction.`
              : 'Homeowners 90+ days behind on mortgage payments with a window to sell before foreclosure closes. Updated weekly from public court filings.'}
          </p>
        </div>

        {/* National count highlight */}
        {totalCount > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-4xl font-black text-red-400">{totalCount.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Pre-Foreclosure Leads Nationwide</div>
            </div>
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-600/25 whitespace-nowrap"
            >
              Access All Leads →
            </Link>
          </div>
        )}

        {/* Top 10 states */}
        {topStates.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Top 10 States by Pre-Foreclosure Volume</h2>
              <p className="text-xs text-gray-500 mt-0.5">States with the highest number of active pre-foreclosure signals</p>
            </div>
            <ul className="divide-y divide-white/5">
              {topStates.map(([state, count], i) => (
                <li key={state} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-bold text-gray-600 w-6 flex-shrink-0">#{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-gray-200">{state}</span>
                  <span className="text-sm font-bold text-red-400">{count.toLocaleString()} leads</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What are pre-foreclosure leads */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5 mb-8">
          <h2 className="text-sm font-bold text-white mb-3">What Are Pre-Foreclosure Leads?</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            Pre-foreclosure leads are homeowners who have received a notice of default from their lender — typically after missing 3+ mortgage payments. They still own the property but face a deadline before the bank repossesses it or sells it at auction.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            This 90–180 day window is your opportunity. The owner needs a solution. A cash offer that closes fast, lets them avoid foreclosure on their record, and puts money in their pocket is often worth more to them than maximizing the sale price. PropertySignalHQ tracks these filings across all 50 states and scores each lead based on urgency, equity position, and overlapping distress signals.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/60 to-orange-950/60 p-8 text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">Limited-Time Offer</p>
          <h2 className="text-2xl font-black text-white mb-3">
            Start Your Free 30-Day Trial — No Credit Card Required
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Full access to pre-foreclosure leads across all 50 states with opportunity scores,
            equity data, and owner contact info for Pro members.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-black text-base transition-colors shadow-xl shadow-red-600/30"
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
          <Link href="/leads/tax-delinquent" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Tax Delinquent Leads</Link>
          <Link href="/leads/absentee-owner" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Absentee Owner Leads</Link>
          <Link href="/states" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Browse by State</Link>
        </div>

      </div>
    </div>
  )
}
