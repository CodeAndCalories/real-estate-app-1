'use client'

import { useState, useEffect } from 'react'

type Props = {
  isDark: boolean
}

export default function StickyCTA({ isDark }: Props) {
  // Only show after the user has scrolled past the hero
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    /* Visible on mobile only (hidden sm:hidden) */
    <div
      aria-hidden={!visible}
      className={`fixed bottom-0 inset-x-0 z-50 sm:hidden transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className={`px-4 py-3 border-t shadow-2xl ${
        isDark
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <a
          href="/signup"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black text-base py-3.5 rounded-xl transition-colors shadow-lg shadow-blue-600/30"
        >
          <span>🔍</span>
          Start Free — First Month on Us
        </a>
        <p className={`text-center text-[10px] mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          No charge for 30 days · Cancel anytime
        </p>
      </div>
    </div>
  )
}
