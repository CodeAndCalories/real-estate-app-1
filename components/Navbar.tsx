'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'

/** First letter of email, uppercased — used as avatar initials. */
function initials(email: string): string {
  return email.charAt(0).toUpperCase()
}

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#pricing',      label: 'Pricing'      },
  { href: '/#faq',          label: 'FAQ'          },
  { href: '/contact',       label: 'Contact'      },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, loaded, isLoggedIn, logout } = useAuth()
  const { isPro } = useProStatus(user?.email)
  const router = useRouter()

  const handleManageSubscription = async () => {
    if (!user?.email) return
    setUserMenuOpen(false)
    try {
      const res = await fetch('/api/stripe/portal', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: user.email }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      // Silent fail — portal redirect is non-critical
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setMobileOpen(false)
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ── Logo ────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-blue-200 group-hover:bg-blue-700 transition-colors">
            P
          </span>
          <span className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors hidden xs:block">
            PropertySignal<span className="text-blue-600">HQ</span>
          </span>
        </Link>

        {/* ── Desktop nav links ────────────────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── Desktop auth area ────────────────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />

          {/* Skeleton while loading (prevents hydration flash) */}
          {!loaded ? (
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 rounded-lg bg-gray-100 animate-pulse" />
              <div className="w-24 h-8 rounded-lg bg-blue-100 animate-pulse" />
            </div>
          ) : isLoggedIn && user ? (

            /* ── Logged-in ── */
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials(user.email)}
                </span>
                <span className="text-sm text-gray-700 max-w-[140px] truncate">{user.email}</span>
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-100/80 overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                    <p className="text-xs text-gray-700 font-semibold truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/finder"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  {isPro && (
                    <button
                      onClick={handleManageSubscription}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      <span>⚙️</span> Manage Subscription
                    </button>
                  )}
                  <div className="border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <span aria-hidden>↩</span> Log out
                  </button>
                </div>
              )}
            </div>

          ) : (

            /* ── Logged-out ── */
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                Login
              </Link>
              <a
                href="/upgrade"
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm shadow-blue-200"
              >
                Get Started
              </a>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ────────────────────────────────────────── */}
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

      {/* ── Mobile dropdown ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-600 hover:text-blue-600 py-2 transition-colors"
            >
              {l.label}
            </Link>
          ))}

          <div className="pt-3 mt-1 border-t border-gray-100 space-y-2">
            {loaded && isLoggedIn && user ? (
              /* Logged-in mobile */
              <>
                <div className="flex items-center gap-2.5 py-1">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initials(user.email)}
                  </span>
                  <span className="text-sm text-gray-700 truncate">{user.email}</span>
                </div>
                <Link
                  href="/finder"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2.5 rounded-lg transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              /* Logged-out mobile */
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <a
                  href="/upgrade"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click-outside overlay to close user dropdown */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  )
}
