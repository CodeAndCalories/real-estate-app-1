/**
 * Signal Engine — converts raw property listings into scored property signals.
 *
 * Signals detected:
 *   Price Drop        — latest price >7% below previous price        (+30 pts)
 *   Long DOM          — days_on_market > 90                           (+25 pts)
 *   Below Market      — price_per_sqft >15% below city avg            (+20 pts)
 *   Relisted Property — price_history.length > 2                     (+25 pts)
 *
 * Score is clamped 0–100.
 */

import type { RawProperty } from '@/lib/types/property'
import type { Signal } from '@/lib/data/getSignals'
import { computeSignalId } from '@/lib/utils/signalId'

/** City average price per sqft (USD) used for below-market detection */
const CITY_AVG_SQFT: Record<string, number> = {
  phoenix: 220,
  miami: 380,
  dallas: 180,
  atlanta: 190,
  tampa: 250,
  'las vegas': 200,
  chicago: 220,
  cleveland: 120,
}

/**
 * Deterministic pseudo-random float in [min, max) seeded by a string.
 * Used so loan_balance / rent_estimate are stable across builds.
 */
function deterministicFloat(seed: string, min: number, max: number): number {
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return min + ((hash % 1000) / 1000) * (max - min)
}

function assignLeadType(
  hasPriceDrop: boolean,
  hasLongDOM: boolean,
  hasRelisted: boolean
): string {
  if (hasPriceDrop && hasLongDOM) return 'Pre-Foreclosure'
  if (hasRelisted) return 'Expired Listing'
  return 'Investor Opportunity'
}

export function generateSignals(properties: RawProperty[]): Signal[] {
  return properties.map((p) => {
    const cityKey = p.city.toLowerCase()
    const marketAvg = CITY_AVG_SQFT[cityKey] ?? 200
    const pricePerSqft = p.sqft > 0 ? Math.round(p.price / p.sqft) : null

    // --- Signal detection ---

    // Price drop: compare last two entries in price_history
    let priceDrop: number | null = null
    const hist = p.price_history
    if (hist.length >= 2) {
      const prev = hist[hist.length - 2]
      const curr = hist[hist.length - 1]
      if (prev > 0 && prev > curr) {
        priceDrop = Math.round(((prev - curr) / prev) * 100)
      }
    }

    const hasPriceDrop = priceDrop !== null && priceDrop > 7
    const hasLongDOM = p.days_on_market > 90
    const belowMarket = pricePerSqft !== null && pricePerSqft < marketAvg * 0.85
    const hasRelisted = hist.length > 2

    // --- Opportunity score (0–100) ---
    let score = 0
    if (hasPriceDrop) score += 30
    if (hasLongDOM) score += 25
    if (belowMarket) score += 20
    if (hasRelisted) score += 25
    score = Math.min(100, score)

    // --- Signal explanation bullets ---
    const explanation: string[] = []
    if (hasPriceDrop) explanation.push('Recent price drop detected')
    if (hasLongDOM) explanation.push('Property has been listed for a long time')
    if (belowMarket) explanation.push('Priced below market average per sqft')
    if (hasRelisted) explanation.push('Property has been relisted multiple times')

    // --- Derived financial fields ---
    const estimatedValue = p.price
    const loanBalance = p.loan_balance
      ? p.loan_balance
      : Math.round(estimatedValue * deterministicFloat(p.id, 0.40, 0.72))

    const rentEstimate = Math.round(
      estimatedValue * deterministicFloat(p.id + '-rent', 0.006, 0.011)
    )

    // days_in_default: only set for properties with very long DOM
    const daysInDefault =
      p.days_on_market > 120
        ? Math.floor(p.days_on_market * deterministicFloat(p.id + '-def', 0.4, 0.6))
        : null

    return {
      id: computeSignalId(p.address, p.city),
      address: p.address,
      city: p.city,
      zip: p.zip,
      owner_name: p.owner_name ?? null,
      estimated_value: estimatedValue,
      loan_balance_estimate: loanBalance,
      days_in_default: daysInDefault,
      previous_listing_price: hist.length >= 2 ? hist[hist.length - 2] : null,
      days_on_market: p.days_on_market,
      agent_name: null,
      lead_type: assignLeadType(hasPriceDrop, hasLongDOM, hasRelisted),
      price_per_sqft: pricePerSqft,
      market_avg_price_per_sqft: marketAvg,
      price_drop_percent: priceDrop,
      rent_estimate: rentEstimate,
      opportunity_score: score,
      // Non-standard field carried through for UI explanation tooltips
      // (stored as comment — Signal type doesn't include it)
    } satisfies Signal
  })
}
