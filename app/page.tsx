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
import BestDealHighlight from '@/components/BestDealHighlight'
import TopOpportunities from '@/components/TopOpportunities'
import StickyCTA from '@/components/StickyCTA'

export default function HomePage() {
  const { isDark } = useThemeMode()

  return (
    <div className="bg-[#020617]">

      {/* 1. Hero */}
      <HeroSection isDark={isDark} />

      {/* 2. Product Preview — floating overlap */}
      <div className="relative z-10 md:-mt-8 mt-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1100px] mx-auto rounded-xl shadow-2xl border overflow-hidden bg-[#0a0f1e] border-white/10">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-[#0a0f1e] border-white/10">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <ProductPreview isDark={isDark} />
        </div>
      </div>

      {/* 3. Best Deal Highlight — live top deal from dataset */}
      <BestDealHighlight isDark={isDark} />

      {/* 4. Investor Trust */}
      <InvestorTrust isDark={isDark} />

      {/* 5. Daily Deals */}
      <DailyDeals isDark={isDark} />

      {/* 6. How It Works */}
      <HowItWorks isDark={isDark} />

      {/* 7. Deal Example — concrete proof of concept */}
      <DealExample isDark={isDark} />

      {/* 8. Markets Covered */}
      <MarketsCovered isDark={isDark} />

      {/* 9. Investor Use Cases — flip / hold / wholesale */}
      <InvestorUseCases isDark={isDark} />

      {/* 10. Who It's For */}
      <UserTypes isDark={isDark} />

      {/* 11. Social Proof / Testimonials */}
      <InvestorTestimonials isDark={isDark} />

      {/* 12. Top Opportunities — live high-score signals */}
      <TopOpportunities isDark={isDark} />

      {/* 13. Pricing */}
      <PricingSection isDark={isDark} />

      {/* 14. FAQ */}
      <FAQSection isDark={isDark} />

      {/* 15. Final CTA */}
      <section className="py-24 px-6 text-center bg-[#0f172a]">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4 leading-tight text-white">
            Start Finding Property Leads Today
          </h2>
          <p className="text-lg mb-8 text-gray-400">
            Browse 18,000+ pre-scored leads across 30+ major US markets.
          </p>
          <a
            href="/finder"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 w-full sm:w-auto font-bold text-lg px-10 py-4 rounded-lg transition-all"
          >
            Search Leads Now
          </a>
          <p className="text-xs mt-4 text-gray-600">
            Free demo · No account needed
          </p>
        </div>
      </section>

      {/* 16. Footer */}
      <SiteFooter isDark={isDark} />

      {/* 17. Sticky mobile CTA — appears after scrolling 400px */}
      <StickyCTA isDark={isDark} />

    </div>
  )
}
