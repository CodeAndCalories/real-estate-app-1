'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ── localStorage helpers ──────────────────────────────────────────────────────

type StoredUser = {
  email: string
  password: string
  createdAt: number
}

function readUsers(): StoredUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('pshq-users')
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Support both array and legacy object format
    if (Array.isArray(parsed)) return parsed as StoredUser[]
    // Legacy Record<email, StoredUser> → convert to array
    return Object.values(parsed) as StoredUser[]
  } catch {
    return []
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem('pshq-users', JSON.stringify(users))
  } catch { /* ignore */ }
}

function createSession(email: string) {
  try {
    localStorage.setItem(
      'pshq-session',
      JSON.stringify({ email, createdAt: new Date().toISOString() }),
    )
  } catch { /* ignore */ }
}

function getSession(): { email: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('pshq-session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Password strength meter ───────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length

  const barColor = (idx: number) => {
    if (strength < idx + 1) return 'bg-gray-200'
    if (strength <= 1) return 'bg-red-400'
    if (strength === 2) return 'bg-orange-400'
    if (strength === 3) return 'bg-yellow-400'
    return 'bg-green-500'
  }

  const label =
    strength <= 1 ? 'Weak'
    : strength === 2 ? 'Fair'
    : strength === 3 ? 'Good'
    : 'Strong'

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${barColor(i)}`} />
        ))}
      </div>
      <p className="text-xs text-gray-400">
        Strength: <span className="font-medium text-gray-600">{label}</span>
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPw, setShowPw]       = useState(false)
  const [showCfm, setShowCfm]     = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)

  // Redirect already-authenticated users
  useEffect(() => {
    if (getSession()) {
      router.replace('/finder')
    } else {
      setAuthChecked(true)
      emailRef.current?.focus()
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedEmail = email.trim().toLowerCase()

    // Client-side validation
    if (!trimmedEmail || !password) {
      setError('Email and password are required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    // Small delay for button feedback
    await new Promise((r) => setTimeout(r, 300))

    const users = readUsers()
    const exists = users.some((u) => u.email === trimmedEmail)
    if (exists) {
      setLoading(false)
      setError('An account with this email already exists.')
      return
    }

    // Store new user
    const newUser: StoredUser = {
      email: trimmedEmail,
      password,
      createdAt: Date.now(),
    }
    writeUsers([...users, newUser])
    createSession(trimmedEmail)

    router.push('/finder')
  }

  // Spinner while checking existing session
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-200 group-hover:bg-blue-700 transition-colors">
              P
            </span>
            <span className="font-bold text-gray-900">PropertySignalHQ</span>
          </Link>
          <h1 className="mt-6 text-2xl font-black text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1.5">Start finding off-market deals in seconds</p>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['No credit card needed', 'Free to explore', 'Cancel anytime'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full font-medium">
              <span className="text-green-500">✓</span> {t}
            </span>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/60 p-8">

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="At least 6 characters"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showCfm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError('') }}
                  placeholder="Re-enter your password"
                  className={`w-full border rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
                    confirm && confirm !== password
                      ? 'border-red-300 focus:ring-red-400'
                      : confirm && confirm === password
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCfm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={showCfm ? 'Hide password' : 'Show password'}
                >
                  {showCfm ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {/* Inline match indicator */}
                {confirm && (
                  <span className={`absolute right-10 top-1/2 -translate-y-1/2 text-xs font-medium ${
                    confirm === password ? 'text-green-500' : 'text-red-400'
                  }`}>
                    {confirm === password ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-200 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-5 leading-relaxed">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
              Terms
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors">
            Log in
          </Link>
        </p>

      </div>
    </div>
  )
}
