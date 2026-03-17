import { CHECKOUT_URL } from '@/lib/constants/checkout'

type Props = {
  isDark: boolean
}

const FEATURES = [
  'Full property signal database',
  'Unlimited searches',
  'Opportunity scoring + explanations',
  'CSV exports',
  'Map view',
  'Favorites tracking',
  'Investor notes',
  'Deal calculator',
  'Opportunity alerts',
  'Deal report exports',
]

export default function PricingSection({ isDark }: Props) {
  return (
    <section
      id="pricing"
      className={`py-24 px-6 ${isDark ? 'bg-gray-950' : 'bg-gradient-to-b from-blue-50 to-white'}`}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className={`inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full ${
            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-50 text-blue-600'
          }`}>
            Pricing
          </span>
          <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            One Plan. Everything Included.
          </h2>
          <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            No tiers, no feature walls — every tool in one flat monthly price.
          </p>
        </div>

        {/* Single centered card */}
        <div className="flex justify-center">
          <div className={`w-full max-w-md rounded-2xl border p-9 relative shadow-2xl ${
            isDark
              ? 'bg-blue-900/40 border-blue-500 shadow-blue-900/50'
              : 'bg-blue-600 border-blue-500 shadow-blue-300/60'
          }`}>
            {/* Badge */}
            <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap ${
              isDark ? 'bg-blue-500 text-white' : 'bg-white text-blue-600'
            }`}>
              All Features Included
            </span>

            {/* Plan name */}
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
              isDark ? 'text-blue-400' : 'text-blue-200'
            }`}>
              PropertySignalHQ Pro
            </p>

            {/* Price */}
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-5xl font-black text-white leading-none">$39</span>
              <span className={`text-sm mb-2 ${isDark ? 'text-blue-300' : 'text-blue-100'}`}>/ month</span>
            </div>

            {/* Tagline */}
            <p className={`text-sm mb-7 ${isDark ? 'text-blue-300' : 'text-blue-100'}`}>
              Everything investors need to find and analyze off-market opportunities.
            </p>

            {/* Features */}
            <ul className="space-y-2.5 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 shrink-0 text-sm ${isDark ? 'text-blue-400' : 'text-blue-200'}`}>✓</span>
                  <span className={`text-sm ${isDark ? 'text-blue-100' : 'text-white'}`}>{f}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => { window.location.href = CHECKOUT_URL }}
              className={`w-full font-bold text-base py-3.5 rounded-xl transition-all shadow-md ${
                isDark
                  ? 'bg-blue-500 hover:bg-blue-400 text-white'
                  : 'bg-white hover:bg-blue-50 text-blue-600'
              }`}
            >
              Upgrade to Pro →
            </button>

            <p className={`text-center text-xs mt-3 ${isDark ? 'text-blue-500' : 'text-blue-200'}`}>
              Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
