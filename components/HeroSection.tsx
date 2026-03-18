'use client'

type Props = {
  isDark: boolean
}

export default function HeroSection({ isDark }: Props) {
  const desktopBg = isDark ? "url('/city-night.png')" : "url('/city-day.png')"
  const mobileBg = "url('/city-mobile.png')"

  return (
    <section className="relative z-0 w-full overflow-hidden" style={{ minHeight: '560px' }}>

      {/* Mobile background (up to sm) */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{
          backgroundImage: mobileBg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Desktop background (sm and up) */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          backgroundImage: desktopBg,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark overlay — gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#020617]" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-36 text-center">

        {/* Glass container */}
        <div className="inline-block w-full max-w-3xl mx-auto rounded-3xl px-8 py-12 sm:px-14 sm:py-14"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <h1
            className="font-display text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6 text-white"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}
          >
            Find Property Signals
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Before Other Investors</span>
          </h1>

          <p className="text-base md:text-lg max-w-lg mx-auto mb-8 leading-relaxed text-gray-300">
            Discover distressed owners, price drops, and high-equity opportunities across major markets.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/finder"
              className="w-full sm:w-auto text-center font-semibold px-8 py-4 rounded-lg text-base transition-all duration-150 shadow-lg bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
            >
              Browse Deals →
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              See how it works ↓
            </a>
          </div>

          {/* Trust credibility bar — under CTA */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { icon: '🏙️', text: '30+ real estate markets tracked' },
              { icon: '📊', text: '18,000+ property signals analyzed' },
              { icon: '💼', text: 'Built for real estate investors' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-1.5">
                <span className="text-sm leading-none">{item.icon}</span>
                <span className="text-xs text-gray-400 font-medium">
                  <span className="text-blue-400 font-bold mr-1">✓</span>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Secondary micro-trust line */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-gray-500">
            <span>✓ Opportunity scoring</span>
            <span>✓ CSV export ready</span>
          </div>
        </div>
      </div>

    </section>
  )
}
