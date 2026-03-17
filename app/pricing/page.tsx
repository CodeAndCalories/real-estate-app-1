'use client'

import Link from 'next/link'
import { CHECKOUT_URL } from '@/lib/constants/checkout'

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-blue-200 group-hover:bg-blue-700 transition-colors">
              P
            </span>
            <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              PropertySignal<span className="text-blue-600">HQ</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20">

        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-blue-50 text-blue-600">
            Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
            Find More Deals.<br className="hidden sm:block" /> Pay Less Than One Deal Is Worth.
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            One flat plan. Everything you need to find, analyze, and close off-market opportunities.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Free card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Free</p>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-4xl font-black text-gray-900 leading-none">$0</span>
              <span className="text-sm text-gray-400 mb-1.5">/ forever</span>
            </div>
            <p className="text-sm text-gray-500 mb-7">Explore the platform with no commitment.</p>

            <ul className="space-y-2.5 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-gray-400 mt-0.5 shrink-0">✓</span>
                  <span className="text-sm text-gray-600">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/finder"
              className="block w-full text-center font-bold text-sm py-3 rounded-xl border border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              Browse Free
            </Link>
          </div>

          {/* Pro card */}
          <div className="rounded-2xl border border-blue-500 bg-blue-600 p-8 flex flex-col relative shadow-2xl shadow-blue-300/40">
            {/* Badge */}
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap">
              Most Popular
            </span>

            <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">
              PropertySignalHQ Pro
            </p>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-4xl font-black text-white leading-none">$39</span>
              <span className="text-sm text-blue-200 mb-1.5">/ month</span>
            </div>
            <p className="text-sm text-blue-100 mb-7">
              Everything investors need to find and close off-market deals.
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
              onClick={() => { window.location.href = CHECKOUT_URL }}
              className="w-full bg-white hover:bg-blue-50 text-blue-600 font-bold text-sm py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Upgrade to Pro →
            </button>

            <p className="text-center text-xs text-blue-300 mt-3">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-14 flex flex-wrap justify-center gap-8 text-center">
          {[
            { icon: '🔒', label: 'Secure checkout', sub: 'Powered by Lemon Squeezy' },
            { icon: '↩️', label: '14-day refund policy', sub: 'No questions asked' },
            { icon: '⚡', label: 'Instant access', sub: 'Start in seconds' },
          ].map((t) => (
            <div key={t.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{t.icon}</span>
              <p className="text-sm font-semibold text-gray-800">{t.label}</p>
              <p className="text-xs text-gray-400">{t.sub}</p>
            </div>
          ))}
        </div>

        {/* FAQ strip */}
        <div className="mt-16 max-w-xl mx-auto space-y-5">
          <h2 className="text-lg font-black text-gray-900 text-center mb-6">Common questions</h2>
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your Lemon Squeezy dashboard at any time — no penalties or lock-in.' },
            { q: 'What payment methods are accepted?', a: 'All major credit and debit cards via Lemon Squeezy's secure checkout.' },
            { q: 'Is there a free trial?', a: 'The free tier lets you browse the full signal database before you commit to Pro.' },
          ].map((item) => (
            <div key={item.q} className="border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-800 mb-1">{item.q}</p>
              <p className="text-sm text-gray-500">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
