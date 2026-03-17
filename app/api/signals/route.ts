import { NextRequest, NextResponse } from 'next/server'
import { getSignals } from '@/lib/data/getSignals'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') ?? undefined
  const lead_type = searchParams.get('lead_type') ?? undefined
  const pageParam = searchParams.get('page')
  const limitParam = searchParams.get('limit')
  const sortParam = searchParams.get('sort')
  const sort: 'score' | undefined = sortParam === 'score' ? 'score' : undefined

  const page = pageParam ? parseInt(pageParam, 10) : 1

  // Default limit of 100 when no filters are provided to prevent large payloads
  const limit = limitParam
    ? parseInt(limitParam, 10)
    : !city && !lead_type
    ? 100
    : undefined

  const { total, signals } = getSignals({ city, lead_type, limit, page, sort })

  return NextResponse.json(
    { total, page, limit: limit ?? null, signals },
    {
      headers: {
        'Cache-Control': 'public, max-age=60',
      },
    }
  )
}
