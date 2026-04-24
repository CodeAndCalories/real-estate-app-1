import { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tax Delinquent Property Leads 2026 — Nationwide List | PropertySignalHQ',
  description:
    'Access tax delinquent property leads across all 50 states. Owners with overdue taxes and growing lien balances are among the most motivated sellers. Start free — no credit card required.',
  openGraph: {
    title: 'Tax Delinquent Property Leads 2026 — Nationwide List | PropertySignalHQ',
    description:
      'Access tax delinquent property leads across all 50 states. Updated weekly. Start free — no credit card required.',
    url: 'https://propertysignalhq.com/leads/tax-delinquent',
  },
}

const FAQ = [
  {
    q: 'What does tax delinquent mean for a property?',
    a: "A property becomes tax delinquent when the owner fails to pay their annual property tax bill by the county's deadline. Most counties apply penalties and interest on unpaid balances — often 12–18% annually — and will eventually initiate a tax lien sale or tax deed foreclosure. The owner is still legally obligated to pay and still holds title, but faces mounting financial pressure the longer they wait.",
  },
  {
    q: 'How far behind on taxes does an owner need to be before they become a strong lead?',
    a: '1–2+ years of delinquency is typically the sweet spot. At that point, penalties and interest have compounded significantly, the county is approaching a tax lien or tax deed action, and the owner faces a real deadline. A homeowner 60 days late on a $400 bill is very different from one 2 years behind with a lien sale scheduled next month.',
  },
  {
    q: "Can a homeowner still sell a tax delinquent property?",
    a: 'Yes — in most cases, the owner retains the right to sell the property right up until the tax sale date. A cash offer structured to pay off the delinquent balance at closing — while leaving the seller with remaining equity — is often an attractive alternative to losing the property entirely at a tax auction.',
  },
  {
    q: "What's the difference between a tax lien and a tax deed?",
    a: 'A tax lien is a legal claim placed on a property for unpaid taxes. In tax lien states, investors can purchase the lien and collect interest (often 10–36%) until the owner redeems it or the property goes to sale. A tax deed sale transfers ownership of the property itself after the redemption period expires. Investors can profit from either approach, but the timelines and strategies differ.',
  },
  {
    q: 'How does PropertySignalHQ score tax delinquent leads?',
    a: 'PropertySignalHQ scores every tax delinquent property 0–100 based on stacked distress signals. A property that is tax delinquent AND absentee-owned AND in pre-foreclosure scores far higher than one with only a minor tax balance. The highest-score leads represent the most motivated sellers — multiple financial pressures stacking on a single owner.',
  },
]

export default async function TaxDelinquentPage() {
  const [{ count: national }, { data: stateRows }] = await Promise.all([
    supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('tax_delinquent', true),
    supabaseAdmin
      .from('properties')
      .select('state')
      .eq('tax_delinquent', true)
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
          <span className="text-gray-400">Tax Delinquent Leads</span>
        </nav>

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
            High Financial Pressure
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            Tax Delinquent Property Leads — Nationwide List
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            {totalCount > 0
              ? `${totalCount.toLocaleString()} properties with overdue tax obligations across all 50 states. Owners under compounding penalty pressure — updated weekly.`
              : 'Properties with overdue tax obligations and growing lien balances across all 50 states. Among the most motivated seller segments in real estate.'}
          </p>
        </div>

        {/* National count highlight */}
        {totalCount > 0 && (
          <div className="rounded-xl border border-orange-500/20 bg-orange-950/20 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-4xl font-black text-orange-400">{totalCount.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">Tax Delinquent Leads Nationwide</div>
            </div>
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-colors shadow-lg shadow-orange-600/25 whitespace-nowrap"
            >
              Access All Leads →
            </Link>
          </div>
        )}

        {/* Top 10 states */}
        {topStates.length > 0 && (
          <div className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Top 10 States by Tax Delinquent Volume</h2>
              <p className="text-xs text-gray-500 mt-0.5">States with the highest number of tax delinquent property signals</p>
            </div>
            <ul className="divide-y divide-white/5">
              {topStates.map(([state, count], i) => (
                <li key={state} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm font-bold text-gray-600 w-6 flex-shrink-0">#{i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-gray-200">{state}</span>
                  <span className="text-sm font-bold text-orange-400">{count.toLocaleString()} leads</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What are tax delinquent leads */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-5 mb-8">
          <h2 className="text-sm font-bold text-white mb-3">Why Tax Delinquent Owners Are Motivated Sellers</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            Unpaid property taxes compound with penalties and interest — often 12–18% annually. Every month the balance grows, the deadline to a tax lien sale or tax deed auction gets closer, and the owner faces the prospect of losing their property entirely for a fraction of its value.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Many long-term tax delinquent owners have significant equity — they've owned the property for years but hit a financial rough patch. A cash offer that pays off their delinquent balance at closing while leaving them with remaining equity is often worth more than risking a forced auction. PropertySignalHQ surfaces these leads nationwide and scores each one based on urgency, equity position, and additional distress signals.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-950/60 to-amber-950/60 p-8 text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">30-Day Free Trial</p>
          <h2 className="text-2xl font-black text-white mb-3">
            Start Your Free 30-Day Trial — No Credit Card Required
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            Full access to tax delinquent leads nationwide with opportunity scores, equity data,
            and owner contact info. Filter by state, signal type, and minimum score. No commitment.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black text-base transition-colors shadow-xl shadow-orange-600/30"
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
          <Link href="/leads/absentee-owner" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Absentee Owner Leads</Link>
          <Link href="/states" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Browse by State</Link>
        </div>

      </div>
    </div>
  )
}
