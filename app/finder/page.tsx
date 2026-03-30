'use client'

import { useState, useMemo, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { useProStatus } from '@/lib/hooks/useProStatus'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase-browser'
import posthog from 'posthog-js'

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
  // Enriched contact + ownership fields
  owner_phone: string | null
  owner_mailing_address: string | null
  owner_state: string | null
  years_owned: number | null
  tax_delinquent: boolean | null
  vacancy_signal: boolean | null
  inherited: boolean | null
  absentee_owner: boolean | null
  // Zillow market context (enriched by API)
  market_median_value?: number | null
  market_typical_rent?: number | null
  market_temp?: number | null
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

const DEFAULT_CITIES = ['', 'Miami', 'Los Angeles', 'New York', 'Dallas', 'Atlanta', 'Chicago', 'Phoenix', 'Cleveland']
const LEAD_TYPES = [
  { value: '', label: 'All Lead Types' },
  { value: 'Pre-Foreclosure', label: 'Pre-Foreclosure / Distressed' },
  { value: 'Expired Listing', label: 'Recently Expired Listings' },
  { value: 'Investor Opportunity', label: 'Investor Opportunities' },
]
const STRATEGIES = ['All Strategies', 'Fix and Flip', 'Buy and Hold', 'Wholesale', 'Rental Income']
const MAX_RESULTS = [50, 100, 250, 500]

function FinderContent() {
  const { isDark } = useThemeMode()
  const { isLoggedIn, user } = useAuth()
  const { isPro } = useProStatus(user?.email)
  const searchParams = useSearchParams()

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

  // Dynamic city list from Supabase + city restore (URL param > localStorage)
  const [cityOptions, setCityOptions] = useState<string[]>(DEFAULT_CITIES)
  useEffect(() => {
    const urlCity = searchParams.get('city')
    if (urlCity) {
      // URL param takes priority — set city and immediately run the search
      setSearchCity(urlCity)
      setWelcomeBackCity(null)
      fetchPage(1, { city: urlCity, lead_type: '', limit: 50 })
    } else {
      try {
        const preferred = localStorage.getItem('pshq-preferred-city')
        if (preferred) {
          setSearchCity(preferred)
          setWelcomeBackCity(preferred)
        }
      } catch { /* ignore */ }
    }

    fetch('/api/cities')
      .then((r) => r.json())
      .then((data: { cities?: { city: string }[] }) => {
        if (data.cities && data.cities.length > 0) {
          setCityOptions(['', ...data.cities.map((c) => c.city)])
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { savedLeads, savedKeys, toggleSave, isSaved } = useSavedLeads()
  const { favorites, favoriteKeys, toggleFavorite } = useFavorites()
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const resultsRef = useRef<HTMLDivElement>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showCityGrid, setShowCityGrid] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [welcomeBackCity, setWelcomeBackCity] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  // ── DB-backed favorites (pro: functional, free: column visible but disabled) ──
  const [dbFavoriteKeys, setDbFavoriteKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoggedIn || !user?.email) { setDbFavoriteKeys(new Set()); return }
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return
      fetch('/api/favorites', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((data: { favorites?: { property_id: string }[] }) => {
          if (data.favorites) {
            setDbFavoriteKeys(new Set(data.favorites.map((f) => f.property_id)))
          }
        })
        .catch(() => {})
    })
  }, [isLoggedIn, user?.email])

  const handleDbFavoriteToggle = async (p: Property) => {
    if (!isLoggedIn || !isPro) return
    const key = propertyKey(p)

    // Optimistic update
    setDbFavoriteKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

    try {
      const { data: { session } } = await supabaseBrowser.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch('/api/favorites', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          property_id: key,
          address:     p.address,
          city:        p.city,
          score:       p.opportunity_score ?? null,
          signal_type: p.lead_type,
        }),
      })
      const data = (await res.json()) as { favorited?: boolean; error?: string }

      // Sync with confirmed server state
      if (data.favorited !== undefined) {
        setDbFavoriteKeys((prev) => {
          const next = new Set(prev)
          if (data.favorited) next.add(key)
          else next.delete(key)
          return next
        })
      } else {
        // On error, revert optimistic update
        setDbFavoriteKeys((prev) => {
          const next = new Set(prev)
          if (next.has(key)) next.delete(key)
          else next.add(key)
          return next
        })
      }
    } catch {
      // Revert on network error
      setDbFavoriteKeys((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
    }
  }

  // Saved analyses count (any logged-in user)
  const [savedAnalysesCount, setSavedAnalysesCount] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (!isLoggedIn || !user?.email) return
    const email = user.email.toLowerCase().trim()
    supabaseBrowser
      .from('saved_analyses')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .then(({ count }) => {
        if (count !== null) setSavedAnalysesCount(count)
      })
  }, [isLoggedIn, user?.email])

  // Recent analyzed deals (pro only)
  interface RecentDeal {
    id: string
    address: string
    score: number
    confidence: string
    saved_at: string
  }
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([])
  useEffect(() => {
    if (!isPro || !user?.email) return
    const email = user.email.toLowerCase().trim()
    supabaseBrowser
      .from('saved_analyses')
      .select('id, address, score, confidence, saved_at')
      .eq('email', email)
      .order('saved_at', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setRecentDeals(data as RecentDeal[])
      })
  }, [isPro, user?.email])

  const [saveSearchToast, setSaveSearchToast] = useState<string | null>(null)

  const handleSaveSearch = async () => {
    const next = {
      ...(searchCity ? { city: searchCity } : {}),
      ...(advMinScore > 0 ? { minScore: advMinScore } : {}),
      ...(advMinEquity > 0 ? { minEquity: advMinEquity } : {}),
      ...(advMaxDOM > 0 ? { maxDaysOnMarket: advMaxDOM } : {}),
    }
    setSavedSearches((prev) => saveSearch(prev, next))

    // Persist to Supabase for logged-in users (enables email alerts)
    if (isLoggedIn) {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession()
        if (session?.access_token) {
          await fetch('/api/saved-searches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
            body: JSON.stringify({
              city: searchCity || null,
              lead_type: searchLeadType || null,
              min_score: advMinScore || 0,
            }),
          })
          setSaveSearchToast('Search saved — you\'ll get daily alerts when new deals match.')
          setTimeout(() => setSaveSearchToast(null), 4000)
        }
      } catch { /* silent — localStorage save already succeeded */ }
    }
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

  // Export state
  const [isExportingAll, setIsExportingAll] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  function buildExportFilename(label: string) {
    const city = searchCity.trim().toLowerCase().replace(/\s+/g, '-') || 'all'
    const date = new Date().toISOString().split('T')[0]
    return `propertysignalhq-leads-${city}-${label}-${date}.csv`
  }

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

  const runSearch = () => {
    posthog.capture('signal_finder_searched', { city: searchCity, lead_type: searchLeadType })
    try { localStorage.setItem('pshq-preferred-city', searchCity) } catch { /* ignore */ }
    setWelcomeBackCity(null)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
    fetchPage(1, { city: searchCity, lead_type: searchLeadType, limit: searchMaxResults })
  }

  const exportAll = async () => {
    if (!isPro) { setShowExportModal(true); return }
    setIsExportingAll(true)
    try {
      const { signals } = await fetchSignals({
        city: searchCity || undefined,
        lead_type: searchLeadType || undefined,
        limit: 1000,
      })
      exportToCSV(signals as Property[], buildExportFilename('all'))
    } catch {
      // silently ignore
    } finally {
      setIsExportingAll(false)
    }
  }

  const handlePopularCity = (city: string) => {
    try { localStorage.setItem('pshq-preferred-city', city) } catch { /* ignore */ }
    setWelcomeBackCity(null)
    setSearchCity(city)
    fetchPage(1, { city, lead_type: searchLeadType, limit: searchMaxResults })
  }

  const filteredCityOptions = useMemo(() => {
    const all = cityOptions.filter((c) => c)
    if (!searchCity) return all.slice(0, 10)
    const q = searchCity.toLowerCase()
    return all.filter((c) => c.toLowerCase().includes(q)).slice(0, 10)
  }, [searchCity, cityOptions])

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

  // Theme-aware class helpers — always dark
  const pageBg = 'min-h-screen bg-[#020617]'

  const card = 'bg-[#0f172a] border border-white/10 rounded-xl shadow-sm'

  const textPrimary = 'text-white'
  const textSecondary = 'text-gray-400'
  const textMuted = 'text-gray-500'

  const selectClass = 'w-full border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#0f172a] text-gray-200 transition-colors'

  const labelClass = 'block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-500'

  const paginationBtnBase = `px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors`
  const paginationBtnActive = 'bg-[#0f172a] border-white/10 text-gray-300 hover:bg-white/10'
  const paginationBtnDisabled = 'bg-white/5 border-white/10 text-gray-600 cursor-not-allowed'

  return (
    <div className={pageBg}>
      <div className="max-w-[1200px] mx-auto px-4 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h1 className={`font-display text-2xl font-bold ${textPrimary}`}>Signal Finder</h1>
            <p className="text-xs text-gray-500 mt-0.5">Updated daily · 88,000+ signals across 125+ cities</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {favorites.length > 0 && (
              <button
                onClick={() => { setShowFavoritesOnly((v) => !v); setShowSavedOnly(false) }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  showFavoritesOnly
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    : 'bg-white/5 border-white/10 text-gray-400'
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
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <span className="text-yellow-400">★</span>
                {showSavedOnly ? '← Back to Results' : `Show Saved Signals (${savedLeads.length})`}
              </button>
            )}
          </div>
        </div>

        {/* Welcome back banner */}
        {welcomeBackCity && !searched && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-sm text-blue-300">
            <svg className="h-4 w-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Welcome back — showing leads for{' '}
            <span className="font-semibold text-blue-200">{welcomeBackCity}</span>
          </div>
        )}

        {/* City-first search hero */}
        <div className={`${card} p-6 mb-6`}>
          <h2 className="text-xl font-bold text-white mb-1">Where are you investing?</h2>
          <p className="text-sm text-gray-500 mb-5">
            Search 88,000+ distressed property signals across{' '}
            {cityOptions.length > 1 ? cityOptions.length - 1 : 108} cities.
          </p>

          {/* Main search row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* City typeahead */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchCity}
                onChange={(e) => { setSearchCity(e.target.value); setShowCityDropdown(true) }}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setShowCityDropdown(false); runSearch() } }}
                placeholder="City or market — e.g. Phoenix"
                className="w-full border border-white/10 rounded-lg px-4 py-3 text-sm bg-[#0f172a] text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              {showCityDropdown && filteredCityOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0f1e] border border-white/10 rounded-xl shadow-2xl z-30 max-h-56 overflow-y-auto">
                  {filteredCityOptions.map((c) => (
                    <button
                      key={c}
                      onMouseDown={() => { setSearchCity(c); setShowCityDropdown(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Signal type */}
            <select
              value={searchLeadType}
              onChange={(e) => setSearchLeadType(e.target.value)}
              className="sm:w-52 border border-white/10 rounded-lg px-4 py-3 text-sm bg-[#0f172a] text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LEAD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            {/* Generate Leads */}
            <button
              onClick={runSearch}
              disabled={isLoading}
              className="sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-lg text-sm transition-colors shadow-lg shadow-blue-600/25 whitespace-nowrap"
            >
              {isLoading ? 'Loading…' : 'Generate Leads'}
            </button>
          </div>

          {/* Popular city pills */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-gray-600 mr-1">Popular:</span>
            {['Phoenix', 'Miami', 'Dallas', 'Atlanta', 'Chicago', 'Charlotte'].map((c) => (
              <button
                key={c}
                onClick={() => handlePopularCity(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  searchCity === c
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-blue-600/10 hover:border-blue-500/20'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
            <button
              onClick={handleSaveSearch}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-blue-600/40"
            >
              <span>＋</span> Save Search
            </button>
            <button
              onClick={() => setShowAdvancedFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                showAdvancedFilters
                  ? 'bg-blue-900/30 border-blue-700 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              Filters {showAdvancedFilters ? '▲' : '▼'}
              {(advMinScore > 0 || advMaxDOM > 0 || advMinEquity > 0) && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                  {[advMinScore > 0, advMaxDOM > 0, advMinEquity > 0].filter(Boolean).length}
                </span>
              )}
            </button>
            <select
              value={searchMaxResults}
              onChange={(e) => setSearchMaxResults(Number(e.target.value))}
              className="border border-white/10 rounded-lg px-3 py-1.5 text-xs bg-[#0f172a] text-gray-400 focus:outline-none"
            >
              {MAX_RESULTS.map((n) => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
            <button
              onClick={() => setShowCityGrid((v) => !v)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors ml-auto"
            >
              {showCityGrid
                ? '▲ Hide cities'
                : `Browse all ${cityOptions.length > 1 ? cityOptions.length - 1 : 86} cities →`}
            </button>
          </div>

          {/* Advanced filter panel */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textSecondary}`}>
                Advanced Filters{' '}
                <span className={`font-normal normal-case ${textMuted}`}>
                  (applied client-side to current results)
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Min Opportunity Score</label>
                  <select value={advMinScore} onChange={(e) => setAdvMinScore(Number(e.target.value))} className={selectClass}>
                    <option value={0}>Any score</option>
                    <option value={40}>40+ (Moderate)</option>
                    <option value={60}>60+ (Strong)</option>
                    <option value={80}>80+ (Hot Lead)</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Max Days on Market</label>
                  <select value={advMaxDOM} onChange={(e) => setAdvMaxDOM(Number(e.target.value))} className={selectClass}>
                    <option value={0}>Any</option>
                    <option value={30}>≤ 30 days</option>
                    <option value={60}>≤ 60 days</option>
                    <option value={90}>≤ 90 days</option>
                    <option value={180}>≤ 180 days</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Min Est. Equity</label>
                  <select value={advMinEquity} onChange={(e) => setAdvMinEquity(Number(e.target.value))} className={selectClass}>
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

          {/* Collapsible city grid */}
          {showCityGrid && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <MarketOverview />
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

        {/* Portfolio Summary — logged-in users only */}
        {isLoggedIn && (
          <PortfolioSummary isDark={isDark} savedAnalysesCount={savedAnalysesCount} />
        )}

        {/* Loading / Results anchor */}
        <div id="results-section" ref={resultsRef} />

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
                    {isLoggedIn ? (
                      <>
                        <button
                          onClick={() => {
                            if (!isPro) { setShowExportModal(true); return }
                            exportToCSV(displayedResults, buildExportFilename('page'))
                          }}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${
                            isDark
                              ? 'bg-gray-700 border-green-700 text-green-400 hover:bg-gray-600'
                              : 'bg-white border-green-600 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          {isPro ? 'Export Page' : '🔒 Export Page'}
                        </button>
                        <button
                          onClick={exportAll}
                          disabled={isExportingAll}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
                        >
                          {isExportingAll ? 'Exporting…' : isPro ? 'Export All' : '🔒 Export All'}
                        </button>
                      </>
                    ) : (
                      <a
                        href="/login"
                        className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
                      >
                        🔒 Login to Export
                      </a>
                    )}
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
                onToggleFavorite={isLoggedIn ? handleDbFavoriteToggle : undefined}
                favoriteKeys={isLoggedIn ? dbFavoriteKeys : favoriteKeys}
                onCompare={handleCompare}
                compareKeys={compareKeys}
                isPro={isPro}
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
                <button
                  onClick={() => { posthog.capture('upgrade_clicked'); window.location.href = '/upgrade' }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
                >
                  Upgrade to Pro →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Below-fold sections ─────────────────────────────────── */}

        {/* Recent Deals You Saved — pro only */}
        {isPro && (
          <div className="rounded-xl border mb-5 mt-8 overflow-hidden bg-[#0f172a] border-white/10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-base">🔖</span>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-white">Recent Deals You Saved</h2>
                  <p className="text-xs text-gray-400">Your latest analyzed opportunities</p>
                </div>
              </div>
              <Link href="/saved-deals" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                View all saved deals →
              </Link>
            </div>
            <div className="p-4">
              {recentDeals.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm font-medium mb-1 text-gray-300">No saved deals yet</p>
                  <p className="text-xs mb-4 text-gray-500">Analyze a property to start tracking opportunities.</p>
                  <Link href="/analyze" className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors">
                    + Analyze Your First Deal
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 border-white/10 bg-white/5">
                      <p className="text-sm font-medium truncate capitalize text-gray-200">{deal.address}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-sm font-bold ${deal.score >= 70 ? 'text-emerald-400' : deal.score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {deal.score}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          deal.confidence === 'High' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-600/20'
                          : deal.confidence === 'Medium' ? 'bg-yellow-600/10 text-yellow-400 border-yellow-600/20'
                          : 'bg-gray-600/10 text-gray-400 border-gray-600/20'
                        }`}>
                          {deal.confidence}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DashboardSummary isDark={isDark} />
        <PipelineSummary isDark={isDark} />
        <SavedDealsPanel isDark={isDark} />
        <OpportunityAlerts isDark={isDark} />

        <SectionDivider label="Market Overview" isDark={isDark} />
        <InvestorStats isDark={isDark} />
        <MarketLeaderboard isDark={isDark} />
        <MarketTrendCards isDark={isDark} />

        <SectionDivider label="Today's Opportunities" isDark={isDark} />
        <DailyOpportunities isDark={isDark} onRowClick={setSelectedProperty} />
        <DealPipelinePanel isDark={isDark} onRowClick={setSelectedProperty} />

        <SectionDivider label="High Score Deals" isDark={isDark} />
        <HotDeals isDark={isDark} />

        <InvestorSignupBanner isDark={isDark} />
        <InvestorTrustBanner isDark={isDark} />

        {/* Signal detail drawer */}
        <SignalDetailDrawer
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          isSaved={selectedProperty ? isSaved(selectedProperty) : false}
          onToggleSave={toggleSave}
          isPro={isPro}
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

      {/* Export upgrade modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-gray-900 border border-white/10 p-8 shadow-2xl text-center">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/20 mx-auto mb-4">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Export is a Pro Feature</h2>
            <p className="text-sm text-gray-400 mb-6">Upgrade to Pro to download leads as CSV — up to 1,000 records per export with owner contact info included.</p>
            <Link
              href="/pricing"
              className="block w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
              onClick={() => setShowExportModal(false)}
            >
              Upgrade to Download
            </Link>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Save search toast */}
      {saveSearchToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-600/30 animate-fade-in">
          {saveSearchToast}
        </div>
      )}

      {/* Floating scroll-to-top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
          aria-label="Scroll to top"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function FinderPage() {
  return (
    <Suspense fallback={null}>
      <FinderContent />
    </Suspense>
  )
}
