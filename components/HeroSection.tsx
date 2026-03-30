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
    <section className="relative z-0 w-full overflow-hidden" style={{ minHeight: '620px' }}>

      {/* ── Sharp programmatic background — no blurry photos ── */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Deep navy base */}
        <div className="absolute inset-0 bg-[#020617]" />

        {/* Radial glow — top center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.35) 0%, transparent 70%)',
          }}
        />

        {/* Secondary accent glow — bottom right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 85% 90%, rgba(6,182,212,0.12) 0%, transparent 60%)',
          }}
        />

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #60a5fa 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* City skyline SVG — crisp at any resolution */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-20"
          viewBox="0 0 1440 220"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Background buildings */}
          <rect x="0"    y="140" width="80"  height="80"  fill="#1e40af" opacity="0.6"/>
          <rect x="90"   y="100" width="60"  height="120" fill="#1e3a8a" opacity="0.7"/>
          <rect x="160"  y="120" width="50"  height="100" fill="#1e40af" opacity="0.5"/>
          <rect x="220"  y="80"  width="70"  height="140" fill="#1d4ed8" opacity="0.7"/>
          <rect x="300"  y="110" width="45"  height="110" fill="#1e3a8a" opacity="0.6"/>
          <rect x="355"  y="60"  width="90"  height="160" fill="#1e40af" opacity="0.8"/>
          <rect x="455"  y="90"  width="55"  height="130" fill="#1e3a8a" opacity="0.6"/>
          <rect x="520"  y="130" width="40"  height="90"  fill="#1d4ed8" opacity="0.5"/>
          <rect x="570"  y="70"  width="75"  height="150" fill="#1e40af" opacity="0.7"/>
          <rect x="655"  y="100" width="60"  height="120" fill="#1e3a8a" opacity="0.6"/>
          <rect x="725"  y="50"  width="95"  height="170" fill="#1d4ed8" opacity="0.8"/>
          <rect x="830"  y="85"  width="65"  height="135" fill="#1e40af" opacity="0.6"/>
          <rect x="905"  y="115" width="50"  height="105" fill="#1e3a8a" opacity="0.5"/>
          <rect x="965"  y="65"  width="85"  height="155" fill="#1d4ed8" opacity="0.75"/>
          <rect x="1060" y="95"  width="55"  height="125" fill="#1e40af" opacity="0.6"/>
          <rect x="1125" y="120" width="45"  height="100" fill="#1e3a8a" opacity="0.5"/>
          <rect x="1180" y="75"  width="80"  height="145" fill="#1d4ed8" opacity="0.7"/>
          <rect x="1270" y="105" width="60"  height="115" fill="#1e40af" opacity="0.6"/>
          <rect x="1340" y="85"  width="100" height="135" fill="#1e3a8a" opacity="0.65"/>
          {/* Antenna/spire details */}
          <rect x="392"  y="42"  width="3"   height="18"  fill="#3b82f6" opacity="0.8"/>
          <rect x="758"  y="32"  width="4"   height="18"  fill="#3b82f6" opacity="0.8"/>
          <rect x="1001" y="47"  width="3"   height="18"  fill="#3b82f6" opacity="0.8"/>
          <rect x="1213" y="57"  width="3"   height="18"  fill="#3b82f6" opacity="0.8"/>
          {/* Window glows */}
          <rect x="365"  y="75"  width="6"   height="4"   fill="#93c5fd" opacity="0.6" rx="0.5"/>
          <rect x="378"  y="75"  width="6"   height="4"   fill="#93c5fd" opacity="0.4" rx="0.5"/>
          <rect x="365"  y="86"  width="6"   height="4"   fill="#93c5fd" opacity="0.5" rx="0.5"/>
          <rect x="735"  y="65"  width="6"   height="4"   fill="#93c5fd" opacity="0.6" rx="0.5"/>
          <rect x="748"  y="65"  width="6"   height="4"   fill="#93c5fd" opacity="0.4" rx="0.5"/>
          <rect x="735"  y="76"  width="6"   height="4"   fill="#93c5fd" opacity="0.5" rx="0.5"/>
          <rect x="975"  y="80"  width="6"   height="4"   fill="#93c5fd" opacity="0.6" rx="0.5"/>
          <rect x="988"  y="80"  width="6"   height="4"   fill="#93c5fd" opacity="0.4" rx="0.5"/>
          {/* Ground line */}
          <rect x="0" y="218" width="1440" height="2" fill="#1e40af" opacity="0.4"/>
        </svg>

        {/* Gradient fade at bottom to blend into page */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#020617] to-transparent" />
        {/* Gradient fade at top */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#020617]/60 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-36 text-center">

        {/* Pre-header eyebrow */}
        <p className="text-blue-400/80 text-xs font-mono uppercase tracking-[0.2em] mb-6">
          Search 100+ Cities · 75,000+ Signals
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
          Access 75,000+ distressed property signals across 100+ cities in all 50 states, powered by real Zillow market data. Find motivated sellers before anyone else.
        </p>

        {/* CTA row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/finder"
            className="w-full sm:w-auto text-center font-semibold px-8 py-4 rounded-lg text-base transition-all duration-150 shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 ring-1 ring-blue-500/20"
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

        {/* Trial callout */}
        <p className="text-emerald-400/90 text-xs font-semibold mt-4 tracking-wide">
          First month free · No charge until day 31
        </p>

        {/* Trust credibility bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {[
            { text: '75,000+ Properties' },
            { text: '100+ Cities' },
            { text: 'Real Zillow Data' },
            { text: 'Weekly Updates' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-1.5">
              <span className="text-blue-400 font-bold text-xs">✓</span>
              <span className="text-xs text-gray-400 font-medium">{item.text}</span>
            </div>
          ))}
        </div>

        {/* FOMO live feed */}
        <div className="mt-6 max-w-lg mx-auto">
          <div className="bg-[#0f172a]/80 border border-white/10 rounded-lg px-4 py-2.5 text-center backdrop-blur-sm">
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
