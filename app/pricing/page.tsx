'use client'

import Link from 'next/link'

const PRO_FEATURES = [
  { icon: '📞', text: 'Owner contact lookup' },
  { icon: '📤', text: 'CSV export' },
  { icon: '♾️',  text: 'Unlimited signals' },
  { icon: '🔍', text: 'Advanced filters' },
  { icon: '🔔', text: 'Deal alerts' },
  { icon: '📊', text: 'Opportunity scoring + explanations' },
  { icon: '🗺️', text: 'Map view' },
  { icon: '⭐', text: 'Favorites & saved deals' },
  { icon: '📝', text: 'Investor notes & deal workspace' },
  { icon: '📄', text: 'Deal report exports' },
]

const FREE_FEATURES = [
  'Browse signal database',
  'Basic search & filters',
  'Opportunity score preview',
  'View property details',
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#020617]">

      {/* Top bar */}
      <div className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              width="32" height="32" viewBox="0 0 40 40" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:opacity-80 transition-opacity"
            >
              <path d="M12 32V8H22C26.4183 8 30 11.5817 30 16C30 20.4183 26.4183 24 22 24H18.5L12 32Z" fill="white"/>
              <path d="M10 26L18 18" stroke="#020617" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              PropertySignal<span className="text-blue-400">HQ</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20">

        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            First Month Free.<br className="hidden sm:block" /> Then $39/Month.
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Try the full Pro plan free for 30 days. No charge until day 31. Cancel anytime.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free card */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0f1e] p-8 flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Free</p>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-4xl font-black text-white leading-none">$0</span>
              <span className="text-sm text-gray-500 mb-1.5">/ forever</span>
            </div>
            <p className="text-sm text-gray-500 mb-7">Explore the platform with no commitment.</p>

            <ul className="space-y-2.5 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-gray-400">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/finder"
              className="block w-full text-center font-bold text-sm py-3 rounded-xl border border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              Browse Free
            </Link>
          </div>

          {/* Pro card */}
          <div className="rounded-2xl border border-blue-500 bg-blue-600 p-8 flex flex-col relative shadow-2xl shadow-blue-500/20">
            {/* Badge */}
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-400 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap">
              First Month FREE
            </span>

            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">
              PropertySignalHQ Pro
            </p>
            <div className="flex items-end gap-1.5 mb-1">
              <span className="text-4xl font-black text-white leading-none">$0</span>
              <span className="text-sm text-emerald-300 mb-1.5 font-semibold">first 30 days</span>
            </div>
            <p className="text-sm text-blue-200 mb-1">Then $39/month — cancel before day 31 and pay nothing.</p>
            <p className="text-sm text-blue-100 mb-7">
              Full access from day one. Every tool, no restrictions.
            </p>

            <ul className="space-y-2.5 mb-8 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <span className="text-blue-300 mt-0.5 shrink-0 text-sm">✓</span>
                  <span className="text-sm text-white">
                    <span className="mr-1.5">{f.icon}</span>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => { window.location.href = '/upgrade' }}
              className="w-full bg-white hover:bg-blue-50 text-blue-600 font-bold text-sm py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Start Free Trial →
            </button>

            <p className="text-center text-xs text-blue-300 mt-3">
              30-day free trial · No charge until day 31 · Cancel anytime
            </p>
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-14 flex flex-wrap justify-center gap-8 text-center">
          {[
            { icon: '🔒', label: 'Secure checkout',     sub: 'Powered by Stripe' },
            { icon: '↩️', label: 'No contracts, cancel anytime', sub: 'Cancel your subscription at any time' },
            { icon: '⚡', label: 'Instant access',       sub: 'Start in seconds'   },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{t.icon}</span>
              <p className="text-sm font-semibold text-gray-300">{t.label}</p>
              <p className="text-xs text-gray-500">{t.sub}</p>
            </div>
          ))}
        </div>

        {/* FAQ strip */}
        <div className="mt-16 max-w-xl mx-auto space-y-4">
          <h2 className="text-lg font-black text-white text-center mb-6">Common questions</h2>
          {[
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. Cancel from your account settings at any time — no penalties or lock-in.',
            },
            {
              q: 'What payment methods are accepted?',
              a: "All major credit and debit cards via Stripe's secure checkout.",
            },
            {
              q: 'How does the free trial work?',
              a: 'Your first 30 days are completely free. You get full Pro access from day one — no restricted features, no gotchas. If you cancel before day 31, you pay nothing. After the trial, billing starts at $39/month.',
            },
          ].map((item) => (
            <div key={item.q} className="border border-white/10 bg-[#0a0f1e] rounded-xl p-5">
              <p className="text-sm font-semibold text-white mb-1">{item.q}</p>
              <p className="text-sm text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
