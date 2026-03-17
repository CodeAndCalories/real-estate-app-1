'use client'

import { useThemeMode } from '@/lib/hooks/useThemeMode'
import HeroSection from '@/components/HeroSection'
import DailyDeals from '@/components/DailyDeals'
import HowItWorks from '@/components/HowItWorks'
import ProductPreview from '@/components/ProductPreview'
import MarketsCovered from '@/components/MarketsCovered'
import UserTypes from '@/components/UserTypes'
import PricingSection from '@/components/PricingSection'
import FAQSection from '@/components/FAQSection'
import SiteFooter from '@/components/SiteFooter'
import InvestorUseCases from '@/components/InvestorUseCases'
import DealExample from '@/components/DealExample'
import InvestorTestimonials from '@/components/InvestorTestimonials'
import InvestorTrust from '@/components/InvestorTrust'
import StickyCTA from '@/components/StickyCTA'

export default function HomePage() {
  const { isDark } = useThemeMode()

  return (
    <div className={isDark ? 'bg-gray-950' : 'bg-white'}>

      {/* 1. Hero */}
      <HeroSection isDark={isDark} />

      {/* 2. Product Preview — floating overlap */}
      <div className="relative z-10 md:-mt-8 mt-0 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-[1100px] mx-auto rounded-xl shadow-2xl border overflow-hidden ${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Browser chrome */}
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
          }`}>
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <ProductPreview isDark={isDark} />
        </div>
      </div>

      {/* 3. Investor Trust — below product preview */}
      <InvestorTrust isDark={isDark} />

      {/* 4. Daily Deals */}
      <DailyDeals isDark={isDark} />

      {/* 5. How It Works */}
      <HowItWorks isDark={isDark} />

      {/* 6. Deal Example — concrete proof of concept */}
      <DealExample isDark={isDark} />

      {/* 7. Markets Covered */}
      <MarketsCovered isDark={isDark} />

      {/* 8. Investor Use Cases — flip / hold / wholesale */}
      <InvestorUseCases isDark={isDark} />

      {/* 9. Who It's For */}
      <UserTypes isDark={isDark} />

      {/* 10. Social Proof / Testimonials */}
      <InvestorTestimonials isDark={isDark} />

      {/* 11. Pricing */}
      <PricingSection isDark={isDark} />

      {/* 12. FAQ */}
      <FAQSection isDark={isDark} />

      {/* 13. Final CTA */}
      <section className={`py-24 px-6 text-center ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight text-white">
            Start Finding Property Leads Today
          </h2>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-blue-100'}`}>
            Browse 1,000+ pre-scored leads across 8 major US markets. No signup required.
          </p>
          <a
            href="/finder"
            className={`inline-block w-full sm:w-auto font-bold text-lg px-10 py-4 rounded-xl transition-all shadow-xl ${
              isDark
                ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-900/50'
                : 'bg-white hover:bg-blue-50 text-blue-600 shadow-blue-800/30'
            }`}
          >
            Search Leads Now
          </a>
          <p className={`text-xs mt-4 ${isDark ? 'text-gray-600' : 'text-blue-200'}`}>
            Free demo · No account needed
          </p>
        </div>
      </section>

      {/* 14. Footer */}
      <SiteFooter isDark={isDark} />

      {/* 15. Sticky mobile CTA — appears after scrolling 400px */}
      <StickyCTA isDark={isDark} />

    </div>
  )
}
