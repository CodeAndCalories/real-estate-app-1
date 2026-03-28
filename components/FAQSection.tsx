'use client'

import { useState } from 'react'

type Props = {
  isDark: boolean
}

const FAQS = [
  {
    q: 'What kind of leads does this tool find?',
    a: 'The tool surfaces three types of off-market leads: Pre-Foreclosure / Distressed owners who are behind on payments, Recently Expired Listings that failed to sell, and Investor Opportunities with strong equity or rental yield signals. Each lead is scored 0–100 based on multiple opportunity signals.',
  },
  {
    q: 'How often are leads updated?',
    a: 'Leads are updated daily with live data pulled from public records, MLS expirations, and default notice filings.',
  },
  {
    q: 'Can I export leads?',
    a: 'Yes. Any search result can be exported as a CSV file formatted for dialers and CRM platforms. Each export includes the owner name, address, lead type, opportunity score, estimated value, equity estimate, and contact signals.',
  },
  {
    q: 'Do I need MLS access?',
    a: 'No. This tool uses public records, default notices, and expired listing data — none of which require MLS access. It is designed for agents, investors, and wholesalers who want to reach sellers before they list.',
  },
  {
    q: 'What cities are supported?',
    a: 'The platform covers 35 major US markets — Miami, Dallas, Phoenix, Atlanta, Chicago, Cleveland, Los Angeles, New York, Tampa, Nashville, Jacksonville, Denver, Houston, San Antonio, Austin, Charlotte, Raleigh, Columbus, Indianapolis, Orlando, Sacramento, Richmond, Oklahoma City, Cincinnati, and more — with hundreds of leads per city. Additional cities are added regularly.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Paid plans can be cancelled at any time from your account settings. You will retain access through the end of your current billing period. No long-term contracts or cancellation fees.',
  },
]

export default function FAQSection({ isDark: _isDark }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i)

  return (
    <section
      id="faq"
      className="py-12 md:py-20 px-4 sm:px-6 bg-[#0a0f1e]"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            FAQ
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white tracking-tighter">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-gray-400">
            Everything you need to know before getting started.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.03] transition-colors duration-150"
              >
                <span className="text-sm font-semibold pr-4 text-white">
                  {faq.q}
                </span>
                <span
                  className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full border transition-transform duration-150 ${
                    openIndex === i
                      ? 'border-blue-500 text-blue-400 rotate-45'
                      : 'border-white/20 text-gray-500'
                  }`}
                >
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                    <line x1="6" y1="1" x2="6" y2="11" />
                    <line x1="1" y1="6" x2="11" y2="6" />
                  </svg>
                </span>
              </button>

              {openIndex === i && (
                <div className="px-6 pb-6 text-sm leading-relaxed border-t border-white/10 text-gray-400">
                  <div className="pt-4">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
