'use client'

type Props = {
  isDark: boolean
}

const USE_CASES = [
  {
    emoji: '🔨',
    title: 'House Flippers',
    subtitle: 'Find undervalued properties before the competition',
    description:
      'Spot price drops, distressed listings, and high-equity opportunities the moment they hit the market. PropertySignalHQ scores every lead so you can focus on deals with the highest flip potential — not endless scrolling.',
    highlights: [
      'Price drop alerts across 10 markets',
      'Equity estimates on every property',
      'Opportunity score ranks the best deals first',
    ],
    accentLight: 'border-orange-200 bg-orange-50',
    accentDark: 'border-orange-800 bg-orange-900/20',
    pillLight: 'bg-orange-100 text-orange-700',
    pillDark: 'bg-orange-900/40 text-orange-400',
    dotColor: 'bg-orange-400',
  },
  {
    emoji: '🏘️',
    title: 'Buy & Hold Investors',
    subtitle: 'Identify markets with strong rental fundamentals',
    description:
      'Filter by rent estimate, equity, and days on market to find cash-flowing properties in cities that match your strategy. The built-in deal calculator shows projected cash flow and cap rate in seconds.',
    highlights: [
      'Rent estimate on every signal',
      'Deal calculator with cap rate + CoC',
      'Filter by city, equity, and lead type',
    ],
    accentLight: 'border-blue-200 bg-blue-50',
    accentDark: 'border-blue-800 bg-blue-900/20',
    pillLight: 'bg-blue-100 text-blue-700',
    pillDark: 'bg-blue-900/40 text-blue-400',
    dotColor: 'bg-blue-400',
  },
  {
    emoji: '🤝',
    title: 'Wholesalers',
    subtitle: 'Build a pipeline of motivated seller leads',
    description:
      "Find distressed owners, expired listings, and pre-foreclosure properties before they go under contract. Export leads to CSV and push directly into your dialer or CRM — no manual copy-paste required.",
    highlights: [
      'Pre-foreclosure and distressed filters',
      'One-click CSV export for dialers',
      'Deal pipeline to track every lead',
    ],
    accentLight: 'border-green-200 bg-green-50',
    accentDark: 'border-green-800 bg-green-900/20',
    pillLight: 'bg-green-100 text-green-700',
    pillDark: 'bg-green-900/40 text-green-400',
    dotColor: 'bg-green-400',
  },
]

export default function InvestorUseCases({ isDark }: Props) {
  return (
    <section className={`py-20 px-6 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Built for every strategy
          </p>
          <h2 className={`text-3xl sm:text-4xl font-black leading-tight mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            How investors use PropertySignalHQ
          </h2>
          <p className={`text-base max-w-xl mx-auto ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Whether you flip, hold, or wholesale — find the right signals for your strategy.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USE_CASES.map((uc) => (
            <div
              key={uc.title}
              className={`rounded-2xl border p-6 flex flex-col ${
                isDark ? uc.accentDark : uc.accentLight
              }`}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl leading-none">{uc.emoji}</span>
                <div>
                  <h3 className={`text-lg font-black leading-tight ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {uc.title}
                  </h3>
                  <p className={`text-xs font-medium mt-0.5 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {uc.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className={`text-sm leading-relaxed mb-5 flex-1 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {uc.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2">
                {uc.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${uc.dotColor}`} />
                    <span className={`text-xs font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <a
            href="/finder"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/20"
          >
            Start Finding Deals →
          </a>
        </div>
      </div>
    </section>
  )
}
