'use client'

type Props = {
  isDark: boolean
}

const ITEMS = [
  { icon: '🏙️', text: '60+ cities · all 50 states' },
  { icon: '📊', text: '35,200+ property signals analyzed' },
  { icon: '🔍', text: 'Signal scoring 0–100 on every lead' },
  { icon: '🌡️', text: 'Zillow-powered market temperature data' },
  { icon: '📥', text: 'CSV export ready' },
]

export default function TrustBar({ isDark }: Props) {
  return (
    <section className={`border-y ${
      isDark
        ? 'bg-gray-900 border-gray-800'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {ITEMS.map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <span className="text-base leading-none">{item.icon}</span>
              <span className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <span className={`font-bold mr-1 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`}>✓</span>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
