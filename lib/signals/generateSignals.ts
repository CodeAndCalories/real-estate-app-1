/**
 * Signal Engine — converts raw property listings into scored property signals.
 *
 * Original scoring criteria:
 *   Price Drop        — latest price >7% below previous price         (+30 pts)
 *   Long DOM          — days_on_market > 90                            (+25 pts)
 *   Below Market      — price_per_sqft >15% below city avg             (+20 pts)
 *   Relisted Property — price_history.length > 2                      (+25 pts)
 *
 * Additional scoring criteria:
 *   Absentee Owner    — owner_state !== property state                 (+15 pts)
 *   High Equity       — (value − loan) / value > 60%                  (+10 pts)
 *   Long Ownership    — years_owned > 15                               (+10 pts)
 *   Tax Delinquent    — tax_delinquent === true                        (+20 pts)
 *   Vacant Property   — vacancy_signal === true                        (+15 pts)
 *   Inherited         — inherited === true                             (+10 pts)
 *
 * Final score is clamped 0–100.
 */

import type { RawProperty } from '@/lib/types/property'
import type { Signal } from '@/lib/data/getSignals'
import { computeSignalId } from '../utils/signalId'

/** City average price per sqft (USD) used for below-market detection */
const CITY_AVG_SQFT: Record<string, number> = {
  phoenix:       220,
  miami:         380,
  dallas:        180,
  atlanta:       190,
  tampa:         250,
  'las vegas':   200,
  chicago:       220,
  cleveland:     120,
  'los angeles': 550,
  'new york':    750,
  nashville:     230,
  jacksonville:  185,
  denver:        310,
  houston:       165,
  'san antonio': 155,
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
  hasRelisted: boolean,
): string {
  if (hasPriceDrop && hasLongDOM) return 'Pre-Foreclosure'
  if (hasRelisted) return 'Expired Listing'
  return 'Investor Opportunity'
}

export function generateSignals(properties: RawProperty[]): Signal[] {
  return properties.map((p) => {
    const cityKey   = p.city.toLowerCase()
    const marketAvg = CITY_AVG_SQFT[cityKey] ?? 200
    const pricePerSqft = p.sqft > 0 ? Math.round(p.price / p.sqft) : null

    // ── Original signal detection ──────────────────────────────────────────

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
    const hasLongDOM   = p.days_on_market > 90
    const belowMarket  = pricePerSqft !== null && pricePerSqft < marketAvg * 0.85
    const hasRelisted  = hist.length > 2

    // ── Additional signal detection ────────────────────────────────────────

    const estimatedValue = p.price
    const loanBalance    = p.loan_balance != null
      ? p.loan_balance
      : Math.round(estimatedValue * deterministicFloat(p.id, 0.40, 0.72))

    const equityPct     = estimatedValue > 0 ? (estimatedValue - loanBalance) / estimatedValue : 0
    const hasHighEquity = equityPct > 0.60

    const isAbsenteeOwner = typeof p.owner_state === 'string' && p.owner_state !== p.state
    const hasLongOwnership = (p.years_owned ?? 0) > 15
    const isTaxDelinquent  = p.tax_delinquent === true
    const isVacant         = p.vacancy_signal === true
    const isInherited      = p.inherited === true

    // ── Opportunity score (0–100) ──────────────────────────────────────────
    let score = 0
    // Original criteria
    if (hasPriceDrop)   score += 30
    if (hasLongDOM)     score += 25
    if (belowMarket)    score += 20
    if (hasRelisted)    score += 25
    // New criteria
    if (isAbsenteeOwner)   score += 15
    if (hasHighEquity)     score += 10
    if (hasLongOwnership)  score += 10
    if (isTaxDelinquent)   score += 20
    if (isVacant)          score += 15
    if (isInherited)       score += 10

    score = Math.min(100, score)

    // ── Derived financial fields ───────────────────────────────────────────
    const rentEstimate = Math.round(
      estimatedValue * deterministicFloat(p.id + '-rent', 0.006, 0.011),
    )

    const daysInDefault =
      p.days_on_market > 120
        ? Math.floor(p.days_on_market * deterministicFloat(p.id + '-def', 0.4, 0.6))
        : null

    return {
      id: computeSignalId(p.address, p.city),
      address:                  p.address,
      city:                     p.city,
      zip:                      p.zip,
      owner_name:               p.owner_name ?? null,
      estimated_value:          estimatedValue,
      loan_balance_estimate:    loanBalance,
      days_in_default:          daysInDefault,
      previous_listing_price:   hist.length >= 2 ? hist[hist.length - 2] : null,
      days_on_market:           p.days_on_market,
      agent_name:               null,
      lead_type:                assignLeadType(hasPriceDrop, hasLongDOM, hasRelisted),
      price_per_sqft:           pricePerSqft,
      market_avg_price_per_sqft: marketAvg,
      price_drop_percent:       priceDrop,
      rent_estimate:            rentEstimate,
      opportunity_score:        score,
      // Enriched fields — passed through from properties.json
      owner_phone:              p.owner_phone              ?? null,
      owner_mailing_address:    p.owner_mailing_address    ?? null,
      owner_state:              p.owner_state              ?? null,
      years_owned:              p.years_owned              ?? null,
      tax_delinquent:           p.tax_delinquent           ?? null,
      vacancy_signal:           p.vacancy_signal           ?? null,
      inherited:                p.inherited                ?? null,
      absentee_owner:           isAbsenteeOwner,
    } satisfies Signal
  })
}
