'use client'

import { useState } from 'react'
import Link from 'next/link'

const SUBJECTS = [
  'General Question',
  'Billing & Subscription',
  'Data & Leads Question',
  'Technical Issue',
  'Other',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactPage() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [status,  setStatus]  = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim().length < 20) return

    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, subject, message }),
      })

      if (res.ok) {
        setStatus('success')
        setName(''); setEmail(''); setMessage(''); setSubject(SUBJECTS[0])
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const inputCls =
    'w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden px-4 py-16">

      {/* Background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-900 group-hover:bg-blue-500 transition-colors">
              P
            </span>
            <span className="font-bold text-white">PropertySignalHQ</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Contact Us</h1>
          <p className="text-sm text-gray-400 mt-1.5">
            We typically reply within 24 hours.
          </p>
        </div>

        {/* Card */}
        <div className="w-full p-8 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl">

          {/* Success */}
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <span className="text-5xl text-green-400">✓</span>
              <p className="text-white font-bold text-lg">Message sent!</p>
              <p className="text-sm text-gray-400">
                We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Error banner */}
              {status === 'error' && (
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Failed to send. Please try again.
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={inputCls}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Subject
                </label>
                <select
                  id="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s} className="bg-gray-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  minLength={20}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help (min. 20 characters)"
                  className={`${inputCls} resize-none`}
                />
                {message.length > 0 && message.length < 20 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {20 - message.length} more character{20 - message.length !== 1 ? 's' : ''} required
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading' || message.trim().length < 20}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/25 mt-2 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send Message'
                )}
              </button>

            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">
            ← Back to home
          </Link>
        </p>

      </div>
    </div>
  )
}
