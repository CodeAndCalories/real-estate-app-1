import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Looking for a BatchLeads Alternative? Try PropertySignalHQ',
  description:
    'PropertySignalHQ is a BatchLeads alternative for real estate investors. Flat $39/mo, no per-record fees, opportunity scoring, and Zillow market data. Free to explore.',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TABLE_ROWS = [
  {
    feature: 'Monthly Price',
    pshq: { text: '$39/mo flat',       highlight: true  },
    bl:   { text: '$77–$197/mo',       highlight: false },
  },
  {
    feature: 'Per-Record Fees',
    pshq: { text: 'None',              check: true  },
    bl:   { text: 'Yes, for exports',  check: false },
  },
  {
    feature: 'Free to Explore',
    pshq: { text: 'No credit card',   check: true  },
    bl:   { text: 'Free trial',        check: false },
  },
  {
    feature: 'Opportunity Scoring',
    pshq: { text: '0–100 AI score',   check: true  },
    bl:   { text: '—',               check: false },
  },
  {
    feature: 'Market Temperature',
    pshq: { text: 'Zillow-powered',   check: true  },
    bl:   { text: '—',               check: false },
  },
  {
    feature: 'Owner Contact Info',
    pshq: { text: 'Included',         check: true  },
    bl:   { text: 'Included',         check: true  },
  },
  {
    feature: 'Skip Tracing',
    pshq: { text: '—',               check: false },
    bl:   { text: 'Included',         check: true  },
  },
  {
    feature: 'List Stacking',
    pshq: { text: '—',               check: false },
    bl:   { text: 'Core feature',     check: true  },
  },
  {
    feature: 'Deal Alerts',
    pshq: { text: 'Included',         check: true  },
    bl:   { text: 'Included',         check: true  },
  },
  {
    feature: 'Analyze Any Deal',
    pshq: { text: 'Free tool',        check: true  },
    bl:   { text: '—',               check: false },
  },
  {
    feature: 'Free Market Reports',
    pshq: { text: 'Any city',         check: true  },
    bl:   { text: '—',               check: false },
  },
  {
    feature: 'CSV Export',
    pshq: { text: 'Included',         check: true  },
    bl:   { text: 'Per-record cost',  check: false },
  },
  {
    feature: 'No Contract',
    pshq: { text: 'Cancel anytime',   check: true  },
    bl:   { text: 'Cancel anytime',   check: true  },
  },
]

const PSHQ_FITS = [
  'You want a flat monthly price with no per-record fees',
  'You want opportunity scores to automatically prioritize leads',
  'You want Zillow market temperature data built into your workflow',
  'You want to analyze any deal for free before committing',
]

const BL_FITS = [
  'You need advanced list stacking across multiple data sources',
  'You rely heavily on built-in skip tracing',
  'You work with very large lead lists and need bulk data tools',
  'You are already familiar with the BatchLeads platform',
]

const FAQS = [
  {
    q: 'Is PropertySignalHQ a BatchLeads replacement?',
    a: 'For some investors, yes — particularly those who want opportunity scoring and flat pricing without per-record fees. BatchLeads has deep list stacking and skip tracing features that PropertySignalHQ does not currently offer. We recommend evaluating both.',
  },
  {
    q: 'How does the pricing compare?',
    a: 'PropertySignalHQ is $39/month flat with no per-record export fees. BatchLeads ranges from $77 to $197/month, with additional per-record costs for data exports. Both are month-to-month.',
  },
  {
    q: 'Can I use PropertySignalHQ alongside BatchLeads?',
    a: 'Yes — some investors use BatchLeads for list building and skip tracing, and PropertySignalHQ for daily opportunity scoring, deal alerts, and market analysis. The two tools complement each other well.',
  },
]

// ── Cell renderer ─────────────────────────────────────────────────────────────

function Cell({
  text,
  check,
  highlight,
  isPshq,
}: {
  text:       string
  check?:     boolean
  highlight?: boolean
  isPshq:     boolean
}) {
  const isBlank = text === '—'
  return (
    <td className={`px-5 py-3.5 text-sm text-center align-middle ${isPshq ? 'bg-blue-500/5' : ''}`}>
      {check === true ? (
        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="text-base leading-none">✓</span>
          <span className="text-gray-200">{text}</span>
        </span>
      ) : isBlank ? (
        <span className="text-gray-600 text-base">—</span>
      ) : (
        <span className={isPshq && highlight ? 'text-blue-300 font-bold' : 'text-gray-400'}>
          {text}
        </span>
      )}
    </td>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VsBatchLeadsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
              className="group-hover:opacity-80 transition-opacity">
              <path d="M12 32V8H22C26.4183 8 30 11.5817 30 16C30 20.4183 26.4183 24 22 24H18.5L12 32Z" fill="white"/>
              <path d="M10 26L18 18" stroke="#020617" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-bold text-white">
              PropertySignal<span className="text-blue-400">HQ</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Free
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Hero ────────────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            Comparison
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
            Looking for a BatchLeads Alternative?
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            Both are real estate investor tools — here's an honest look at how they differ,
            who each is best for, and which fits your investing style.
          </p>
          <p className="text-xs text-gray-600 max-w-xl mx-auto">
            All information about BatchLeads based on publicly available data as of March 2026.
            We respect BatchLeads and recommend evaluating both tools for your needs.
          </p>
        </section>

        {/* ── Intro ───────────────────────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl px-7 py-6 text-gray-300 text-base leading-relaxed">
            BatchLeads is a well-regarded platform known for list stacking, skip tracing, and
            large-scale lead generation. PropertySignalHQ takes a different approach — a flat
            $39/month with no per-record fees, built-in opportunity scoring, and Zillow-powered
            market data. Neither is objectively better; it depends on how you build your pipeline.
          </div>
        </section>

        {/* ── Comparison table ─────────────────────────────────────────────────── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Feature Comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[40%]">
                    Feature
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider w-[30%] bg-blue-500/5">
                    <span className="text-blue-400">PropertySignalHQ</span>
                    <span className="block text-[10px] text-blue-500/60 font-normal normal-case mt-0.5">$39/mo flat</span>
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                    BatchLeads
                    <span className="block text-[10px] text-gray-600 font-normal normal-case mt-0.5">$77–$197/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-[#020617]' : 'bg-[#060d1a]'}`}
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-300 font-medium">{row.feature}</td>
                    <Cell
                      text={row.pshq.text}
                      check={'check' in row.pshq ? row.pshq.check : undefined}
                      highlight={'highlight' in row.pshq ? row.pshq.highlight : undefined}
                      isPshq={true}
                    />
                    <Cell
                      text={row.bl.text}
                      check={'check' in row.bl ? row.bl.check : undefined}
                      highlight={false}
                      isPshq={false}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Who each is for ──────────────────────────────────────────────────── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Who Each Tool Is Best For</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="bg-[#0a0f1e] border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm font-bold">P</span>
                <span className="font-bold text-white text-sm">PropertySignalHQ is a great fit if…</span>
              </div>
              <ul className="space-y-3">
                {PSHQ_FITS.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="text-emerald-400 mt-0.5 shrink-0 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center text-sm font-bold">B</span>
                <span className="font-bold text-white text-sm">BatchLeads may be a better fit if…</span>
              </div>
              <ul className="space-y-3">
                {BL_FITS.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="text-gray-500 mt-0.5 shrink-0 font-bold">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Pricing comparison ───────────────────────────────────────────────── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Pricing at a Glance</h2>
          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <div className="bg-[#0a0f1e] border border-blue-500/30 rounded-2xl p-7 text-center relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                No per-record fees
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">PropertySignalHQ</p>
              <div className="text-5xl font-black text-white mb-1">$39</div>
              <div className="text-sm text-gray-500 mb-4">per month, flat</div>
              <p className="text-xs text-gray-500 mb-6">No contract · Cancel anytime · Free tier available</p>
              <Link
                href="/signup"
                className="block w-full text-center font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                Try Free — No Credit Card
              </Link>
            </div>
            <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl p-7 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">BatchLeads</p>
              <div className="text-5xl font-black text-gray-400 mb-1">$77<span className="text-2xl">+</span></div>
              <div className="text-sm text-gray-600 mb-4">$77–$197/mo + per-record fees</div>
              <p className="text-xs text-gray-600 mb-6">No contract · Cancel anytime · Free trial</p>
              <a
                href="https://www.batchleads.io"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center font-bold text-sm border border-white/10 text-gray-400 hover:bg-white/5 py-3 rounded-xl transition-colors"
              >
                Visit BatchLeads →
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {FAQS.map(item => (
              <div key={item.q} className="bg-[#0a0f1e] border border-white/8 rounded-xl p-6">
                <p className="text-sm font-semibold text-white mb-2">{item.q}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
        <section className="pb-24 text-center">
          <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl px-8 py-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
              Start Exploring Free Today
            </h2>
            <p className="text-gray-400 mb-8 text-base">
              No credit card · No contract · All 50 states covered
            </p>
            <Link
              href="/signup"
              className="inline-block font-bold text-base px-10 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/25"
            >
              Try PropertySignalHQ Free →
            </Link>
            <p className="text-xs text-gray-600 mt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-gray-500 hover:text-gray-300 transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
