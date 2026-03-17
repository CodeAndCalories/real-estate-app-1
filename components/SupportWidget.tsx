'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProStatus } from '@/lib/hooks/useProStatus'

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen =
  | 'menu'
  | 'pricing'
  | 'what-do-i-get'
  | 'how-it-works'
  | 'market-coverage'
  | 'login-recovery'
  | 'how-to-cancel'

interface MenuItem {
  id: Screen
  emoji: string
  label: string
  highlight?: boolean
}

// ── Menu definition ───────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  { id: 'pricing',         emoji: '💰', label: 'Pricing & Billing'         },
  { id: 'what-do-i-get',  emoji: '⭐', label: 'What Do I Get?'            },
  { id: 'how-it-works',   emoji: '📊', label: 'How It Works'              },
  { id: 'market-coverage', emoji: '📍', label: 'Market Coverage'           },
  { id: 'login-recovery',  emoji: '🔐', label: 'Login, Signup & Recovery'  },
  { id: 'how-to-cancel',   emoji: '❌', label: 'How to Cancel'             },
]

// ── Small reusable atoms ──────────────────────────────────────────────────────

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 active:scale-95"
    >
      ← Back
    </button>
  )
}

function StillNeedHelp({ onClose }: { onClose: () => void }) {
  return (
    <p className="mt-4 text-center text-xs text-gray-500">
      Still need help?{' '}
      <Link
        href="/contact"
        onClick={onClose}
        className="text-blue-400 underline hover:text-blue-300"
      >
        Contact us
      </Link>
    </p>
  )
}

function CtaButton({
  href,
  children,
  onClose,
  variant = 'primary',
}: {
  href: string
  children: React.ReactNode
  onClose: () => void
  variant?: 'primary' | 'secondary'
}) {
  const cls =
    variant === 'primary'
      ? 'w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95'
      : 'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 active:scale-95'
  return (
    <Link href={href} onClick={onClose} className={cls}>
      {children}
    </Link>
  )
}

// ── Screen content ────────────────────────────────────────────────────────────

function PricingScreen({ onBack, onClose, isPro }: { onBack: () => void; onClose: () => void; isPro: boolean }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-300">
        PropertySignalHQ is <span className="font-bold text-white">$39/month</span> with no hidden
        fees. You get full access to all 14 markets, unlimited searches, and complete property
        signal data.
        <br /><br />
        Most users start finding opportunities within their first session.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <CtaButton href={isPro ? '/finder' : '/upgrade'} onClose={onClose} variant="primary">
          {isPro ? 'View Signals' : 'Upgrade Now'}
        </CtaButton>
        <BackButton onBack={onBack} />
      </div>
      <p className="mt-3 text-center text-xs text-gray-500">
        Questions about billing?{' '}
        <Link href="/contact" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          Contact us
        </Link>
      </p>
    </div>
  )
}

function WhatDoIGetScreen({ onBack, onClose, isPro }: { onBack: () => void; onClose: () => void; isPro: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold text-white mb-2">With PropertySignalHQ Pro you unlock:</p>
      <ul className="space-y-1 text-sm text-gray-300">
        {[
          'Off-market property signals scored 0–100',
          'Full owner contact info (phone + email)',
          'Equity data and deal indicators',
          'Coverage across 14 US cities',
          'Daily updated leads',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-400">•</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-gray-400">
        Everything built for investors who want to move fast.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <CtaButton href="/finder" onClose={onClose} variant="secondary">View Signals</CtaButton>
        {!isPro && (
          <CtaButton href="/upgrade" onClose={onClose} variant="primary">Upgrade Now</CtaButton>
        )}
        <BackButton onBack={onBack} />
      </div>
      <StillNeedHelp onClose={onClose} />
    </div>
  )
}

function HowItWorksScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-300">
        We analyze property data across 14 US cities and score each property{' '}
        <span className="font-semibold text-white">0–100</span> based on signal strength. Higher
        score = higher likelihood of being an off-market opportunity.
        <br /><br />
        Pro users see full scores, owner contact info, and equity data. Free users see a preview
        with masked data.
        <br /><br />
        <span className="text-white font-semibold">
          Pro users unlock full scores, owner contact info, and complete data access.
        </span>
      </p>
      <p className="mt-3 text-sm">
        <Link href="/upgrade" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          See pricing →
        </Link>
      </p>
      <div className="mt-4">
        <BackButton onBack={onBack} />
      </div>
      <StillNeedHelp onClose={onClose} />
    </div>
  )
}

function MarketCoverageScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-300">
        We track <span className="font-semibold text-white">14 major US markets</span> including
        Miami, Dallas, Phoenix, Atlanta, Chicago, Nashville, and more. Data is updated daily so
        there are always fresh opportunities to explore.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/finder" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          View all signals →
        </Link>
      </p>
      <div className="mt-4">
        <BackButton onBack={onBack} />
      </div>
      <StillNeedHelp onClose={onClose} />
    </div>
  )
}

function LoginRecoveryScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div>
      <p className="mb-3 text-sm text-gray-300">
        Here are some quick links to help you get started or back in:
      </p>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/signup" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
            Sign up for free →
          </Link>
        </li>
        <li>
          <Link href="/login" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
            Log in to your account →
          </Link>
        </li>
        <li>
          <Link href="/login" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
            Forgot your password? →
          </Link>
          <span className="ml-1 text-gray-500">(click Forgot Password)</span>
        </li>
        <li className="text-gray-400">
          Manage your subscription → log in then click your email top right
        </li>
      </ul>
      <p className="mt-3 text-sm text-gray-400">
        If you&apos;re having trouble logging in,{' '}
        <Link href="/contact" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          contact us
        </Link>{' '}
        and we&apos;ll sort it out.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/contact" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          Contact support →
        </Link>
      </p>
      <div className="mt-4">
        <BackButton onBack={onBack} />
      </div>
      <StillNeedHelp onClose={onClose} />
    </div>
  )
}

function HowToCancelScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-300">
        You can cancel anytime — no contracts or commitments.
        <br /><br />
        Log in → click your email top right → <span className="font-semibold text-white">Manage Subscription</span> → cancel from there. You keep access until the end of your billing period.
        <br /><br />
        You stay in control at all times.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/contact" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          Need help cancelling? Contact us →
        </Link>
      </p>
      <div className="mt-4">
        <BackButton onBack={onBack} />
      </div>
      <StillNeedHelp onClose={onClose} />
    </div>
  )
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function SupportWidget() {
  const [open, setOpen]       = useState(false)
  const [screen, setScreen]   = useState<Screen>('menu')
  const { user } = useAuth()
  const { isPro } = useProStatus(user?.email)

  const handleOpen = useCallback(() => {
    setScreen('menu')
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const goBack = useCallback(() => setScreen('menu'), [])

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">

      {/* ── Panel ──────────────────────────────────────────────────────────── */}
      {open && (
        <div className="w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#020617] shadow-2xl shadow-black/60 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="bg-blue-600 px-4 py-3">
            <p className="text-sm font-bold text-white">PropertySignalHQ Support</p>
            <p className="text-xs text-blue-200">We&apos;ll get back within 24 hours</p>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto px-4 py-4">

            {/* Signed-in indicator */}
            {user?.email && (
              <p className="mb-3 text-xs text-gray-500">
                Signed in as{' '}
                <span className="font-medium text-gray-400">{user.email}</span>
              </p>
            )}

            {/* Menu screen */}
            {screen === 'menu' && (
              <div>
                {/* Greeting */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white">
                    Hi 👋 Need help or curious how PropertySignalHQ works?
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Free users can also upgrade anytime from here.
                  </p>
                </div>

                {/* Menu items */}
                <div className="flex flex-col gap-2">
                  {MENU_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setScreen(item.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm font-medium text-gray-200 transition-all hover:bg-white/10 active:scale-[0.98]"
                    >
                      <span>{item.emoji}</span>
                      {item.label}
                    </button>
                  ))}

                  {/* Talk to Support — highlighted */}
                  <Link
                    href="/contact"
                    onClick={handleClose}
                    className="flex w-full items-center gap-2.5 rounded-lg border border-blue-600/20 bg-blue-600/10 px-3 py-2.5 text-left text-sm font-medium text-blue-400 transition-all hover:bg-blue-600/20 active:scale-[0.98]"
                  >
                    <span>📩</span>
                    Talk to Support
                  </Link>
                </div>
              </div>
            )}

            {/* Answer screens */}
            {screen === 'pricing'         && <PricingScreen        onBack={goBack} onClose={handleClose} isPro={isPro} />}
            {screen === 'what-do-i-get'   && <WhatDoIGetScreen     onBack={goBack} onClose={handleClose} isPro={isPro} />}
            {screen === 'how-it-works'    && <HowItWorksScreen     onBack={goBack} onClose={handleClose} />}
            {screen === 'market-coverage' && <MarketCoverageScreen onBack={goBack} onClose={handleClose} />}
            {screen === 'login-recovery'  && <LoginRecoveryScreen  onBack={goBack} onClose={handleClose} />}
            {screen === 'how-to-cancel'   && <HowToCancelScreen    onBack={goBack} onClose={handleClose} />}

          </div>
        </div>
      )}

      {/* ── Toggle button ──────────────────────────────────────────────────── */}
      <button
        onClick={open ? handleClose : handleOpen}
        aria-label={open ? 'Close support' : 'Open support'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
      >
        {open ? (
          /* X icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* MessageCircle icon */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

    </div>
  )
}
