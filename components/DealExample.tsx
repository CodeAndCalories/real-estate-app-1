'use client'

type Props = {
  isDark: boolean
}

const SCORE_REASONS = [
  { icon: '📉', label: 'Price dropped 14%', detail: 'Listed at $340k, now reduced to $292k in 38 days' },
  { icon: '🏚️', label: 'Long days on market', detail: '112 days listed — seller motivation is high' },
  { icon: '💰', label: 'High estimated equity', detail: '$148k equity based on estimated value vs. loan balance' },
  { icon: '📍', label: 'Strong rental market', detail: 'Phoenix rent avg $1,840/mo — solid cash flow potential' },
]

export default function DealExample({ isDark }: Props) {
  const card    = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  const subCard = isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
  const textPrimary   = isDark ? 'text-white'     : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-400'  : 'text-gray-500'
  const textMuted     = isDark ? 'text-gray-500'  : 'text-gray-400'
  const divider       = isDark ? 'divide-gray-700' : 'divide-gray-100'

  return (
    <section className={`py-20 px-6 ${isDark ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            Real deal example
          </p>
          <h2 className={`text-3xl sm:text-4xl font-black leading-tight mb-4 ${textPrimary}`}>
            Here&apos;s what a high-score signal looks like
          </h2>
          <p className={`text-base max-w-lg mx-auto ${textSecondary}`}>
            PropertySignalHQ analyzes dozens of data points to surface deals like this one automatically.
          </p>
        </div>

        {/* Deal card */}
        <div className={`rounded-2xl border shadow-xl overflow-hidden ${card}`}>

          {/* Property header */}
          <div className={`px-6 pt-6 pb-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                    isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-600'
                  }`}>
                    Pre-Foreclosure
                  </span>
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${
                    isDark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-50 text-orange-600'
                  }`}>
                    Price Drop
                  </span>
                </div>
                <h3 className={`text-xl font-black leading-snug ${textPrimary}`}>
                  4721 W. Camelback Rd
                </h3>
                <p className={`text-sm mt-0.5 ${textSecondary}`}>Phoenix, AZ 85031</p>
              </div>

              {/* Score badge */}
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                  isDark
                    ? 'bg-green-900/40 border-green-600'
                    : 'bg-green-50 border-green-400'
                }`}>
                  <span className={`text-2xl font-black ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    91
                  </span>
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-wide mt-1 ${
                  isDark ? 'text-green-500' : 'text-green-600'
                }`}>
                  Hot Lead
                </p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 ${divider}`}>
            {[
              { label: 'Original Price', value: '$340,000', sub: '38 days ago', color: textSecondary },
              { label: 'Current Price',  value: '$292,000', sub: '−$48k (−14%)',  color: isDark ? 'text-red-400' : 'text-red-600' },
              { label: 'Est. Equity',    value: '$148,000', sub: 'vs. loan balance', color: isDark ? 'text-green-400' : 'text-green-600' },
              { label: 'Rent Estimate',  value: '$1,840/mo', sub: '7.56% yield',  color: isDark ? 'text-blue-400' : 'text-blue-600' },
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-4 text-center">
                <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${textMuted}`}>
                  {stat.label}
                </p>
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                <p className={`text-xs mt-0.5 ${textMuted}`}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Why it scored high */}
          <div className="px-6 py-5">
            <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${textMuted}`}>
              Why this scored 91
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCORE_REASONS.map((reason) => (
                <div
                  key={reason.label}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 ${subCard}`}
                >
                  <span className="text-xl leading-none flex-shrink-0 mt-0.5">{reason.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${textPrimary}`}>{reason.label}</p>
                    <p className={`text-xs mt-0.5 leading-snug ${textSecondary}`}>{reason.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer CTA */}
          <div className={`px-6 py-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            isDark ? 'border-gray-700 bg-gray-800/60' : 'border-gray-100 bg-gray-50'
          }`}>
            <p className={`text-sm ${textSecondary}`}>
              Signals like this are updated daily across 10 markets.
            </p>
            <a
              href="/finder"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              Find Similar Deals →
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <p className={`text-center text-xs mt-4 ${textMuted}`}>
          Example property shown for illustrative purposes. Property data provided for informational use only.
        </p>
      </div>
    </section>
  )
}
