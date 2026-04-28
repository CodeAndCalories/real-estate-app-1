import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Competitor Comparisons — PropertySignalHQ vs Alternatives',
  description:
    'See how PropertySignalHQ stacks up against PropStream, BatchLeads, DealMachine, and other real estate lead tools. Side-by-side feature and price comparisons.',
  openGraph: {
    title: 'Competitor Comparisons — PropertySignalHQ vs Alternatives',
    description:
      'Side-by-side comparisons of PropertySignalHQ vs PropStream and other investor tools.',
    url: 'https://propertysignalhq.com/compare',
  },
}

const COMPARISONS = [
  {
    slug: 'propertysignalhq-vs-propstream',
    opponent: 'PropStream',
    opponentPrice: '$99+/mo',
    pshqPrice: '$39.99/mo',
    highlight: 'Save 60% vs PropStream with a 30-day free trial',
  },
  {
    slug: 'propertysignalhq-vs-dealmachine',
    opponent: 'DealMachine',
    opponentPrice: '$49–$299/mo',
    pshqPrice: '$39.99/mo',
    highlight: '1,000,000+ nationwide leads vs driving-for-dollars only',
  },
]

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-400">Compare</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            PropertySignalHQ vs Alternatives
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Honest, feature-by-feature comparisons of PropertySignalHQ against other real estate
            investor tools — price, data coverage, free trials, and workflow fit.
          </p>
        </div>

        {/* Comparison cards */}
        <div className="space-y-4 mb-12">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="block rounded-xl border border-white/10 bg-[#0f172a] p-6 hover:border-blue-500/40 hover:bg-blue-950/20 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                    PropertySignalHQ vs {c.opponent}
                  </h2>
                  <p className="text-sm text-gray-500">{c.highlight}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-black text-blue-400">{c.pshqPrice}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">PropertySignalHQ</div>
                  </div>
                  <div className="text-gray-600 font-bold">vs</div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-400">{c.opponentPrice}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">{c.opponent}</div>
                  </div>
                  <span className="text-xs text-blue-400 group-hover:text-blue-300 whitespace-nowrap transition-colors">
                    See comparison →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 p-8 text-center">
          <h2 className="text-xl font-black text-white mb-2">
            Try PropertySignalHQ Free for 30 Days
          </h2>
          <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
            1,000,000+ pre-scored distressed leads. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/25"
          >
            Start Free Trial →
          </Link>
        </div>

      </div>
    </div>
  )
}
