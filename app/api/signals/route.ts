import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type MarketRow = {
  metro_name: string
  median_home_value: number | null
  typical_rent: number | null
  market_temp_index: number | null
}

// Module-level cache for Zillow market data — avoids a DB round-trip on every request
let zillowCache: MarketRow[] | null = null
let zillowCacheExpiry = 0
const ZILLOW_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getMarketData(): Promise<MarketRow[]> {
  if (zillowCache && Date.now() < zillowCacheExpiry) return zillowCache
  const { data } = await supabaseAdmin.from('zillow_market_data').select('*')
  zillowCache = (data ?? []) as MarketRow[]
  zillowCacheExpiry = Date.now() + ZILLOW_CACHE_TTL
  return zillowCache
}

const DEFAULT_LIMIT = 50

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') ?? undefined
  const lead_type = searchParams.get('lead_type') ?? undefined
  const min_score = searchParams.get('min_score') ?? undefined
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const sortParam = searchParams.get('sort')

  const page = Math.max(1, pageParam ? parseInt(pageParam, 10) : 1)
  const limit = limitParam ? parseInt(limitParam, 10) : DEFAULT_LIMIT
  const offset = (page - 1) * limit

  // Use admin client to bypass RLS for public property reads
  let query = supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact' })

  if (city) {
    query = query.ilike('city', city)
  }

  if (lead_type) {
    query = query.ilike('lead_type', lead_type)
  }

  if (min_score) {
    query = query.gte('opportunity_score', parseInt(min_score, 10))
  }

  // Always sort by score descending so results are deterministic
  if (sortParam === 'score') {
    query = query.order('opportunity_score', { ascending: false, nullsFirst: false })
  }

  // Secondary sort for deterministic ordering
  query = query.order('id', { ascending: true })

  query = query.range(offset, offset + limit - 1)

  const [propertyResult, marketRows] = await Promise.all([
    query,
    getMarketData(),
  ])

  if (propertyResult.error) {
    return NextResponse.json({ error: propertyResult.error.message }, { status: 500 })
  }

  // Build city → market data lookup
  const marketMap = new Map<string, MarketRow>()
  for (const row of marketRows) {
    marketMap.set(row.metro_name, row)
  }

  // Enrich each property with market data
  const signals = (propertyResult.data ?? []).map(({ created_at: _, ...rest }) => {
    const market = marketMap.get(rest.city as string)
    return {
      ...rest,
      market_median_value: market?.median_home_value ?? null,
      market_typical_rent: market?.typical_rent ?? null,
      market_temp: market?.market_temp_index ?? null,
    }
  })

  return NextResponse.json(
    { total: propertyResult.count ?? signals.length, page, limit, signals },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
  )
}
