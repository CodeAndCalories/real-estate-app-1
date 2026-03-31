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
      <div className="section-divider">
        <HowItWorks isDark={isDark} />
      </div>

      {/* 4. Feature showcase — finder demo */}
      <div className="section-divider relative z-10 px-4 sm:px-6 lg:px-8 py-12 bg-[#0a0f1e]">
        <div
          className="max-w-[1100px] mx-auto rounded-xl border overflow-hidden bg-[#0a0f1e] border-white/10"
          style={{
            boxShadow: '0 0 0 1px rgba(37,99,235,0.12), 0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(37,99,235,0.07)',
          }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#0f172a] border-white/8">
            <span className="w-3 h-3 rounded-full bg-red-400/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
            <span className="w-3 h-3 rounded-full bg-green-400/60" />
            <div className="ml-3 flex-1 max-w-xs bg-[#020617] border border-white/8 rounded px-3 py-1">
              <span className="text-xs text-gray-500 font-mono">propertysignalhq.com/finder</span>
            </div>
          </div>
          <ProductPreview isDark={isDark} />
        </div>
      </div>

      {/* 5. Markets covered */}
      <div className="section-divider">
        <MarketsCovered isDark={isDark} />
      </div>

      {/* 6. Testimonials */}
      <div className="section-divider">
        <InvestorTestimonials isDark={isDark} />
      </div>

      {/* 7. Free Report CTA */}
      <div className="section-divider">
        <FreeReportSection />
      </div>

      {/* 8. Pricing */}
      <div className="section-divider" id="pricing">
        <PricingSection isDark={isDark} />
      </div>

      {/* 9. FAQ */}
      <div className="section-divider">
        <FAQSection isDark={isDark} />
      </div>

      {/* 10. Final CTA */}
      <section className="section-divider py-16 md:py-24 px-4 sm:px-6 text-center relative overflow-hidden bg-[#020617]">
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
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tighter text-white">
              Start Finding Deals Today
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <a
                href="/signup"
                className="w-full sm:w-auto font-bold text-base px-10 py-4 rounded-lg text-white transition-all duration-200"
                style={{
                  background: '#2563eb',
                  boxShadow: '0 0 32px rgba(37,99,235,0.35), 0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                Start Free — First Month on Us →
              </a>
            </div>
            <p className="text-xs mt-4 text-gray-600">
              No charge for 30 days · Cancel anytime
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
