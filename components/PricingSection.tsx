'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'

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

const COMPETITORS = [
  { name: 'BatchLeads',   price: '$119/mo' },
  { name: 'DealMachine',  price: '$99/mo'  },
  { name: 'PropStream',   price: '$149/mo' },
]

export default function PricingSection({ isDark }: Props) {
  const { user } = useAuth()
  const { isPro, loading: proLoading } = useProStatus(user?.email)

  const isConfirmedPro = !!user && !proLoading && isPro

  return (
    <section
      id="pricing"
      className="py-12 md:py-20 px-6 bg-[#020617]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-white">
            One Plan. First Month Free.
          </h2>
          <p className="text-base max-w-xl mx-auto text-gray-400">
            Try everything free for 30 days. Then $39/month — no tiers, no feature walls.
          </p>
        </div>

        {/* Competitor comparison strip */}
        <div className="max-w-sm mx-auto mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-center text-gray-600 mb-3">
            What others charge
          </p>
          <div className="grid grid-cols-3 gap-2">
            {COMPETITORS.map((c) => (
              <div
                key={c.name}
                className="bg-[#0f172a] border border-white/5 rounded-lg px-3 py-2.5 text-center"
              >
                <p className="text-xs text-gray-600 mb-0.5">{c.name}</p>
                <p className="text-sm font-bold text-gray-500 line-through decoration-red-500/60">{c.price}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs text-gray-600">vs.</span>
            <span className="text-sm font-black text-emerald-400">PropertySignalHQ: $39/mo</span>
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">Save $60-110/mo</span>
          </div>
        </div>

        {/* Single centered card */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm relative">
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-xl opacity-60 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(37,99,235,0.25) 0%, transparent 70%)',
              }}
            />

            <div className="relative bg-[#0f172a] border border-white/10 rounded-xl p-9 shadow-2xl shadow-black/50 hover:border-blue-500/30 transition-colors duration-300">
              {/* Badge */}
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap bg-emerald-500 text-white shadow-emerald-500/30">
                First Month FREE
              </span>

              {/* Plan name */}
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-blue-400">
                PropertySignalHQ Pro
              </p>

              {/* Price */}
              <div className="flex items-end gap-1.5 mb-1">
                <span className="font-display text-5xl font-black text-white leading-none">$0</span>
                <span className="text-sm mb-2 text-emerald-400 font-semibold">first month</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">
                Then <span className="text-white font-semibold">$39/month</span> — cancel anytime before your trial ends
              </p>

              {/* Comparison note */}
              <p className="text-sm text-gray-400 italic mb-3">
                Other tools cost $99–$149/mo — you&apos;re saving $60+/month
              </p>

              {/* Tagline */}
              <p className="text-sm mb-7 text-blue-300">
                Everything investors need to find and analyze off-market opportunities.
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-8">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0 text-sm text-blue-400">✓</span>
                    <span className="text-sm text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA — swapped for pro members */}
              {isConfirmedPro ? (
                <>
                  <div className="block w-full text-center font-semibold text-base py-3 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 cursor-default">
                    ✓ You&apos;re a Pro Member
                  </div>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    Manage your subscription via your email receipt
                  </p>
                </>
              ) : (
                <>
                  <a
                    href="/upgrade"
                    className="block w-full text-center font-bold text-base py-3.5 rounded-lg transition-all shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:shadow-blue-500/40"
                  >
                    Start Free — First Month on Us →
                  </a>

                  {/* Preview CSV download */}
                  <div className="text-center mt-2">
                    <a
                      href="/sample-leads.csv"
                      download
                      className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors"
                    >
                      ⬇ Download Preview Leads (CSV)
                    </a>
                  </div>
                </>
              )}

              <p className="text-center text-xs mt-3 text-gray-500">
                30-day free trial · No charge until day 31 · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
