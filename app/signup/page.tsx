'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

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
    if (strength < idx + 1) return 'bg-white/10'
    if (strength <= 1) return 'bg-red-500'
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
      <p className="text-xs text-gray-500">
        Strength: <span className="font-medium text-gray-400">{label}</span>
      </p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter()
  const { loaded, isLoggedIn, signup } = useAuth()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPw, setShowPw]       = useState(false)
  const [showCfm, setShowCfm]     = useState(false)

  const emailRef = useRef<HTMLInputElement>(null)

  // Redirect already-authenticated users
  useEffect(() => {
    if (loaded && isLoggedIn) {
      router.replace('/finder')
    } else if (loaded) {
      emailRef.current?.focus()
    }
  }, [loaded, isLoggedIn, router])

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
    const result = await signup(trimmedEmail, password)
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    router.push('/upgrade')
  }

  // Spinner while checking existing session
  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-8 h-8 rounded-full border-4 border-blue-900 border-t-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden px-4 py-16">

      {/* Background glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <div className="z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-900 group-hover:bg-blue-500 transition-colors">
              P
            </span>
            <span className="font-bold text-white">PropertySignalHQ</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Create your account</h1>
          <p className="text-sm text-gray-400 mt-1.5">Start finding off-market deals in seconds</p>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['Free to explore', 'Cancel anytime'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full font-medium">
              <span className="text-green-500">✓</span> {t}
            </span>
          ))}
        </div>

        {/* Card */}
        <div className="w-full max-w-md p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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
              <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-1.5">
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
                className="w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-1.5">
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
                  className="w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 rounded-lg p-3 pr-11 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
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
              <label htmlFor="confirm" className="block text-sm font-semibold text-gray-300 mb-1.5">
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
                  className={`w-full bg-white/5 border text-white placeholder:text-gray-500 rounded-lg p-3 pr-11 focus:ring-2 outline-none transition-all ${
                    confirm && confirm !== password
                      ? 'border-red-500/40 focus:ring-red-500'
                      : confirm && confirm === password
                      ? 'border-green-500/40 focus:ring-green-500'
                      : 'border-white/10 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCfm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
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
                    confirm === password ? 'text-green-400' : 'text-red-400'
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 mt-2 flex items-center justify-center gap-2"
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
          <p className="text-center text-xs text-gray-500 mt-5 leading-relaxed">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="underline underline-offset-2 hover:text-gray-300 transition-colors">
              Terms
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Log in
          </Link>
        </p>

      </div>
    </div>
  )
}
