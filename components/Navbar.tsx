'use client'

import Link from 'next/link'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 relative z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-blue-600 shrink-0">
          PropertySignal
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            How It Works
          </Link>
          <Link href="/#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Pricing
          </Link>
          <Link href="/#faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            FAQ
          </Link>
          <ThemeToggle />
          <Link
            href="/finder"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Find Leads
          </Link>
        </div>

        {/* Mobile: ThemeToggle + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
          <Link
            href="/#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-gray-600 hover:text-blue-600 py-1.5 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-gray-600 hover:text-blue-600 py-1.5 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-gray-600 hover:text-blue-600 py-1.5 transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/finder"
            onClick={() => setMobileOpen(false)}
            className="block w-full text-center text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors mt-2"
          >
            Find Leads
          </Link>
        </div>
      )}
    </nav>
  )
}
