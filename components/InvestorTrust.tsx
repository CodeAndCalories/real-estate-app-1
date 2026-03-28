'use client'

type Props = {
  isDark: boolean
}

const INVESTOR_TYPES = [
  {
    emoji: '🔨',
    title: 'House Flippers',
    description:
      'Identify price-reduced, high-equity properties before they get snatched up. Opportunity scoring ranks every lead so you spend time on deals worth pursuing.',
    highlights: ['Price drop detection', 'Equity estimation', 'Score-ranked results'],
    light: 'border-orange-200 bg-orange-50',
    dark:  'border-orange-800 bg-orange-900/20',
    dot:   'bg-orange-400',
    textAccent: { light: 'text-orange-700', dark: 'text-orange-400' },
  },
  {
    emoji: '🏘️',
    title: 'Buy & Hold Investors',
    description:
      'Filter by estimated rent yield and equity to find cash-flowing properties that fit your portfolio strategy. The deal calculator runs the numbers instantly.',
    highlights: ['Rent yield estimates', 'Built-in deal calculator', 'City-level market data'],
    light: 'border-blue-200 bg-blue-50',
    dark:  'border-blue-800 bg-blue-900/20',
    dot:   'bg-blue-400',
    textAccent: { light: 'text-blue-700', dark: 'text-blue-400' },
  },
  {
    emoji: '🤝',
    title: 'Wholesalers',
    description:
      'Surface distressed owners and expired listings across 60+ cities in seconds. Export leads to CSV and push them directly into your dialer or CRM.',
    highlights: ['Distressed owner signals', 'Expired listing filter', 'One-click CSV export'],
    light: 'border-green-200 bg-green-50',
    dark:  'border-green-800 bg-green-900/20',
    dot:   'bg-green-400',
    textAccent: { light: 'text-green-700', dark: 'text-green-400' },
  },
]

export default function InvestorTrust({ isDark }: Props) {
  const textPrimary   = 'text-white'
  const textSecondary = 'text-gray-400'
  const textMuted     = 'text-gray-500'

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 bg-[#0a0f1e] border-t border-white/5">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-blue-400">
              Built for real estate investors
            </p>
            <h2 className={`text-3xl sm:text-4xl font-black leading-tight ${textPrimary}`}>
              PropertySignalHQ helps investors find undervalued opportunities faster
            </h2>
          </div>

          {/* Value prop cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-[#111827] transition-all duration-300">
              <div className="text-2xl mb-3">📉</div>
              <h3 className="text-white font-semibold text-lg mb-2">Signal Scoring 0–100</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every property is scored on price drops, equity, distress signals, and rental yield so you focus on the best deals first.
              </p>
            </div>
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-[#111827] transition-all duration-300">
              <div className="text-2xl mb-3">🌡️</div>
              <h3 className="text-white font-semibold text-lg mb-2">Zillow Market Temperature</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                See real-time market heat, median home values, and typical rents powered by Zillow Research data updated weekly.
              </p>
            </div>
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-[#111827] transition-all duration-300">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="text-white font-semibold text-lg mb-2">Owner Contact &amp; CSV Export</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Get skip-traced owner contact info, analyze any deal instantly, and export leads to CSV for your dialer or CRM.
              </p>
            </div>
          </div>
        </div>

        {/* Investor type cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {INVESTOR_TYPES.map((type) => (
            <div
              key={type.title}
              className="rounded-xl border border-white/10 bg-[#0f172a] p-6 flex flex-col"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-2xl leading-none">{type.emoji}</span>
                <h3 className={`text-base font-black ${textPrimary}`}>{type.title}</h3>
              </div>
              <p className={`text-sm leading-relaxed mb-4 flex-1 ${textSecondary}`}>
                {type.description}
              </p>
              <ul className="space-y-1.5">
                {type.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${type.dot}`} />
                    <span className={`text-xs font-semibold ${type.textAccent.dark}`}>
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '40,000+', label: 'Property signals',     icon: '📊' },
            { value: '60+',    label: 'Cities · all 50 states', icon: '🏙️' },
            { value: 'Zillow', label: 'Powered market data',  icon: '🎯' },
            { value: 'Weekly', label: 'Data updates',         icon: '🔄' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl mb-1 leading-none">{stat.icon}</div>
              <div className="text-2xl font-black text-blue-400">
                {stat.value}
              </div>
              <div className={`text-xs mt-0.5 font-medium ${textMuted}`}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
