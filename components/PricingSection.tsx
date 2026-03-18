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

export default function PricingSection({ isDark }: Props) {
  const { user } = useAuth()
  const { isPro, loading: proLoading } = useProStatus(user?.email)

  // User is confirmed pro (and session has loaded)
  const isConfirmedPro = !!user && !proLoading && isPro

  return (
    <section
      id="pricing"
      className="py-12 md:py-24 px-6 bg-[#020617]"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-blue-900/50 text-blue-400">
            Pricing
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-white">
            One Plan. Everything Included.
          </h2>
          <p className="text-base max-w-xl mx-auto text-gray-400">
            No tiers, no feature walls — every tool in one flat monthly price.
          </p>
        </div>

        {/* Single centered card */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-xl p-9 relative shadow-2xl shadow-black/50">
            {/* Badge */}
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap bg-blue-600 text-white">
              All Features Included
            </span>

            {/* Plan name */}
            <p className="text-xs font-bold uppercase tracking-widest mb-3 text-blue-400">
              PropertySignalHQ Pro
            </p>

            {/* Price */}
            <div className="flex items-end gap-1.5 mb-1">
              <span className="font-display text-5xl font-black text-white leading-none">$39</span>
              <span className="text-sm mb-2 text-blue-300">/ month</span>
            </div>

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
                  className="block w-full text-center font-bold text-base py-3.5 rounded-lg transition-all shadow-md bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
                >
                  Unlock Owner Contacts →
                </a>

                {/* Sample CSV download */}
                <div className="text-center mt-2">
                  <a
                    href="/sample-leads.csv"
                    download
                    className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors"
                  >
                    ⬇ Download Sample Leads (CSV)
                  </a>
                </div>
              </>
            )}

            <p className="text-center text-xs mt-3 text-gray-500">
              Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
