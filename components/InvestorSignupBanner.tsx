'use client'

import { useState } from 'react'

type Props = {
  isDark: boolean
}

type SubmitState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

export default function InvestorSignupBanner({ isDark: _isDark }: Props) {
  const [email,       setEmail]       = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || submitState === 'loading') return
    setSubmitState('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })

      if (res.status === 409) {
        setSubmitState('duplicate')
        return
      }
      if (!res.ok) {
        setSubmitState('error')
        return
      }
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div className="rounded-xl border px-6 py-5 mb-6 flex items-center gap-3 bg-emerald-900/20 border-emerald-700">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-sm font-bold text-emerald-400">You&apos;re on the list!</p>
          <p className="text-xs mt-0.5 text-emerald-500">
            We&apos;ll send the best opportunities directly to your inbox.
          </p>
        </div>
      </div>
    )
  }

  if (submitState === 'duplicate') {
    return (
      <div className="rounded-xl border px-6 py-5 mb-6 flex items-center gap-3 bg-blue-900/20 border-blue-700">
        <span className="text-2xl">👋</span>
        <div>
          <p className="text-sm font-bold text-blue-400">Already subscribed!</p>
          <p className="text-xs mt-0.5 text-blue-500">
            That email is already on our list — keep an eye on your inbox.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border px-6 py-5 mb-6 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-blue-800">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-bold leading-snug text-white">
            Get the best investment properties delivered daily.
          </p>
          <p className="text-xs mt-1 text-gray-400">
            Top-scored signals, price drops, and off-market deals — right in your inbox.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 sm:w-56 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={submitState === 'loading'}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {submitState === 'loading' ? 'Saving…' : 'Get Daily Deals'}
          </button>
        </form>
        {submitState === 'error' && (
          <p className="text-xs text-red-400 sm:absolute sm:mt-12">
            Something went wrong — please try again.
          </p>
        )}
      </div>
    </div>
  )
}
