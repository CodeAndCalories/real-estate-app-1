'use client'

type Props = {
  isDark: boolean
}

const POINTS = [
  { icon: '🏙️', text: '35 real estate markets covered' },
  { icon: '📊', text: '27,400+ property signals analyzed' },
  { icon: '🌡️', text: 'Zillow-powered market data' },
]

export default function InvestorTrustBanner({ isDark }: Props) {
  return (
    <div className={`rounded-xl border px-5 py-4 mb-5 ${
      isDark
        ? 'bg-gray-800/60 border-gray-700'
        : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        {/* Label */}
        <p className={`text-xs font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 ${
          isDark ? 'text-blue-400' : 'text-blue-600'
        }`}>
          Trusted by Real Estate Investors
        </p>

        {/* Divider — hidden on mobile */}
        <div className={`hidden sm:block w-px self-stretch ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        {/* Trust points */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {POINTS.map((p) => (
            <div key={p.text} className="flex items-center gap-1.5">
              <span className="text-sm leading-none">{p.icon}</span>
              <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className={`font-bold mr-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>✓</span>
                {p.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
