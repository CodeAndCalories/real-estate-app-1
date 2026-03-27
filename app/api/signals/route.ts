import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') ?? undefined
  const lead_type = searchParams.get('lead_type') ?? undefined
  const min_score = searchParams.get('min_score') ?? undefined
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const sortParam = searchParams.get('sort')

  const page = pageParam ? parseInt(pageParam, 10) : 1

  // Default limit of 100 when no filters are provided to prevent large payloads
  const limit = limitParam
    ? parseInt(limitParam, 10)
    : !city && !lead_type
    ? 100
    : undefined

  // Build the query — select all columns except created_at
  let query = supabase
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

  if (sortParam === 'score') {
    query = query.order('opportunity_score', { ascending: false, nullsFirst: false })
  }

  if (limit !== undefined) {
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Strip created_at so the response shape stays the same
  const signals = (data ?? []).map(({ created_at: _, ...rest }) => rest)

  return NextResponse.json(
    { total: count ?? signals.length, page, limit: limit ?? null, signals },
    {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    }
  )
}
