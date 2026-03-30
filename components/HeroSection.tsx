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
    <section className="relative z-0 w-full overflow-hidden" style={{ minHeight: '660px' }}>

      {/* ── Background ── */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Animated gradient base */}
        <div
          className="absolute inset-0 animate-gradient"
          style={{
            background: 'linear-gradient(135deg, #020617 0%, #0a0d2e 30%, #020b1f 60%, #020617 100%)',
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 50% 50%, black, transparent)',
            maskImage: 'radial-gradient(ellipse 85% 75% at 50% 50%, black, transparent)',
          }}
        />

        {/* Primary orb — top center, blue */}
        <div
          className="absolute"
          style={{
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 68%)',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            filter: 'blur(60px)',
            animation: 'orbPulse 7s ease-in-out infinite',
          }}
        />

        {/* Secondary orb — bottom right, cyan */}
        <div
          className="absolute"
          style={{
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 68%)',
            bottom: '-80px',
            right: '-80px',
            filter: 'blur(50px)',
          }}
        />

        {/* Tertiary orb — bottom left, indigo */}
        <div
          className="absolute"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 68%)',
            bottom: '-60px',
            left: '-60px',
            filter: 'blur(50px)',
          }}
        />

        {/* City skyline SVG */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full opacity-[0.16]"
          viewBox="0 0 1440 220"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
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
          <rect x="392"  y="42"  width="3"   height="18"  fill="#3b82f6" opacity="0.8"/>
          <rect x="758"  y="32"  width="4"   height="18"  fill="#3b82f6" opacity="0.8"/>
          <rect x="1001" y="47"  width="3"   height="18"  fill="#3b82f6" opacity="0.8"/>
          <rect x="1213" y="57"  width="3"   height="18"  fill="#3b82f6" opacity="0.8"/>
          <rect x="365"  y="75"  width="6"   height="4"   fill="#93c5fd" opacity="0.6" rx="0.5"/>
          <rect x="378"  y="75"  width="6"   height="4"   fill="#93c5fd" opacity="0.4" rx="0.5"/>
          <rect x="365"  y="86"  width="6"   height="4"   fill="#93c5fd" opacity="0.5" rx="0.5"/>
          <rect x="735"  y="65"  width="6"   height="4"   fill="#93c5fd" opacity="0.6" rx="0.5"/>
          <rect x="748"  y="65"  width="6"   height="4"   fill="#93c5fd" opacity="0.4" rx="0.5"/>
          <rect x="735"  y="76"  width="6"   height="4"   fill="#93c5fd" opacity="0.5" rx="0.5"/>
          <rect x="975"  y="80"  width="6"   height="4"   fill="#93c5fd" opacity="0.6" rx="0.5"/>
          <rect x="988"  y="80"  width="6"   height="4"   fill="#93c5fd" opacity="0.4" rx="0.5"/>
          <rect x="0" y="218" width="1440" height="2" fill="#1e40af" opacity="0.4"/>
        </svg>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#020617] to-transparent" />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#020617]/40 to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-40 text-center">

        {/* Pre-header badge with pulse */}
        <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-status-pulse" />
          <p className="text-blue-300 text-xs font-semibold tracking-wide">
            Search 125+ Cities · 88,000+ Signals
          </p>
        </div>

        {/* Main heading */}
        <h1 className="font-display text-[2.75rem] sm:text-[4.5rem] md:text-[5.5rem] font-black leading-[1.03] tracking-tighter mb-6 text-white">
          Find Property Signals
          <br />
          <span
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #a5b4fc 40%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Before Other Investors
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed text-gray-300/85">
          Access 88,000+ distressed property signals across 125+ cities in all 50 states, powered by real Zillow market data. Find motivated sellers before anyone else.
        </p>

        {/* CTA row */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/finder"
            className="w-full sm:w-auto text-center font-bold px-9 py-4 rounded-lg text-base text-white transition-all duration-200"
            style={{
              background: '#2563eb',
              boxShadow: '0 0 32px rgba(37,99,235,0.35), 0 4px 16px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#3b82f6'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 48px rgba(37,99,235,0.55), 0 4px 20px rgba(0,0,0,0.4)'
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#2563eb'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 32px rgba(37,99,235,0.35), 0 4px 16px rgba(0,0,0,0.4)'
              ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
            }}
          >
            Start Finding Deals →
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-150 px-4 py-4"
          >
            See how it works ↓
          </a>
        </div>

        {/* Trial callout */}
        <p className="text-emerald-400/90 text-xs font-semibold mt-4 tracking-wide">
          Free to explore · No credit card required
        </p>

        {/* Trust credibility bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            '88,000+ Properties',
            '125+ Cities',
            'Real Zillow Data',
            'Weekly Updates',
          ].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <span className="text-blue-400 font-bold text-xs">✓</span>
              <span className="text-xs text-gray-400 font-medium">{item}</span>
            </div>
          ))}
        </div>

        {/* FOMO live feed */}
        <div className="mt-8 max-w-lg mx-auto">
          <div
            className="border border-white/10 rounded-xl px-5 py-3 text-center backdrop-blur-sm"
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <p
              className="text-xs text-gray-300 transition-opacity duration-300"
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
