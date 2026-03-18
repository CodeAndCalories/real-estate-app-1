'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'
import posthog from 'posthog-js'

/** First letter of email, uppercased — used as avatar initials. */
function initials(email: string): string {
  return email.charAt(0).toUpperCase()
}

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How It Works'  },
  { href: '/#pricing',      label: 'Pricing'       },
  { href: '/analyze',       label: 'Analyze Deal'  },
  { href: '/#faq',          label: 'FAQ'           },
  { href: '/contact',       label: 'Contact'       },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, loaded, isLoggedIn, logout } = useAuth()
  const { isPro } = useProStatus(user?.email)
  const router = useRouter()

  useEffect(() => {
    if (loaded && isLoggedIn && user?.email) {
      posthog.identify(user.email)
    }
  }, [loaded, isLoggedIn, user?.email])

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
    <nav className="bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* ── Logo ────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 pl-2 shrink-0 group">
          <svg
            width="40" height="40" viewBox="0 0 40 40" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="group-hover:opacity-80 transition-opacity duration-150"
          >
            <path d="M12 32V8H22C26.4183 8 30 11.5817 30 16C30 20.4183 26.4183 24 22 24H18.5L12 32Z" fill="white"/>
            <path d="M10 26L18 18" stroke="#020617" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span className="font-display font-bold text-white text-base hidden xs:block">
            PropertySignal<span className="text-blue-400">HQ</span>
          </span>
          <span className="ml-2 hidden xs:inline-block text-[10px] px-1.5 py-0.5 rounded font-medium bg-white/5 text-gray-500 border border-white/10">
            BETA
          </span>
        </Link>

        {/* ── Desktop nav links ────────────────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-150"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── Desktop auth area ────────────────────────────────────────── */}
        <div className="hidden sm:flex items-center gap-3">

          {/* Skeleton while loading (prevents hydration flash) */}
          {!loaded ? (
            <div className="flex items-center gap-2">
              <div className="w-16 h-8 rounded-lg bg-white/5 animate-pulse" />
              <div className="w-24 h-8 rounded-lg bg-white/5 animate-pulse" />
            </div>
          ) : isLoggedIn && user ? (

            /* ── Logged-in ── */
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-300 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {initials(user.email)}
                </span>
                <span className="text-sm text-gray-300 max-w-[120px] truncate">{user.email}</span>
                {isPro && (
                  <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">● Pro</span>
                )}
                <svg
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#0f172a] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                    <p className="text-xs text-gray-200 font-semibold truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/finder"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                  >
                    <span>📊</span> Dashboard
                  </Link>
                  {isPro && (
                    <Link
                      href="/saved-deals"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <span>🔖</span> Saved Deals
                    </Link>
                  )}
                  {isPro && (
                    <Link
                      href="/favorites"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <span>⭐</span> Favorites
                    </Link>
                  )}
                  {isPro && (
                    <button
                      onClick={handleManageSubscription}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors text-left"
                    >
                      <span>⚙️</span> Manage Subscription
                    </button>
                  )}
                  <div className="border-t border-white/10" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
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
                className="text-sm font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-colors duration-150"
              >
                Login
              </Link>
              <a
                href="/upgrade"
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors duration-150 shadow-lg shadow-blue-600/25"
              >
                Get Started
              </a>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ────────────────────────────────────────── */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
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
        <div className="sm:hidden border-t border-white/5 bg-[#0a0f1e] px-6 py-4 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-gray-400 hover:text-white py-2 transition-colors"
            >
              {l.label}
            </Link>
          ))}

          <div className="pt-3 mt-1 border-t border-white/5 space-y-2">
            {loaded && isLoggedIn && user ? (
              /* Logged-in mobile */
              <>
                <div className="flex items-center gap-2.5 py-1">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initials(user.email)}
                  </span>
                  <span className="text-sm text-gray-300 truncate">{user.email}</span>
                </div>
                <Link
                  href="/finder"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center text-sm font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 px-4 py-2.5 rounded-lg transition-colors"
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
                  className="block w-full text-center text-sm font-semibold text-gray-300 border border-white/10 hover:bg-white/5 px-4 py-2.5 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <a
                  href="/upgrade"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg transition-colors"
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
