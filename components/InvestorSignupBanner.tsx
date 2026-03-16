'use client'

import { useState } from 'react'

type Props = {
  isDark: boolean
}

export default function InvestorSignupBanner({ isDark }: Props) {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    // Store locally
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('investor-emails') ?? '[]')
      if (!existing.includes(email.trim())) {
        localStorage.setItem('investor-emails', JSON.stringify([...existing, email.trim()]))
      }
    } catch { /* ignore */ }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className={`rounded-xl border px-6 py-5 mb-6 flex items-center gap-3 ${
        isDark
          ? 'bg-green-900/20 border-green-700'
          : 'bg-green-50 border-green-200'
      }`}>
        <span className="text-2xl">✅</span>
        <div>
          <p className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
            You&apos;re on the list!
          </p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-green-500' : 'text-green-600'}`}>
            We&apos;ll send the best opportunities directly to your inbox.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border px-6 py-5 mb-6 ${
      isDark
        ? 'bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-blue-800'
        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Get the best investment properties delivered daily.
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
            className={`flex-1 sm:w-56 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            Get Daily Deals
          </button>
        </form>
      </div>
    </div>
  )
}
