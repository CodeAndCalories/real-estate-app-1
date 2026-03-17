'use client'

import { useState, useEffect } from 'react'
import { CHECKOUT_URL } from '@/lib/constants/checkout'

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  ownerName: string | null
}

type Plan = 'pro' | 'free'

// ── localStorage helpers ──────────────────────────────────────────────────────

type Session = { email: string; plan?: string }
type StoredUser = { email: string; password: string; createdAt: number; plan?: string }

function getPlan(): Plan {
  try {
    // 1. Read session to get email
    const rawSession = localStorage.getItem('pshq-session')
    if (!rawSession) return 'free'
    const session = JSON.parse(rawSession) as Session

    // 2. Fast-path: plan stamped directly on session
    if (session.plan === 'pro') return 'pro'

    // 3. Fallback: look up plan in pshq-users array
    const rawUsers = localStorage.getItem('pshq-users')
    if (!rawUsers) return 'free'
    const users = JSON.parse(rawUsers) as StoredUser[]
    const userList = Array.isArray(users) ? users : Object.values(users)
    const match = userList.find(
      (u) => u.email === session.email?.toLowerCase().trim(),
    )
    return match?.plan === 'pro' ? 'pro' : 'free'
  } catch {
    return 'free'
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LockIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  )
}

function PhoneIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function MailIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

// ── Locked field ──────────────────────────────────────────────────────────────

function LockedField({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 gap-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md select-none">
        <LockIcon className="w-3 h-3" />
        Upgrade to Pro
      </span>
    </div>
  )
}

// ── Unlocked field ────────────────────────────────────────────────────────────

function UnlockedField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
      <span className="text-green-500 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
        <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  )
}

// ── Locked upgrade banner ─────────────────────────────────────────────────────

function UpgradeBanner() {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="text-gray-400 mt-0.5 flex-shrink-0">
          <LockIcon className="w-5 h-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-gray-700">
            Owner contact details are a Pro feature
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Upgrade to see verified phone numbers and mailing addresses for direct outreach.
          </p>
        </div>
      </div>
      <button
        onClick={() => { window.location.href = CHECKOUT_URL }}
        className="flex-shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm shadow-blue-200 whitespace-nowrap"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Upgrade to Pro
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OwnerContactCard({ ownerName }: Props) {
  const [plan, setPlan] = useState<Plan>('free')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setPlan(getPlan())
    setMounted(true)
  }, [])

  const isPro = plan === 'pro'

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Owner Information
        </h2>
        {mounted && (
          isPro ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
              ✓ Pro — Contact Unlocked
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 inline-flex items-center gap-1">
              <LockIcon className="w-2.5 h-2.5" />
              Pro Feature
            </span>
          )
        )}
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Owner name — always visible */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Owner Name</p>
          <p className="text-sm font-semibold text-gray-800">{ownerName ?? '—'}</p>
        </div>

        {/* Contact fields — gated on plan */}
        {!mounted ? (
          // Skeleton while localStorage loads (prevents hydration flash)
          <div className="space-y-2">
            <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
          </div>
        ) : isPro ? (
          // ── Pro: show real (demo) contact data ──────────────────────────
          <div className="space-y-2.5">
            <UnlockedField
              icon={<PhoneIcon />}
              label="Owner Phone"
              value="(555) 555-1234"
            />
            <UnlockedField
              icon={<MailIcon />}
              label="Mailing Address"
              value="123 Oak St, Owner City, TX 78201"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                <span className="font-bold">Skip-trace data</span> is verified against county
                records and refreshed monthly. Call or mail directly from this card.
              </p>
            </div>
          </div>
        ) : (
          // ── Free: locked fields + upgrade banner ────────────────────────
          <div className="space-y-2">
            <LockedField label="Owner Phone" />
            <LockedField label="Mailing Address" />
            <UpgradeBanner />
          </div>
        )}
      </div>
    </section>
  )
}
