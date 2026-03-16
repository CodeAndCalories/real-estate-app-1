'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cookie-accepted'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY)
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 sm:px-6">
      <div className="max-w-3xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 leading-relaxed">
            <span className="font-semibold text-white">🍪 Cookie Notice —</span>{' '}
            This site uses cookies to improve your experience and remember your preferences.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/privacy#cookies"
            className="text-xs text-gray-400 hover:text-gray-200 underline underline-offset-2 whitespace-nowrap transition-colors"
          >
            Learn More
          </a>
          <button
            onClick={accept}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
