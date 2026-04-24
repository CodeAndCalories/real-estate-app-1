'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function StickyCtaBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4"
      style={{
        background: 'rgba(9, 15, 30, 0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(37, 99, 235, 0.35)',
        boxShadow: '0 -4px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Left: text */}
      <p className="text-sm font-medium text-gray-300 text-center sm:text-left">
        Find motivated seller leads in your market
      </p>

      {/* Right: CTA + dismiss */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          href="/signup"
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/25 whitespace-nowrap w-full sm:w-auto text-center"
        >
          Start Free Trial →
        </Link>

        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex-shrink-0 p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-white/10 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
