'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <a href="/" className="text-sm text-blue-600 hover:underline">← Back to home</a>
      </div>

      <h1 className="text-4xl font-black text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-500 text-base mb-10">
        Have a question or want to learn more? Send us a message and we'll get back to you.
      </p>

      {/* Email CTA */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-8">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 text-blue-500 shrink-0">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <div>
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Email us directly</p>
          <p className="text-sm font-medium text-gray-700 mt-0.5">support@propertysignalhq.com</p>
        </div>
      </div>

      {/* Contact form */}
      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">✓</div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Message sent!</h2>
          <p className="text-sm text-gray-500">We'll get back to you as soon as possible.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-5 text-sm text-blue-600 hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                First Name
              </label>
              <input
                type="text"
                placeholder="Jane"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Smith"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="jane@example.com"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Role
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Select your role</option>
              <option>Real Estate Agent</option>
              <option>Real Estate Investor</option>
              <option>Wholesaler</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Message
            </label>
            <textarea
              rows={5}
              placeholder="Tell us what you're looking for..."
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors"
          >
            Send Message
          </button>

          <p className="text-xs text-center text-gray-400">
            By submitting, you agree to our{' '}
            <a href="/privacy" className="hover:underline text-gray-500">Privacy Policy</a>.
          </p>
        </form>
      )}
    </div>
  )
}
