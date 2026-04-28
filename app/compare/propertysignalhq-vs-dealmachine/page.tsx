import { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'PropertySignalHQ vs DealMachine 2026 — Which Is Better for Investors?',
  description:
    'DealMachine starts at $49/mo and focuses on driving for dollars. PropertySignalHQ gives you 1,000,000+ distressed leads nationwide for $39.99/mo. See the full comparison.',
  openGraph: {
    title: 'PropertySignalHQ vs DealMachine 2026 — Which Is Better for Investors?',
    description:
      'DealMachine starts at $49/mo and focuses on driving for dollars. PropertySignalHQ gives you 1,000,000+ distressed leads nationwide for $39.99/mo.',
    url: 'https://propertysignalhq.com/compare/propertysignalhq-vs-dealmachine',
  },
}

const ROWS = [
  { feature: 'Price',                       pshq: '$39.99/mo',                    dm: '$49–$299/mo' },
  { feature: 'Free trial',                  pshq: '30 days free, no credit card',  dm: '7 days only' },
  { feature: 'Number of listings',          pshq: '1,000,000+ properties',         dm: 'Driving-focused, limited DB' },
  { feature: 'Pre-foreclosure leads',       pshq: true,                            dm: 'Limited' },
  { feature: 'Tax delinquent leads',        pshq: true,                            dm: false },
  { feature: 'Absentee owner leads',        pshq: true,                            dm: true },
  { feature: 'Skip tracing',               pshq: 'Coming soon',                   dm: 'Paid add-on' },
  { feature: 'Data export (CSV)',           pshq: true,                            dm: 'Limited' },
  { feature: 'Built for wholesalers/flippers', pshq: true,                        dm: 'Beginners only' },
  { feature: 'Contract required',           pshq: false,                           dm: false },
]

const FAQ = [
  {
    q: 'Is DealMachine worth it in 2026?',
    a: 'DealMachine is best for beginners who want to drive for dollars. Investors who want nationwide distressed property data without driving need a database-first platform.',
  },
  {
    q: 'What is cheaper than DealMachine?',
    a: 'PropertySignalHQ at $39.99/mo is cheaper than DealMachine\'s mid and upper tiers and includes 1,000,000+ nationwide leads without any driving required.',
  },
  {
    q: 'Does DealMachine have pre-foreclosure data?',
    a: 'DealMachine has limited pre-foreclosure data. It primarily focuses on properties found through driving for dollars rather than courthouse filings or tax records.',
  },
  {
    q: 'Can DealMachine replace PropStream?',
    a: 'No — DealMachine and PropStream serve different use cases. DealMachine is a route-tracking app while PropStream is a data platform. PropertySignalHQ competes more directly with PropStream.',
  },
  {
    q: 'Who is DealMachine best for?',
    a: 'DealMachine is best for new wholesalers just starting out with driving for dollars. Experienced investors typically outgrow it quickly and need broader data access.',
  },
]

function CellValue({ val }: { val: boolean | string }) {
  if (val === true) {
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-sm">✓</span>
  }
  if (val === false) {
    return <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-gray-500 font-bold text-sm">—</span>
  }
  return <span className="text-sm text-gray-300">{val}</span>
}

const faqSchema = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
})

export default function ComparisonPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

      <div className="min-h-screen bg-[#020617] text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/compare" className="hover:text-gray-300 transition-colors">Compare</Link>
            <span>/</span>
            <span className="text-gray-400">vs DealMachine</span>
          </nav>

          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
              2026 Comparison
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
              PropertySignalHQ vs DealMachine (2026) — Honest Comparison
            </h1>
            <p className="text-base text-gray-400 leading-relaxed max-w-2xl">
              DealMachine is a driving-for-dollars mobile app. PropertySignalHQ is a nationwide
              distressed property database. This comparison is for wholesalers and flippers deciding
              which tool — or combination — fits their lead generation workflow in 2026.
            </p>
          </div>

          {/* Comparison table */}
          <div className="rounded-xl border border-white/10 overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0f172a]">
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4 w-1/3">
                      Feature
                    </th>
                    <th className="text-center px-5 py-4 w-1/3 bg-blue-950/40 border-x border-blue-500/20">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          PropertySignalHQ
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                          Best Value
                        </span>
                      </div>
                    </th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4 w-1/3">
                      DealMachine
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ROWS.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={i % 2 === 0 ? 'bg-[#0a0f1e]' : 'bg-[#080c18]'}
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-300">
                        {row.feature}
                      </td>
                      <td className="px-5 py-3.5 text-center bg-blue-950/20 border-x border-blue-500/10">
                        <CellValue val={row.pshq} />
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <CellValue val={row.dm} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Why choose PropertySignalHQ */}
          <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6 mb-10">
            <h2 className="text-lg font-black text-white mb-4">
              Why investors choose PropertySignalHQ
            </h2>
            <ul className="space-y-3">
              {[
                {
                  title: 'No driving required — 1,000,000+ leads nationwide',
                  body: 'PropertySignalHQ pulls pre-foreclosure filings, tax delinquency records, and absentee ownership data from county sources across 125+ cities. Every lead is scored 0–100 so you start your day with the highest-urgency properties already ranked.',
                },
                {
                  title: 'Lower entry price with a real free trial',
                  body: 'At $39.99/mo, PropertySignalHQ costs less than DealMachine\'s starter plan — and the 30-day free trial (no credit card) gives you time to verify coverage in your target market and run a real outreach campaign before paying anything.',
                },
                {
                  title: 'Built for data-driven investors, not just drivers',
                  body: 'DealMachine is purpose-built for finding properties by driving neighborhoods. PropertySignalHQ is built for investors who want courthouse-filing data, tax records, and stacked distress signals surfaced automatically — without leaving their desk.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">✓</span>
                  <div>
                    <span className="text-sm font-semibold text-white">{item.title} — </span>
                    <span className="text-sm text-gray-400">{item.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Primary CTA */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-8 text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">No Credit Card Required</p>
            <h2 className="text-2xl font-black text-white mb-3">
              Try PropertySignalHQ Free for 30 Days
            </h2>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              1,000,000+ pre-scored distressed property leads across 125+ cities. Pre-foreclosure,
              tax delinquent, and absentee owner lists — updated weekly. No contract, cancel anytime.
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-black text-base transition-colors shadow-xl shadow-blue-600/30"
            >
              Start Free Trial — No Credit Card →
            </Link>
            <p className="text-xs text-gray-600 mt-4">30 days free · $39.99/mo after · Cancel anytime</p>
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
            <Link href="/compare" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← All Comparisons</Link>
            <Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">See Pricing</Link>
            <Link href="/leads/pre-foreclosure" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Pre-Foreclosure Leads</Link>
          </div>

        </div>
      </div>
    </>
  )
}
