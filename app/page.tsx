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

      {/* 7. Pricing */}
      <div className="border-t border-white/5" id="pricing">
        <PricingSection isDark={isDark} />
      </div>

      {/* 8. FAQ */}
      <div className="border-t border-white/5">
        <FAQSection isDark={isDark} />
      </div>

      {/* 9. Final CTA */}
      <section className="border-t border-white/5 py-12 md:py-20 px-4 sm:px-6 text-center bg-[#0a0f1e]">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tighter text-white">
            Start Finding Property Leads Today
          </h2>
          <p className="text-base md:text-lg mb-8 text-gray-400 max-w-lg mx-auto">
            Access 40,000+ pre-scored property signals across 60+ cities in all 50 states.
          </p>
          <a
            href="/finder"
            className="inline-block w-full sm:w-auto font-semibold text-base px-10 py-4 rounded-lg transition-all duration-150 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25"
          >
            Search Leads Now
          </a>
          <p className="text-xs mt-4 text-gray-600">
            Free to explore · No account needed
          </p>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter isDark={isDark} />

      {/* Sticky mobile CTA */}
      <StickyCTA isDark={isDark} />

    </div>
  )
}
