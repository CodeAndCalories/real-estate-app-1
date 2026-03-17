/**
 * getSignals — data access layer for the /api/signals endpoint.
 *
 * Data loading priority:
 *   1. lib/data/generated-signals.json  — pre-computed by scripts/runSignalEngine.ts
 *   2. lib/data/properties.json         — raw listings; signals computed at request time
 *
 * Refresh schedule options:
 *   - Cron job:          0 2 * * *  npx ts-node scripts/runSignalEngine.ts
 *   - Cloud function:    Vercel Cron / AWS EventBridge rule targeting the script
 *   - Scheduled worker:  GitHub Actions workflow with `schedule:` trigger
 */

import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import propertiesJson from './properties.json'
import { generateSignals } from '@/lib/signals/generateSignals'
import type { RawProperty } from '@/lib/types/property'
import { computeSignalId } from '@/lib/utils/signalId'

// Full signal shape — matches the Property type used by the finder UI
export type Signal = {
  id: string
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
  // Enriched contact + ownership fields (populated by scripts/enrichProperties.ts)
  owner_phone: string | null
  owner_mailing_address: string | null
  owner_state: string | null
  years_owned: number | null
  tax_delinquent: boolean | null
  vacancy_signal: boolean | null
  inherited: boolean | null
  absentee_owner: boolean | null
}

export type SignalFilters = {
  city?: string
  lead_type?: string
  limit?: number
  page?: number
  /** Sort results before pagination. 'score' = descending by opportunity_score */
  sort?: 'score'
}

/** Load the full signal dataset, preferring the pre-generated file. */
function loadAllSignals(): Signal[] {
  const generatedPath = join(process.cwd(), 'lib', 'data', 'generated-signals.json')

  const withId = (signals: Omit<Signal, 'id'>[]): Signal[] =>
    signals.map((s) => ({ ...s, id: computeSignalId(s.address, s.city) }))

  if (existsSync(generatedPath)) {
    try {
      const content = readFileSync(generatedPath, 'utf-8')
      return withId(JSON.parse(content) as Omit<Signal, 'id'>[])
    } catch {
      // Fall through to on-demand generation
    }
  }

  // On-demand fallback: generate signals from raw properties at request time
  return withId(generateSignals(propertiesJson as unknown as RawProperty[]) as Omit<Signal, 'id'>[])
}

export function getSignals(filters: SignalFilters = {}): {
  total: number
  page: number
  limit: number | null
  signals: Signal[]
} {
  let data = loadAllSignals()

  if (filters.city) {
    data = data.filter((s) => s.city.toLowerCase() === filters.city!.toLowerCase())
  }

  if (filters.lead_type) {
    data = data.filter(
      (s) => s.lead_type?.toLowerCase() === filters.lead_type!.toLowerCase()
    )
  }

  // Sort before paginating so limit/page applies to the sorted result
  if (filters.sort === 'score') {
    data = [...data].sort(
      (a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0)
    )
  }

  const total = data.length
  const currentPage = filters.page ?? 1
  const limit = filters.limit ?? null

  if (limit !== null) {
    const offset = (currentPage - 1) * limit
    data = data.slice(offset, offset + limit)
  }

  return { total, page: currentPage, limit, signals: data }
}
