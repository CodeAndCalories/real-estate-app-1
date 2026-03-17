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
      'Surface distressed owners and expired listings across 10 markets in seconds. Export leads to CSV and push them directly into your dialer or CRM.',
    highlights: ['Distressed owner signals', 'Expired listing filter', 'One-click CSV export'],
    light: 'border-green-200 bg-green-50',
    dark:  'border-green-800 bg-green-900/20',
    dot:   'bg-green-400',
    textAccent: { light: 'text-green-700', dark: 'text-green-400' },
  },
]

export default function InvestorTrust({ isDark }: Props) {
  const textPrimary   = isDark ? 'text-white'    : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600'
  const textMuted     = isDark ? 'text-gray-500' : 'text-gray-400'

  return (
    <section className={`py-20 px-6 ${isDark ? 'bg-gray-900' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Built for real estate investors
          </p>
          <h2 className={`text-3xl sm:text-4xl font-black leading-tight mb-4 ${textPrimary}`}>
            PropertySignalHQ helps investors find undervalued opportunities faster
          </h2>
          <p className={`text-base leading-relaxed ${textSecondary}`}>
            By analyzing price drops, equity positions, and listing behavior across multiple markets,
            we surface the deals worth your attention — before they disappear.
          </p>
        </div>

        {/* Investor type cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {INVESTOR_TYPES.map((type) => (
            <div
              key={type.title}
              className={`rounded-2xl border p-5 flex flex-col ${
                isDark ? type.dark : type.light
              }`}
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
                    <span className={`text-xs font-semibold ${
                      isDark ? type.textAccent.dark : type.textAccent.light
                    }`}>
                      {h}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className={`rounded-2xl border px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          {[
            { value: '6,600+', label: 'Signals analyzed', icon: '📊' },
            { value: '10',     label: 'Markets covered',  icon: '🏙️' },
            { value: '3',    label: 'Lead types tracked', icon: '🎯' },
            { value: '100%', label: 'Free to explore',  icon: '🆓' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl mb-1 leading-none">{stat.icon}</div>
              <div className={`text-2xl font-black ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
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
