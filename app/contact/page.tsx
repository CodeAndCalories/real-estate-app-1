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

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export default function ContactPage() {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [message, setMessage] = useState('')
  const [status,  setStatus]  = useState<FormStatus>('idle')

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

  const input =
    'w-full bg-white/5 border border-white/10 text-white placeholder:text-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all'

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#020617] relative overflow-hidden flex items-center justify-center px-4 py-16">

      {/* Glow orbs */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg">

        {/* Logo + heading */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-md shadow-blue-900 transition-colors group-hover:bg-blue-500">
              P
            </span>
            <span className="font-bold text-white">PropertySignalHQ</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Contact Us</h1>
          <p className="mt-1.5 text-sm text-gray-400">We typically reply within 24 hours.</p>
        </div>

        {/* Email-us card */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 shrink-0 text-blue-400">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">Email us directly</p>
            <p className="mt-0.5 text-sm font-medium text-gray-300">contact@propertysignalhq.com</p>
          </div>
        </div>

        {/* Glassmorphism card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">

          {status === 'success' ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <span className="text-5xl text-green-400">✓</span>
              <p className="text-lg font-bold text-white">Message sent!</p>
              <p className="text-sm text-gray-400">We&apos;ll get back to you within 24 hours.</p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-2 text-sm text-blue-400 underline transition-colors hover:text-blue-300"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">

              {/* Error banner */}
              {status === 'error' && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Failed to send. Please try again.
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="c-name" className="mb-1.5 block text-sm font-semibold text-gray-300">
                  Name
                </label>
                <input
                  id="c-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className={input}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="c-email" className="mb-1.5 block text-sm font-semibold text-gray-300">
                  Email
                </label>
                <input
                  id="c-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={input}
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="c-subject" className="mb-1.5 block text-sm font-semibold text-gray-300">
                  Subject
                </label>
                <select
                  id="c-subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 p-3 text-white outline-none transition-all focus:ring-2 focus:ring-blue-500"
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
                <label htmlFor="c-message" className="mb-1.5 block text-sm font-semibold text-gray-300">
                  Message
                </label>
                <textarea
                  id="c-message"
                  required
                  rows={5}
                  minLength={20}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help (min. 20 characters)"
                  className={`${input} resize-none`}
                />
                {message.length > 0 && message.length < 20 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {20 - message.length} more character{20 - message.length !== 1 ? 's' : ''} required
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading' || message.trim().length < 20}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending…
                  </>
                ) : (
                  'Send Message'
                )}
              </button>

            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="transition-colors hover:text-gray-300">
            ← Back to home
          </Link>
        </p>

      </div>
    </div>
  )
}
