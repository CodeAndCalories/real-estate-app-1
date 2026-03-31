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
    dot: 'bg-orange-400',
    textAccent: 'text-orange-400',
    iconBg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    emoji: '🏘️',
    title: 'Buy & Hold Investors',
    description:
      'Filter by estimated rent yield and equity to find cash-flowing properties that fit your portfolio strategy. The deal calculator runs the numbers instantly.',
    highlights: ['Rent yield estimates', 'Built-in deal calculator', 'City-level market data'],
    dot: 'bg-blue-400',
    textAccent: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    emoji: '🤝',
    title: 'Wholesalers',
    description:
      'Surface distressed owners and expired listings across 125+ cities in seconds. Export leads to CSV and push them directly into your dialer or CRM.',
    highlights: ['Distressed owner signals', 'Expired listing filter', 'One-click CSV export'],
    dot: 'bg-emerald-400',
    textAccent: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
  },
]

const VALUE_PROPS = [
  {
    icon: '📉',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Signal Scoring 0–100',
    description:
      'Every property is scored on price drops, equity, distress signals, and rental yield so you focus on the best deals first.',
  },
  {
    icon: '🌡️',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Zillow Market Temperature',
    description:
      'See real-time market heat, median home values, and typical rents powered by Zillow Research data updated weekly.',
  },
  {
    icon: '⚡',
    iconBg: 'bg-yellow-500/10 border-yellow-500/20',
    title: 'Owner Contact & CSV Export',
    description:
      'Get skip-traced owner contact info, analyze any deal instantly, and export leads to CSV for your dialer or CRM.',
  },
]

export default function InvestorTrust({ isDark: _isDark }: Props) {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 bg-[#0a0f1e] border-t border-white/5">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-blue-400">
            Built for real estate investors
          </p>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
            PropertySignalHQ helps investors find undervalued opportunities faster
          </h2>
        </div>

        {/* Value prop cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {VALUE_PROPS.map((vp) => (
            <div
              key={vp.title}
              className="bg-[#0f172a] border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-[#111827] transition-all duration-300"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border text-xl mb-4 ${vp.iconBg}`}>
                {vp.icon}
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{vp.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{vp.description}</p>
            </div>
          ))}
        </div>

        {/* Investor type cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {INVESTOR_TYPES.map((type) => (
            <div
              key={type.title}
              className="rounded-xl border border-white/10 bg-[#0f172a] p-6 flex flex-col hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border text-lg ${type.iconBg}`}>
                  {type.emoji}
                </div>
                <h3 className="text-base font-black text-white">{type.title}</h3>
              </div>
              <p className="text-sm leading-relaxed mb-4 flex-1 text-gray-400">{type.description}</p>
              <ul className="space-y-1.5">
                {type.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${type.dot}`} />
                    <span className={`text-xs font-semibold ${type.textAccent}`}>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats row — grid gap border pattern */}
        <div
          className="rounded-xl overflow-hidden border border-blue-900/30"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
        >
          <div
            className="grid grid-cols-2 sm:grid-cols-4"
            style={{ gap: '1px', background: 'rgba(37,99,235,0.12)' }}
          >
            {[
              { value: '500,000+', label: 'Property signals',       icon: '📊' },
              { value: '125+',    label: 'Cities · all 50 states', icon: '🏙️' },
              { value: 'Zillow',  label: 'Powered market data',    icon: '🎯' },
              { value: 'Weekly',  label: 'Data updates',           icon: '🔄' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center px-6 py-8 hover:bg-blue-500/5 transition-colors duration-200"
                style={{ background: '#0a0f1e' }}
              >
                <div className="text-xl mb-2 leading-none">{stat.icon}</div>
                <div
                  className="text-2xl font-black leading-none mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #67e8f9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs font-medium text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
