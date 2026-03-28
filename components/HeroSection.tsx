'use client'

import { useState, useEffect } from 'react'

type Props = {
  isDark: boolean
}

const FOMO_MESSAGES = [
  '🔥 Score 94 detected in Austin, TX — Pre-Foreclosure · 2 min ago',
  '🔥 Score 91 detected in Nashville, TN — Tax Delinquent · 5 min ago',
  '🔥 Score 88 detected in Phoenix, AZ — Absentee Owner · 8 min ago',
  '🔥 Score 96 detected in Dallas, TX — Pre-Foreclosure · 1 min ago',
  '🔥 Score 89 detected in Miami, FL — Expired Listing · 3 min ago',
  '🔥 Score 92 detected in Atlanta, GA — Inherited Property · 6 min ago',
  '🔥 Score 87 detected in Charlotte, NC — Tax Delinquent · 4 min ago',
]

export default function HeroSection({ isDark: _isDark }: Props) {
  const [fomoIdx,     setFomoIdx]     = useState(0)
  const [fomoVisible, setFomoVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFomoVisible(false)
      setTimeout(() => {
        setFomoIdx((i) => (i + 1) % FOMO_MESSAGES.length)
        setFomoVisible(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative z-0 w-full overflow-hidden" style={{ minHeight: '600px' }}>

      {/* Mobile background */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{
          backgroundImage: "url('/city-mobile.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Desktop background */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          backgroundImage: "url('/city-night.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark gradient overlay — heavier for text clarity */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#020617]" />

      {/* Content — no frosted glass, text breathes on gradient */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-36 text-center">

        {/* Pre-header eyebrow */}
        <p className="text-blue-400/80 text-xs font-mono uppercase tracking-[0.2em] mb-6">
          Search 30+ Markets · 18,900+ Signals
        </p>

        {/* Main heading */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tighter mb-6 text-white">
          Find Property Signals
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Before Other Investors
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed text-gray-300">
          Access 18,900+ distressed property signals across 30 markets, powered by real Zillow market data. Find motivated sellers before anyone else.
        </p>

        {/* CTA row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/finder"
            className="w-full sm:w-auto text-center font-semibold px-8 py-4 rounded-lg text-base transition-all duration-150 shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
          >
            Start Finding Deals →
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-150"
          >
            See how it works ↓
          </a>
        </div>

        {/* Below-CTA count line */}
        <p className="text-gray-400 text-sm mt-4">
          18,900+ properties analyzed across 30+ markets
        </p>

        {/* Trust credibility bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {[
            { text: '18,900+ Properties' },
            { text: '30 Markets' },
            { text: 'Real Zillow Data' },
            { text: 'Weekly Updates' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-1.5">
              <span className="text-blue-400 font-bold text-xs">✓</span>
              <span className="text-xs text-gray-400 font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Proof line */}
        <p className="text-xs text-gray-400 text-center mt-3">
          Updated weekly with fresh Zillow-powered market data
        </p>

        {/* FOMO live feed */}
        <div className="mt-5 max-w-lg mx-auto">
          <div className="bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 text-center">
            <p
              className="text-xs text-gray-400 transition-opacity duration-300"
              style={{ opacity: fomoVisible ? 1 : 0 }}
            >
              {FOMO_MESSAGES[fomoIdx]}
            </p>
          </div>
        </div>

      </div>

    </section>
  )
}
