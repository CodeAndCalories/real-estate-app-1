'use client'

import { useThemeMode } from '@/lib/hooks/useThemeMode'
import HeroSection from '@/components/HeroSection'
import HowItWorks from '@/components/HowItWorks'
import ProductPreview from '@/components/ProductPreview'
import MarketsCovered from '@/components/MarketsCovered'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import SiteFooter from '@/components/SiteFooter'
import InvestorTestimonials from '@/components/InvestorTestimonials'
import InvestorTrust from '@/components/InvestorTrust'
import StickyCTA from '@/components/StickyCTA'
import FreeReportSection from '@/components/FreeReportSection'

export default function HomePage() {
  const { isDark } = useThemeMode()

  return (
    <div className="bg-[#020617]">

      {/* 1. Hero */}
      <HeroSection isDark={isDark} />

      {/* 2. Trust bar — investor types + stats */}
      <InvestorTrust isDark={isDark} />

      {/* 3. How It Works */}
      <div className="border-t border-white/5">
        <HowItWorks isDark={isDark} />
      </div>

      {/* 4. Feature showcase — finder demo */}
      <div className="border-t border-white/5 relative z-10 px-4 sm:px-6 lg:px-8 py-12 bg-[#0a0f1e]">
        <div className="max-w-[1100px] mx-auto rounded-xl shadow-2xl border overflow-hidden bg-[#0a0f1e] border-white/10">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#0a0f1e] border-white/10">
            <span className="w-3 h-3 rounded-full bg-red-400/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <span className="w-3 h-3 rounded-full bg-green-400/60" />
            <span className="ml-3 text-xs text-gray-600 font-mono">propertysignalhq.com/finder</span>
          </div>
          <ProductPreview isDark={isDark} />
        </div>
      </div>

      {/* 5. Markets covered */}
      <div className="border-t border-white/5">
        <MarketsCovered isDark={isDark} />
      </div>

      {/* 6. Testimonials */}
      <div className="border-t border-white/5">
        <InvestorTestimonials isDark={isDark} />
      </div>

      {/* 7. Free Report CTA */}
      <div className="border-t border-white/5">
        <FreeReportSection />
      </div>

      {/* 8. Pricing */}
      <div className="border-t border-white/5" id="pricing">
        <PricingSection isDark={isDark} />
      </div>

      {/* 9. FAQ */}
      <div className="border-t border-white/5">
        <FAQSection isDark={isDark} />
      </div>

      {/* 10. Final CTA */}
      <section className="border-t border-white/5 py-16 md:py-24 px-4 sm:px-6 text-center relative overflow-hidden bg-[#020617]">
        {/* Large pulsing orb */}
        <div
          className="absolute pointer-events-none"
          aria-hidden="true"
          style={{
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 65%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(40px)',
            animation: 'orbPulse 6s ease-in-out infinite',
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          {/* Shimmer-border card */}
          <div
            className="shimmer-border rounded-2xl p-10"
            style={{
              background: 'rgba(255,255,255,0.02)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              First Month Free
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tighter text-white">
              Start Finding Property Leads Today
            </h2>
            <p className="text-base md:text-lg mb-8 text-gray-400 max-w-lg mx-auto">
              Access 88,000+ pre-scored property signals across 125+ cities. First month on us — no charge until day 31.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/upgrade"
                className="w-full sm:w-auto font-bold text-base px-10 py-4 rounded-lg text-white transition-all duration-200"
                style={{
                  background: '#2563eb',
                  boxShadow: '0 0 32px rgba(37,99,235,0.35), 0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                Start Free Trial →
              </a>
              <a
                href="/finder"
                className="w-full sm:w-auto font-semibold text-base px-10 py-4 rounded-lg transition-all duration-150 border border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5"
              >
                Browse Free First
              </a>
            </div>
            <p className="text-xs mt-4 text-gray-600">
              30-day free trial · No charge until day 31 · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter isDark={isDark} />

      {/* Sticky mobile CTA */}
      <StickyCTA isDark={isDark} />

    </div>
  )
}
