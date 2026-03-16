import { NextResponse } from 'next/server'
import { getSignals } from '@/lib/data/getSignals'

export async function GET() {
  // Load all signals (no pagination) and filter for hot leads
  const { signals } = getSignals({ limit: 9999 })

  const deals = signals
    .filter((s) => (s.opportunity_score ?? 0) >= 80)
    .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0))
    .slice(0, 10)

  const date = new Date().toISOString().split('T')[0]

  return NextResponse.json(
    { date, deals },
    {
      headers: {
        // Cache for 1 hour — deals refresh daily, not per-request
        'Cache-Control': 'public, max-age=3600',
      },
    }
  )
}
