'use client'

import { useState, useMemo, useEffect } from 'react'
import ResultsTable from '@/components/ResultsTable'
import SignalDetailDrawer from '@/components/SignalDetailDrawer'
import MapView from '@/components/MapView'
import OpportunityBanner from '@/components/OpportunityBanner'
import InsightCards from '@/components/InsightCards'
import PopularCities from '@/components/PopularCities'
import MarketOverview from '@/components/MarketOverview'
import TopLeads from '@/components/TopLeads'
import { fetchSignals } from '@/lib/api/fetchSignals'
import { scoreAndEnrich } from '@/lib/utils/scoreProperty'
import { exportToCSV } from '@/lib/utils/exportCSV'
import { useSavedLeads } from '@/lib/hooks/useSavedLeads'
import { useThemeMode } from '@/lib/hooks/useThemeMode'
import SavedSearches, { saveSearch } from '@/components/SavedSearches'
import type { SavedSearch } from '@/components/SavedSearches'
import HotDeals from '@/components/HotDeals'
import SignalHeatmap from '@/components/SignalHeatmap'
import DailyOpportunities from '@/components/DailyOpportunities'
import dynamic from 'next/dynamic'
const DealCalculator = dynamic(() => import('@/components/DealCalculator'), { ssr: false })
import FavoritesPanel from '@/components/FavoritesPanel'
import { useFavorites } from '@/lib/hooks/useFavorites'
import type { Signal } from '@/lib/data/getSignals'
import DashboardSummary from '@/components/DashboardSummary'
import OpportunityAlerts from '@/components/OpportunityAlerts'
import PipelineSummary from '@/components/PipelineSummary'
import DealPipelinePanel from '@/components/DealPipelinePanel'
import DealAlertsPanel from '@/components/DealAlertsPanel'
import MarketTrendCards from '@/components/MarketTrendCards'
import DealComparison from '@/components/DealComparison'
import InvestorSignupBanner from '@/components/InvestorSignupBanner'
import BestDealBanner from '@/components/BestDealBanner'
import InvestorTrustBanner from '@/components/InvestorTrustBanner'
import SavedDealsPanel from '@/components/SavedDealsPanel'
import MarketLeaderboard from '@/components/MarketLeaderboard'
import InvestorStats from '@/components/InvestorStats'
import { QuickFilters } from '@/components/SearchFilters'
import type { QuickFilterId } from '@/components/SearchFilters'
import PortfolioSummary from '@/components/PortfolioSummary'
import { propertyKey } from '@/lib/hooks/useSavedLeads'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'

export type Property = {
  address: string
  city: string
  zip: string
  owner_name: string | null
  estimated_value: number
  loan_balance_estimate: number | null
  days_in_default: number | null
  previous_listing_price: number | null
  days_on_market: number | null
  agent_name: string | null
  lead_type: string
  price_per_sqft: number | null
  market_avg_price_per_sqft: number | null
  price_drop_percent: number | null
  rent_estimate: number | null
  opportunity_score: number | null
}

export type Filters = {
  location: string
  lead_type: string
  max_results: number
}

type Summary = {
  city: string
  total: number
  hotLeads: number
  distressedOwners: number
  preForeclosure: number
  expiredListings: number
  investorOpportunities: number
}

function buildSummary(data: Property[], location: string): Summary {
  const city =
    location.trim().length > 0
      ? location.trim().charAt(0).toUpperCase() + location.trim().slice(1)
      : 'All Cities'
  return {
    city,
    total: data.length,
    hotLeads: data.filter((p) => (p.opportunity_score ?? 0) >= 80).length,
    distressedOwners: data.filter((p) => (p.days_in_default ?? 0) > 60).length,
    preForeclosure: data.filter((p) => p.lead_type === 'Pre-Foreclosure').length,
    expiredListings: data.filter((p) => p.lead_type === 'Expired Listing').length,
    investorOpportunities: data.filter((p) => p.lead_type === 'Investor Opportunity').length,
  }
}

function SectionDivider({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <div className={`flex items-center gap-3 mb-4 mt-2`}>
      <span className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        {label}
      </span>
      <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
    </div>
  )
}

const CITIES = ['', 'Miami', 'Los Angeles', 'New York', 'Dallas', 'Atlanta', 'Chicago', 'Phoenix', 'Cleveland']
const LEAD_TYPES = [
  { value: '', label: 'All Lead Types' },
  { value: 'Pre-Foreclosure', label: 'Pre-Foreclosure / Distressed' },
  { value: 'Expired Listing', label: 'Recently Expired Listings' },
  { value: 'Investor Opportunity', label: 'Investor Opportunities' },
]
const STRATEGIES = ['All Strategies', 'Fix and Flip', 'Buy and Hold', 'Wholesale', 'Rental Income']
const MAX_RESULTS = [50, 100, 250, 500]

export default function FinderPage() {
  const { isDark } = useThemeMode()
  const { loaded, isLoggedIn } = useAuth()
  const router = useRouter()

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    if (loaded && !isLoggedIn) {
      router.replace('/login')
    }
  }, [loaded, isLoggedIn, router])

  const [results, setResults] = useState<Property[]>([])
  const [totalMatched, setTotalMatched] = useState(0)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [searched, setSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  const [searchCity, setSearchCity] = useState('')
  const [searchLeadType, setSearchLeadType] = useState('')
  const [searchMaxResults, setSearchMaxResults] = useState(50)

  const { savedLeads, savedKeys, toggleSave, isSaved } = useSavedLeads()
  const { favorites, favoriteKeys, toggleFavorite } = useFavorites()
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Deal comparison
  const [compareList, setCompareList] = useState<Property[]>([])
  const compareKeys = new Set(compareList.map((p) => propertyKey(p)))
  const handleCompare = (p: Property) => {
    setCompareList((prev) => {
      const key = propertyKey(p)
      if (prev.some((x) => propertyKey(x) === key)) {
        return prev.filter((x) => propertyKey(x) !== key)
      }
      if (prev.length >= 3) return prev // max 3
      return [...prev, p]
    })
  }

  // Quick filters
  const [activeQuickFilters, setActiveQuickFilters] = useState<Set<QuickFilterId>>(new Set())
  const handleQuickFilterToggle = (id: QuickFilterId) => {
    setActiveQuickFilters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advMinScore, setAdvMinScore] = useState(0)
  const [advMaxDOM, setAdvMaxDOM] = useState(0)
  const [advMinEquity, setAdvMinEquity] = useState(0)

  // Saved searches
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saved-searches')
      if (raw) setSavedSearches(JSON.parse(raw) as SavedSearch[])
    } catch { /* ignore */ }
  }, [])

  const handleSaveSearch = () => {
    const next = {
      ...(searchCity ? { city: searchCity } : {}),
      ...(advMinScore > 0 ? { minScore: advMinScore } : {}),
      ...(advMinEquity > 0 ? { minEquity: advMinEquity } : {}),
      ...(advMaxDOM > 0 ? { maxDaysOnMarket: advMaxDOM } : {}),
    }
    setSavedSearches((prev) => saveSearch(prev, next))
  }

  const handleApplySearch = (filters: SavedSearch) => {
    const city = filters.city ?? ''
    setSearchCity(city)
    setAdvMinScore(filters.minScore ?? 0)
    setAdvMinEquity(filters.minEquity ?? 0)
    setAdvMaxDOM(filters.maxDaysOnMarket ?? 0)
    fetchPage(1, { city, lead_type: searchLeadType, limit: searchMaxResults })
  }

  const handleDeleteSearch = (id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      try { localStorage.setItem('saved-searches', JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })
  }

  // Export All state
  const [isExportingAll, setIsExportingAll] = useState(false)

  const totalPages = searchMaxResults > 0 ? Math.ceil(totalMatched / searchMaxResults) : 1

  const fetchPage = async (page: number, filters?: { city: string; lead_type: string; limit: number }) => {
    const city = (filters?.city ?? searchCity).trim()
    const lead_type = filters?.lead_type ?? searchLeadType
    const limit = filters?.limit ?? searchMaxResults

    setIsLoading(true)
    setLoadError(null)

    try {
      const { total, signals } = await fetchSignals({
        city: city || undefined,
        lead_type: lead_type || undefined,
        limit,
        page,
      })

      // Sort descending by opportunity score
      const enriched = (signals as Property[])
        .map(scoreAndEnrich)
        .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0))

      setTotalMatched(total)
      setResults(enriched)
      setSummary(buildSummary(enriched, city))
      setCurrentPage(page)
      setShowSavedOnly(false)
      setSearched(true)
    } catch {
      setLoadError('Failed to load property signals. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Client-side advanced filtering on top of server results
  const advFilteredResults = useMemo(() => {
    return results.filter((p) => {
      if (advMinScore > 0 && (p.opportunity_score ?? 0) < advMinScore) return false
      if (advMaxDOM > 0 && (p.days_on_market ?? 0) > advMaxDOM) return false
      if (advMinEquity > 0) {
        const eq =
          p.estimated_value && p.loan_balance_estimate !== null
            ? p.estimated_value - p.loan_balance_estimate
            : 0
        if (eq < advMinEquity) return false
      }
      // Quick filters
      if (activeQuickFilters.has('hot') && (p.opportunity_score ?? 0) < 90) return false
      if (activeQuickFilters.has('equity')) {
        const eq =
          p.estimated_value > 0 && p.loan_balance_estimate != null
            ? (p.estimated_value - p.loan_balance_estimate) / p.estimated_value
            : 0
        if (eq < 0.3) return false
      }
      if (activeQuickFilters.has('pricedrops') && (p.price_drop_percent ?? 0) <= 5) return false
      if (activeQuickFilters.has('rental')) {
        const yld =
          p.rent_estimate != null && p.estimated_value > 0
            ? p.rent_estimate / p.estimated_value
            : 0
        if (yld < 0.009) return false
      }
      return true
    })
  }, [results, advMinScore, advMaxDOM, advMinEquity, activeQuickFilters])

  const runSearch = () =>
    fetchPage(1, { city: searchCity, lead_type: searchLeadType, limit: searchMaxResults })

  const exportAll = async () => {
    setIsExportingAll(true)
    try {
      const { signals } = await fetchSignals({
        city: searchCity || undefined,
        lead_type: searchLeadType || undefined,
        limit: 9999,
      })
      exportToCSV(signals as Property[], 'all-signals.csv')
    } catch {
      // silently ignore
    } finally {
      setIsExportingAll(false)
    }
  }

  const handlePopularCity = (city: string) => {
    setSearchCity(city)
    fetchPage(1, { city, lead_type: searchLeadType, limit: searchMaxResults })
  }

  const favoritesAsProperty = favorites as unknown as Property[]
  const displayedResults = showSavedOnly
    ? savedLeads
    : showFavoritesOnly
    ? favoritesAsProperty
    : advFilteredResults
  const activeSummary = showSavedOnly
    ? buildSummary(savedLeads, 'Saved Signals')
    : showFavoritesOnly
    ? buildSummary(favoritesAsProperty, 'Favorites')
    : summary
  const showResults = showSavedOnly || showFavoritesOnly || searched

  // Theme-aware class helpers
  const pageBg = isDark
    ? 'min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950'
    : 'min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50'

  const card = isDark
    ? 'bg-gray-800 border border-gray-700 rounded-xl shadow-sm'
    : 'bg-white border border-gray-200 rounded-xl shadow-sm'

  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400'

  const selectClass = isDark
    ? 'w-full border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-gray-100'
    : 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900'

  const labelClass = `block text-xs font-semibold uppercase tracking-wide mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`

  const paginationBtnBase = `px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors`
  const paginationBtnActive = isDark
    ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
  const paginationBtnDisabled = isDark
    ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed'
    : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'

  // Show loading/redirect screen while auth state is being resolved
  if (!loaded || !isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {loaded && !isLoggedIn ? 'Redirecting to login…' : 'Loading…'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={pageBg}>
      <div className="max-w-[1200px] mx-auto px-4 py-8">

        {/* Demo Dataset Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
            isDark
              ? 'bg-amber-900/30 border-amber-700 text-amber-400'
              : 'bg-amber-50 border-amber-300 text-amber-700'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Demo Dataset
          </span>
          <span className={`text-xs ${textMuted}`}>Showing simulated property signals</span>
        </div>

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Signal Finder</h1>
          <div className="flex items-center gap-2 flex-wrap">
            {favorites.length > 0 && (
              <button
                onClick={() => { setShowFavoritesOnly((v) => !v); setShowSavedOnly(false) }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  showFavoritesOnly
                    ? isDark
                      ? 'bg-yellow-900/30 border-yellow-600 text-yellow-400 hover:bg-yellow-900/50'
                      : 'bg-yellow-50 border-yellow-400 text-yellow-700 hover:bg-yellow-100'
                    : isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>⭐</span>
                {showFavoritesOnly ? '← Back to Results' : `Favorites (${favorites.length})`}
              </button>
            )}
            {savedLeads.length > 0 && (
              <button
                onClick={() => { setShowSavedOnly((v) => !v); setShowFavoritesOnly(false) }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  showSavedOnly
                    ? isDark
                      ? 'bg-yellow-900/30 border-yellow-700 text-yellow-400 hover:bg-yellow-900/50'
                      : 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                    : isDark
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-yellow-400">★</span>
                {showSavedOnly ? '← Back to Results' : `Show Saved Signals (${savedLeads.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Market Overview */}
        <MarketOverview />

        {/* Top Leads */}
        <TopLeads onRowClick={setSelectedProperty} />

        {/* Popular Cities */}
        <PopularCities onCityClick={handlePopularCity} />

        {/* Guided Search Card */}
        <div className={`${card} p-6 mb-8`}>
          <h2 className={`text-base font-bold mb-4 ${textPrimary}`}>Find Property Signals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <div>
              <label className={labelClass}>City</label>
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className={selectClass}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === '' ? 'All Cities' : c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Signal Type</label>
              <select
                value={searchLeadType}
                onChange={(e) => setSearchLeadType(e.target.value)}
                className={selectClass}
              >
                {LEAD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Strategy</label>
              <select className={selectClass} defaultValue="All Strategies">
                {STRATEGIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Per Page</label>
              <select
                value={searchMaxResults}
                onChange={(e) => setSearchMaxResults(Number(e.target.value))}
                className={selectClass}
              >
                {MAX_RESULTS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={runSearch}
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-lg text-sm transition-colors"
            >
              {isLoading ? 'Loading…' : 'Generate Leads'}
            </button>
            <button
              onClick={handleSaveSearch}
              title="Save current filters as a saved search"
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-blue-600'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              <span>＋</span> Save Search
            </button>
            <button
              onClick={() => setShowAdvancedFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${
                showAdvancedFilters
                  ? isDark
                    ? 'bg-blue-900/30 border-blue-700 text-blue-400'
                    : 'bg-blue-50 border-blue-300 text-blue-600'
                  : isDark
                  ? 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Filters {showAdvancedFilters ? '▲' : '▼'}
              {(advMinScore > 0 || advMaxDOM > 0 || advMinEquity > 0) && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                  {[advMinScore > 0, advMaxDOM > 0, advMinEquity > 0].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Advanced filter panel */}
          {showAdvancedFilters && (
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textSecondary}`}>
                Advanced Filters <span className={`font-normal normal-case ${textMuted}`}>(applied client-side to current results)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Min Opportunity Score</label>
                  <select
                    value={advMinScore}
                    onChange={(e) => setAdvMinScore(Number(e.target.value))}
                    className={selectClass}
                  >
                    <option value={0}>Any score</option>
                    <option value={40}>40+ (Moderate)</option>
                    <option value={60}>60+ (Strong)</option>
                    <option value={80}>80+ (Hot Lead)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Max Days on Market</label>
                  <select
                    value={advMaxDOM}
                    onChange={(e) => setAdvMaxDOM(Number(e.target.value))}
                    className={selectClass}
                  >
                    <option value={0}>Any</option>
                    <option value={30}>≤ 30 days</option>
                    <option value={60}>≤ 60 days</option>
                    <option value={90}>≤ 90 days</option>
                    <option value={180}>≤ 180 days</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Min Est. Equity</label>
                  <select
                    value={advMinEquity}
                    onChange={(e) => setAdvMinEquity(Number(e.target.value))}
                    className={selectClass}
                  >
                    <option value={0}>Any</option>
                    <option value={50000}>$50k+</option>
                    <option value={100000}>$100k+</option>
                    <option value={200000}>$200k+</option>
                    <option value={300000}>$300k+</option>
                  </select>
                </div>
              </div>
              {(advMinScore > 0 || advMaxDOM > 0 || advMinEquity > 0) && (
                <button
                  onClick={() => { setAdvMinScore(0); setAdvMaxDOM(0); setAdvMinEquity(0) }}
                  className={`mt-3 text-xs underline underline-offset-2 ${textMuted} hover:opacity-100 opacity-70`}
                >
                  Clear advanced filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Saved Searches */}
        <SavedSearches
          isDark={isDark}
          searches={savedSearches}
          onApplySearch={handleApplySearch}
          onDelete={handleDeleteSearch}
        />

        {/* Best Deal Today Banner */}
        <BestDealBanner isDark={isDark} />

        {/* Investor Signup Banner */}
        <InvestorSignupBanner isDark={isDark} />

        {/* Investor Trust Banner */}
        <InvestorTrustBanner isDark={isDark} />

        {/* Portfolio Summary — user's saved + pipeline deal counts */}
        <PortfolioSummary isDark={isDark} />

        {/* Dashboard Summary */}
        <DashboardSummary isDark={isDark} />

        {/* Pipeline Summary */}
        <PipelineSummary isDark={isDark} />

        {/* Saved Deals Panel */}
        <SavedDealsPanel isDark={isDark} />

        {/* Opportunity Alerts */}
        <OpportunityAlerts isDark={isDark} />

        {/* Deal Alerts */}
        <DealAlertsPanel
          isDark={isDark}
          currentCity={searchCity}
          currentMinScore={advMinScore}
          currentMinEquity={advMinEquity}
        />

        {/* ── Section: Market Overview ──────────────────────────── */}
        <SectionDivider label="Market Overview" isDark={isDark} />
        <InvestorStats isDark={isDark} />
        <MarketLeaderboard isDark={isDark} />
        <MarketTrendCards isDark={isDark} />
        <SignalHeatmap isDark={isDark} onCityClick={handlePopularCity} />

        {/* ── Section: Today's Opportunities ───────────────────── */}
        <SectionDivider label="Today's Opportunities" isDark={isDark} />
        <DailyOpportunities isDark={isDark} onRowClick={setSelectedProperty} />

        {/* Deal Pipeline Panel */}
        <DealPipelinePanel isDark={isDark} onRowClick={setSelectedProperty} />

        {/* ── Section: High Score Deals ─────────────────────────── */}
        <SectionDivider label="High Score Deals" isDark={isDark} />
        <HotDeals isDark={isDark} />

        {/* Loading state */}
        {isLoading && (
          <div className={`flex items-center justify-center gap-3 py-16 rounded-xl border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <svg className="w-5 h-5 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className={`text-sm font-medium ${textSecondary}`}>Loading property signals…</span>
          </div>
        )}

        {/* Error state */}
        {loadError && !isLoading && (
          <div className={`text-center py-10 rounded-xl border ${
            isDark ? 'bg-red-900/20 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            <p className="text-sm font-medium">{loadError}</p>
            <button
              onClick={runSearch}
              className="mt-3 text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && !loadError && showResults && (
          <div>
            {activeSummary && (
              <>
                {/* Opportunity Banner */}
                <OpportunityBanner
                  hotLeadCount={activeSummary.hotLeads}
                  city={activeSummary.city}
                />

                {/* Insight Cards */}
                <InsightCards data={displayedResults} />

                {/* Summary card */}
                <div className={`${card} p-5 mb-5`}>
                  <h2 className={`text-base font-semibold mb-4 ${textPrimary}`}>
                    {showSavedOnly ? (
                      <>
                        <span className="text-yellow-500">★</span>{' '}
                        {activeSummary.total} saved signal{activeSummary.total !== 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        {totalMatched} signal{totalMatched !== 1 ? 's' : ''} found in{' '}
                        <span className="text-blue-500">{activeSummary.city}</span>
                      </>
                    )}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className={`rounded-lg p-3 text-center border ${isDark ? 'bg-green-900/30 border-green-800' : 'bg-green-50 border-green-200'}`}>
                      <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>{activeSummary.hotLeads}</div>
                      <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-green-500' : 'text-green-600'}`}>Hot Signals</div>
                    </div>
                    <div className={`rounded-lg p-3 text-center border ${isDark ? 'bg-red-900/30 border-red-800' : 'bg-red-50 border-red-200'}`}>
                      <div className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>{activeSummary.distressedOwners}</div>
                      <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-red-500' : 'text-red-600'}`}>Distressed Owners</div>
                    </div>
                    <div className={`rounded-lg p-3 text-center border ${isDark ? 'bg-orange-900/30 border-orange-800' : 'bg-orange-50 border-orange-200'}`}>
                      <div className={`text-2xl font-bold ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>{activeSummary.preForeclosure}</div>
                      <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>Pre-Foreclosure</div>
                    </div>
                    <div className={`rounded-lg p-3 text-center border ${isDark ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>{activeSummary.expiredListings}</div>
                      <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>Expired Listings</div>
                    </div>
                    <div className={`rounded-lg p-3 text-center border ${isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
                      <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>{activeSummary.investorOpportunities}</div>
                      <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>Investor Opps</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* New signals today indicator */}
            {!showSavedOnly && (() => {
              const newCount = displayedResults.filter((p) => {
                const hash = p.address.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                return (hash % 7) + 1 <= 2
              }).length
              return newCount > 0 ? (
                <div className={`inline-flex items-center gap-2 text-sm font-semibold mb-3 px-3 py-1.5 rounded-full border ${
                  isDark
                    ? 'bg-orange-900/20 border-orange-700 text-orange-400'
                    : 'bg-orange-50 border-orange-200 text-orange-600'
                }`}>
                  🔥 {newCount} new signal{newCount !== 1 ? 's' : ''} detected today
                </div>
              ) : null
            })()}

            {/* Market summary mini-stats */}
            {displayedResults.length > 0 && !showSavedOnly && (
              <div className={`${card} p-4 mb-4`}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className={`text-2xl font-bold ${textPrimary}`}>{displayedResults.length}</div>
                    <div className={`text-xs mt-0.5 ${textMuted}`}>Signals Shown</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${textPrimary}`}>
                      {displayedResults.length > 0
                        ? Math.round(displayedResults.reduce((s, p) => s + (p.opportunity_score ?? 0), 0) / displayedResults.length)
                        : 0}
                    </div>
                    <div className={`text-xs mt-0.5 ${textMuted}`}>Avg Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {displayedResults.length > 0
                        ? Math.max(...displayedResults.map((p) => p.opportunity_score ?? 0))
                        : 0}
                    </div>
                    <div className={`text-xs mt-0.5 ${textMuted}`}>Top Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {displayedResults.filter((p) => {
                        const hash = p.address.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
                        return (hash % 7) + 1 <= 2
                      }).length}
                    </div>
                    <div className={`text-xs mt-0.5 ${textMuted}`}>New Today</div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Filters */}
            {viewMode === 'list' && (
              <QuickFilters
                isDark={isDark}
                activeFilters={activeQuickFilters}
                onToggle={handleQuickFilterToggle}
                resultCount={activeQuickFilters.size > 0 ? displayedResults.length : undefined}
              />
            )}

            {/* Action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className={`flex rounded-lg border overflow-hidden text-sm ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-1.5 font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-1.5 font-medium transition-colors border-l ${isDark ? 'border-gray-700' : 'border-gray-200'} ${
                      viewMode === 'map'
                        ? 'bg-blue-600 text-white'
                        : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Map View
                  </button>
                </div>
                {viewMode === 'list' && (
                  <span className={`text-xs ${textMuted}`}>Sorted by opportunity score</span>
                )}
              </div>

              {displayedResults.length > 0 && !showSavedOnly && (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportToCSV(displayedResults, 'signals-page.csv')}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-green-700 text-green-400 hover:bg-gray-600'
                          : 'bg-white border-green-600 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      Export Page
                    </button>
                    <button
                      onClick={exportAll}
                      disabled={isExportingAll}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
                    >
                      {isExportingAll ? 'Exporting…' : 'Export All'}
                    </button>
                  </div>
                  <p className={`text-xs ${textMuted}`}>CSV ready for dialers and CRM systems</p>
                </div>
              )}
            </div>

            {/* Lead count indicator */}
            {displayedResults.length > 0 && !showSavedOnly && (
              <p className={`text-sm mb-3 ${textSecondary}`}>
                Showing{' '}
                <span className={`font-semibold ${textPrimary}`}>{displayedResults.length}</span>{' '}
                of{' '}
                <span className={`font-semibold ${textPrimary}`}>{totalMatched}</span>{' '}
                signals in{' '}
                <span className="font-semibold text-blue-500">{activeSummary?.city ?? 'All Cities'}</span>
              </p>
            )}

            {/* Results */}
            {/* Favorites panel (replaces table when showFavoritesOnly) */}
            {showFavoritesOnly && (
              <FavoritesPanel
                isDark={isDark}
                favorites={favorites}
                onRemove={(s) => toggleFavorite(s as unknown as Signal)}
                onRowClick={setSelectedProperty}
              />
            )}

            {displayedResults.length === 0 && !showFavoritesOnly ? (
              <div className={`text-center py-12 rounded-xl border ${
                isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
              }`}>
                {showSavedOnly
                  ? 'No saved signals yet. Click the ☆ star on any row to save a signal.'
                  : 'No signals found. Try adjusting your filters.'}
              </div>
            ) : !showFavoritesOnly && viewMode === 'list' ? (
              <ResultsTable
                data={displayedResults}
                onRowClick={setSelectedProperty}
                onToggleSave={toggleSave}
                savedKeys={savedKeys}
                onToggleFavorite={(p) => toggleFavorite(p as unknown as Signal)}
                favoriteKeys={favoriteKeys}
                onCompare={handleCompare}
                compareKeys={compareKeys}
              />
            ) : !showFavoritesOnly ? (
              <MapView
                data={displayedResults}
                onPinClick={setSelectedProperty}
                savedKeys={savedKeys}
              />
            ) : null}

            {/* Pagination controls */}
            {!showSavedOnly && searched && totalPages > 1 && viewMode === 'list' && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => fetchPage(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                  className={`${paginationBtnBase} ${currentPage <= 1 ? paginationBtnDisabled : paginationBtnActive}`}
                >
                  ← Previous
                </button>

                <span className={`text-sm font-medium px-2 ${textSecondary}`}>
                  Page{' '}
                  <span className={textPrimary}>{currentPage}</span>
                  {' '}of{' '}
                  <span className={textPrimary}>{totalPages}</span>
                </span>

                <button
                  onClick={() => fetchPage(currentPage + 1)}
                  disabled={currentPage >= totalPages || isLoading}
                  className={`${paginationBtnBase} ${currentPage >= totalPages ? paginationBtnDisabled : paginationBtnActive}`}
                >
                  Next →
                </button>
              </div>
            )}

            {/* Deal Comparison */}
            {compareList.length > 0 && (
              <DealComparison
                properties={compareList}
                onRemove={handleCompare}
                onClear={() => setCompareList([])}
              />
            )}

            {/* Deal Calculator */}
            {!showFavoritesOnly && <DealCalculator isDark={isDark} />}

            {/* Soft Upgrade Prompt */}
            {displayedResults.length > 20 && viewMode === 'list' && (
              <div className={`mt-5 border border-dashed rounded-xl p-5 text-center ${
                isDark
                  ? 'border-blue-800 bg-gradient-to-r from-blue-950/60 to-indigo-950/60'
                  : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
              }`}>
                <p className={`text-sm font-semibold mb-1 ${textPrimary}`}>
                  Showing {displayedResults.length} of many available signals
                </p>
                <p className={`text-xs mb-3 ${textSecondary}`}>
                  Unlock the full database with verified contacts, skip-tracing, and real-time updates.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors">
                  Unlock Full Signal List
                </button>
              </div>
            )}
          </div>
        )}

        {/* Signal detail drawer */}
        <SignalDetailDrawer
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          isSaved={selectedProperty ? isSaved(selectedProperty) : false}
          onToggleSave={toggleSave}
        />
      </div>

      {/* Finder footer */}
      <div className={`border-t mt-8 py-5 px-4 ${isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            © PropertySignalHQ &nbsp;·&nbsp;
            <a href="/terms" className={`hover:underline ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>Terms</a>
            &nbsp;·&nbsp;
            <a href="/privacy" className={`hover:underline ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}>Privacy</a>
          </p>
          <p className={`text-xs ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>
            Property data provided for informational purposes only.
          </p>
        </div>
      </div>
    </div>
  )
}
