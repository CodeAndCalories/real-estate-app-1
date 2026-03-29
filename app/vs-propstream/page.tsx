import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Looking for a PropStream Alternative? Try PropertySignalHQ',
  description:
    'PropertySignalHQ is a PropStream alternative for real estate investors. Get opportunity scoring, market data, and owner contacts starting at $39/mo. Free to explore.',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TABLE_ROWS = [
  {
    feature: 'Monthly Price',
    pshq:    { text: '$39/mo',           highlight: true  },
    ps:      { text: '$99+/mo',          highlight: false },
  },
  {
    feature: 'Free to Explore',
    pshq:    { text: 'No credit card',   check: true  },
    ps:      { text: '7-day trial',      check: false },
  },
  {
    feature: 'Opportunity Scoring',
    pshq:    { text: '0–100 AI score',   check: true  },
    ps:      { text: '—',               check: false },
  },
  {
    feature: 'Market Temperature',
    pshq:    { text: 'Zillow-powered',   check: true  },
    ps:      { text: '—',               check: false },
  },
  {
    feature: 'Owner Contact Info',
    pshq:    { text: 'Included',         check: true  },
    ps:      { text: 'Included',         check: true  },
  },
  {
    feature: 'CSV Export',
    pshq:    { text: 'Included',         check: true  },
    ps:      { text: 'Add-on',           check: false },
  },
  {
    feature: 'Deal Alerts',
    pshq:    { text: 'Included',         check: true  },
    ps:      { text: 'Included',         check: true  },
  },
  {
    feature: 'Analyze Any Deal',
    pshq:    { text: 'Free tool',        check: true  },
    ps:      { text: '—',               check: false },
  },
  {
    feature: 'Free Market Reports',
    pshq:    { text: 'Any city',         check: true  },
    ps:      { text: '—',               check: false },
  },
  {
    feature: 'Markets Covered',
    pshq:    { text: '60+ cities, all 50 states', highlight: false },
    ps:      { text: 'National',                  highlight: false },
  },
  {
    feature: 'No Contract',
    pshq:    { text: 'Cancel anytime',   check: true  },
    ps:      { text: 'Cancel anytime',   check: true  },
  },
]

const PSHQ_FITS = [
  'You want opportunity scores to prioritize your leads',
  'You are budget-conscious ($39 vs $99+/mo)',
  'You want Zillow market temperature data built in',
  'You want to analyze any deal for free before committing',
]

const PS_FITS = [
  'You need deep historical data going back many years',
  'You need advanced skip tracing features',
  'You have a larger data research budget',
  'You are already familiar with their platform',
]

const FAQS = [
  {
    q: 'Is PropertySignalHQ a PropStream replacement?',
    a: 'Not necessarily — both tools have real strengths. PropertySignalHQ focuses on opportunity scoring and affordability. PropStream has more historical data depth. We genuinely recommend trying both to see which fits your workflow.',
  },
  {
    q: 'How does the pricing compare?',
    a: 'PropertySignalHQ starts at $39/month. PropStream starts at $99+/month. Both are month-to-month with no long-term contracts.',
  },
  {
    q: 'Can I use PropertySignalHQ alongside PropStream?',
    a: 'Absolutely — some investors use PropertySignalHQ for daily opportunity scoring and deal alerts, and PropStream for deep historical research. The two tools complement each other well.',
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
    <td
      className={`
        px-5 py-3.5 text-sm text-center align-middle
        ${isPshq ? 'bg-blue-500/5' : ''}
        ${highlight && isPshq ? 'font-bold text-blue-300' : ''}
      `}
    >
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

export default function VsPropStreamPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* ── Nav strip ───────────────────────────────────────────────────────── */}
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
            Looking for a PropStream Alternative?
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            Both are solid real estate tools — here's an honest look at how they differ,
            who each is best for, and which fits your investing style.
          </p>
          <p className="text-xs text-gray-600 max-w-xl mx-auto">
            All information about PropStream based on publicly available data as of March 2026.
            We respect PropStream and recommend evaluating both tools for your needs.
          </p>
        </section>

        {/* ── Intro ───────────────────────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl px-7 py-6 text-gray-300 text-base leading-relaxed">
            PropStream is a well-established platform trusted by thousands of investors.
            PropertySignalHQ takes a different approach — focusing on opportunity scoring,
            Zillow-powered market data, and an accessible price point. Neither is objectively
            better; it depends on what you need.
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
                    <span className="block text-[10px] text-blue-500/60 font-normal normal-case mt-0.5">$39/mo</span>
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                    PropStream
                    <span className="block text-[10px] text-gray-600 font-normal normal-case mt-0.5">$99+/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-[#020617]' : 'bg-[#060d1a]'}`}
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-300 font-medium">
                      {row.feature}
                    </td>
                    <Cell
                      text={row.pshq.text}
                      check={'check' in row.pshq ? row.pshq.check : undefined}
                      highlight={'highlight' in row.pshq ? row.pshq.highlight : undefined}
                      isPshq={true}
                    />
                    <Cell
                      text={row.ps.text}
                      check={'check' in row.ps ? row.ps.check : undefined}
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

            {/* PSHQ */}
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

            {/* PropStream */}
            <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-7 h-7 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center text-sm font-bold">P</span>
                <span className="font-bold text-white text-sm">PropStream may be a better fit if…</span>
              </div>
              <ul className="space-y-3">
                {PS_FITS.map(item => (
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

            {/* PSHQ price card */}
            <div className="bg-[#0a0f1e] border border-blue-500/30 rounded-2xl p-7 text-center relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                Save $60+/month
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">PropertySignalHQ</p>
              <div className="text-5xl font-black text-white mb-1">$39</div>
              <div className="text-sm text-gray-500 mb-4">per month</div>
              <p className="text-xs text-gray-500 mb-6">No contract · Cancel anytime · Free tier available</p>
              <Link
                href="/signup"
                className="block w-full text-center font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                Try Free — No Credit Card
              </Link>
            </div>

            {/* PropStream price card */}
            <div className="bg-[#0a0f1e] border border-white/8 rounded-2xl p-7 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">PropStream</p>
              <div className="text-5xl font-black text-gray-400 mb-1">$99<span className="text-2xl">+</span></div>
              <div className="text-sm text-gray-600 mb-4">per month</div>
              <p className="text-xs text-gray-600 mb-6">No contract · Cancel anytime · 7-day trial</p>
              <a
                href="https://www.propstream.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center font-bold text-sm border border-white/10 text-gray-400 hover:bg-white/5 py-3 rounded-xl transition-colors"
              >
                Visit PropStream →
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
