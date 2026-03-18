'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
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
}

interface ChatMessage {
  role: 'user' | 'bot'
  text: string
  showMenu?: boolean
}

// ── Menu definition ───────────────────────────────────────────────────────────

const MENU_ITEMS: MenuItem[] = [
  { id: 'pricing',          emoji: '💰', label: 'Pricing & Billing'        },
  { id: 'what-do-i-get',   emoji: '⭐', label: 'What Do I Get?'           },
  { id: 'how-it-works',    emoji: '📊', label: 'How It Works'             },
  { id: 'market-coverage', emoji: '📍', label: 'Market Coverage'          },
  { id: 'login-recovery',  emoji: '🔐', label: 'Login, Signup & Recovery' },
  { id: 'how-to-cancel',   emoji: '❌', label: 'How to Cancel'            },
]

// ── Keyword matcher ───────────────────────────────────────────────────────────

function getReply(input: string, isPro: boolean): string | null {
  const text = input.toLowerCase()

  if (text.includes('price') || text.includes('cost') || text.includes('$') || text.includes('39')) {
    return 'PropertySignalHQ is $39/month with no hidden fees. Full access to all 30 markets, unlimited searches, and complete property signal data. Most users start finding opportunities within their first session. Cancel anytime. No contracts.'
  }
  if (text.includes('market') || text.includes('city') || text.includes('where') || text.includes('cover')) {
    return 'We track 30 major US markets including Miami, Dallas, Phoenix, Atlanta, Chicago, Nashville, Austin, Denver, Charlotte, and more. Data is updated daily.'
  }
  if (text.includes('cancel') || text.includes('refund') || text.includes('stop')) {
    return 'You can cancel anytime — no contracts or commitments. Log in → click your email top right → Manage Subscription. You keep access until end of billing period.'
  }
  if (text.includes('login') || text.includes('log in') || text.includes('password') || text.includes('account') || text.includes('sign')) {
    return 'You can sign up at /signup, log in at /login, or reset your password using the Forgot Password link on the login page.'
  }
  if (text.includes('get') || text.includes('include') || text.includes('feature') || text.includes('pro')) {
    return 'With Pro you get: off-market property signals scored 0–100, full owner contact info (phone + email), equity data, coverage across 30 US cities, and daily updated leads.'
  }
  if (text.includes('how') && (text.includes('work') || text.includes('signal'))) {
    return 'We analyze property data across 30 US cities and score each property 0–100 based on signal strength. Higher score = higher likelihood of being an off-market opportunity.'
  }
  if (text.includes('worth') || text.includes('should i') || text.includes('good') || text.includes('better')) {
    return isPro
      ? 'You already have full access. Head to the dashboard to explore signals.'
      : 'Most users start finding opportunities within their first session. Full access is $39/month, cancel anytime.'
  }
  return null
}

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
      <Link href="/contact" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
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
        fees. You get full access to all 30 markets, unlimited searches, and complete property
        signal data.
        <br /><br />
        Most users start finding opportunities within their first session. Cancel anytime. No contracts.
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
          'Coverage across 30 US cities',
          'Daily updated leads',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-400">•</span>
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-gray-400">Everything built for investors who want to move fast.</p>
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
        We analyze property data across 30 US cities and score each property{' '}
        <span className="font-semibold text-white">0–100</span> based on signal strength. Higher
        score = higher likelihood of being an off-market opportunity.
        <br /><br />
        Pro users see full scores, owner contact info, and equity data. Free users see a preview
        with masked data.
        <br /><br />
        <span className="font-semibold text-white">
          Pro users unlock full scores, owner contact info, and complete data access.
        </span>
      </p>
      <p className="mt-3 text-sm">
        <Link href="/upgrade" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          See pricing →
        </Link>
      </p>
      <div className="mt-4"><BackButton onBack={onBack} /></div>
      <StillNeedHelp onClose={onClose} />
    </div>
  )
}

function MarketCoverageScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-gray-300">
        We track <span className="font-semibold text-white">30 major US markets</span> including
        Miami, Dallas, Phoenix, Atlanta, Chicago, Nashville, Austin, Denver, and more. Data is updated daily so
        there are always fresh opportunities to explore.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/finder" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          View all signals →
        </Link>
      </p>
      <div className="mt-4"><BackButton onBack={onBack} /></div>
      <StillNeedHelp onClose={onClose} />
    </div>
  )
}

function LoginRecoveryScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  return (
    <div>
      <p className="mb-3 text-sm text-gray-300">Here are some quick links to help you get started or back in:</p>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/signup" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">Sign up for free →</Link>
        </li>
        <li>
          <Link href="/login" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">Log in to your account →</Link>
        </li>
        <li>
          <Link href="/login" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">Forgot your password? →</Link>
          <span className="ml-1 text-gray-500">(click Forgot Password)</span>
        </li>
        <li className="text-gray-400">Manage your subscription → log in then click your email top right</li>
      </ul>
      <p className="mt-3 text-sm text-gray-400">
        If you&apos;re having trouble logging in,{' '}
        <Link href="/contact" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">contact us</Link>{' '}
        and we&apos;ll sort it out.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/contact" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">Contact support →</Link>
      </p>
      <div className="mt-4"><BackButton onBack={onBack} /></div>
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
        Log in → click your email top right →{' '}
        <span className="font-semibold text-white">Manage Subscription</span> → cancel from there.
        You keep access until the end of your billing period.
        <br /><br />
        You stay in control at all times.
      </p>
      <p className="mt-3 text-sm">
        <Link href="/contact" onClick={onClose} className="text-blue-400 underline hover:text-blue-300">
          Need help cancelling? Contact us →
        </Link>
      </p>
      <div className="mt-4"><BackButton onBack={onBack} /></div>
      <StillNeedHelp onClose={onClose} />
    </div>
  )
}

// ── Menu buttons (reusable in chat fallback) ──────────────────────────────────

function MenuButtons({
  onSelect,
  onClose,
}: {
  onSelect: (id: Screen) => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {MENU_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className="flex w-full items-center gap-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-left text-sm font-medium text-gray-200 transition-all hover:bg-white/10 active:scale-[0.98]"
        >
          <span>{item.emoji}</span>
          {item.label}
        </button>
      ))}
      <Link
        href="/contact"
        onClick={onClose}
        className="flex w-full items-center gap-2.5 rounded-lg border border-blue-600/20 bg-blue-600/10 px-3 py-2.5 text-left text-sm font-medium text-blue-400 transition-all hover:bg-blue-600/20 active:scale-[0.98]"
      >
        <span>📩</span>
        Talk to Support
      </Link>
    </div>
  )
}

// ── Main widget ───────────────────────────────────────────────────────────────

export default function SupportWidget() {
  const [open,     setOpen]     = useState(false)
  const [screen,   setScreen]   = useState<Screen>('menu')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input,    setInput]    = useState('')

  const { user }    = useAuth()
  const { isPro }   = useProStatus(user?.email)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleOpen = useCallback(() => {
    setScreen('menu')
    setMessages([])
    setInput('')
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const goBack = useCallback(() => setScreen('menu'), [])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMsg: ChatMessage = { role: 'user', text: trimmed }
    const reply = getReply(trimmed, isPro)
    const fallbackText = isPro
      ? "I'm not sure about that. Contact support and we'll help."
      : "I'm not sure about that yet. If you're ready, you can unlock full access anytime — or contact support."
    const botMsg: ChatMessage = reply
      ? { role: 'bot', text: reply }
      : { role: 'bot', text: fallbackText, showMenu: true }

    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput('')
  }, [input])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSend()
    },
    [handleSend],
  )

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">

      {/* ── Panel ──────────────────────────────────────────────────────────── */}
      {open && (
        <div className="w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#020617] shadow-2xl shadow-black/60 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300 flex flex-col">

          {/* Header */}
          <div className="bg-blue-600 px-4 py-3 flex-shrink-0">
            <p className="text-sm font-bold text-white">PropertySignalHQ Support</p>
            <p className="text-xs text-blue-200">We&apos;ll get back within 24 hours</p>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 max-h-[60vh]">

            {/* Signed-in indicator */}
            {user?.email && (
              <p className="mb-3 text-xs text-gray-500">
                Signed in as <span className="font-medium text-gray-400">{user.email}</span>
              </p>
            )}

            {/* Chat message bubbles */}
            {messages.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-gray-200'
                    }`}>
                      {msg.text}
                      {msg.showMenu && (
                        <MenuButtons onSelect={(id) => setScreen(id)} onClose={handleClose} />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
            )}

            {/* Menu screen (shown when no messages yet, or always for button navigation) */}
            {screen === 'menu' && messages.length === 0 && (
              <div>
                {/* Greeting */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-white">
                    Hi 👋 Need help or curious how PropertySignalHQ works?
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {isPro
                      ? 'Your Pro plan is active. You have full access to all signals.'
                      : 'Upgrade anytime to unlock full property data.'}
                  </p>
                </div>
                <MenuButtons onSelect={(id) => setScreen(id)} onClose={handleClose} />
              </div>
            )}

            {/* Answer screens */}
            {screen !== 'menu' && (
              <>
                {screen === 'pricing'         && <PricingScreen        onBack={goBack} onClose={handleClose} isPro={isPro} />}
                {screen === 'what-do-i-get'   && <WhatDoIGetScreen     onBack={goBack} onClose={handleClose} isPro={isPro} />}
                {screen === 'how-it-works'    && <HowItWorksScreen     onBack={goBack} onClose={handleClose} />}
                {screen === 'market-coverage' && <MarketCoverageScreen onBack={goBack} onClose={handleClose} />}
                {screen === 'login-recovery'  && <LoginRecoveryScreen  onBack={goBack} onClose={handleClose} />}
                {screen === 'how-to-cancel'   && <HowToCancelScreen    onBack={goBack} onClose={handleClose} />}
              </>
            )}

          </div>

          {/* Input bar — always visible at bottom */}
          <div className="flex-shrink-0 border-t border-white/10 px-3 py-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Send message"
                className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

    </div>
  )
}
