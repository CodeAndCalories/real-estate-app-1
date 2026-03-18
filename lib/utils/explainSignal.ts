import { Property } from '@/app/finder/page'

/**
 * Generates exactly 3 investor-focused narrative insights for a property.
 *
 * Priority order:
 *   1. Price vs market average (strongest context signal)
 *   2. Recent price drop
 *   3. Distress signals: tax delinquent → vacant → inherited → absentee → long ownership
 *   4. Days on market
 *   5. Score-based fallback (high or low)
 *   6. Generic padding if fewer than 3 insights generated
 */
export function explainSignal(p: Property): string[] {
  const insights: string[] = []

  const score  = p.opportunity_score ?? 0
  const dom    = p.days_on_market    ?? 0
  const psf    = p.price_per_sqft
  const avgPsf = p.market_avg_price_per_sqft

  // ── 1. Price vs market ──────────────────────────────────────────────────────
  if (psf !== null && avgPsf !== null && avgPsf > 0) {
    const ratio = psf / avgPsf
    if (ratio < 0.85) {
      insights.push(
        'This property is priced noticeably below the typical $/sqft for the area, which can indicate a motivated seller or an opportunity to capture equity on purchase.'
      )
    } else if (ratio > 1.1) {
      insights.push(
        'This property is priced above typical market levels, which may limit margin unless there are unique upside factors not reflected in the data.'
      )
    } else {
      insights.push(
        'The property appears roughly in line with local pricing, suggesting a more competitive deal where profit will depend on execution rather than entry discount.'
      )
    }
  }

  // ── 2. Recent price drop ────────────────────────────────────────────────────
  if (insights.length < 3 && (p.price_drop_percent ?? 0) > 7) {
    insights.push(
      'A recent price reduction suggests the seller may be motivated to close, potentially opening room for further negotiation.'
    )
  }

  // ── 3. Distress signals (strongest first) ──────────────────────────────────
  if (insights.length < 3 && p.tax_delinquent) {
    insights.push(
      'Tax delinquency is a strong indicator of financial distress, suggesting the owner may be motivated to sell quickly or negotiate on price.'
    )
  }

  if (insights.length < 3 && p.vacancy_signal) {
    insights.push(
      'Vacancy signals carrying costs for the owner, which often increases seller motivation and willingness to negotiate.'
    )
  }

  if (insights.length < 3 && p.inherited) {
    insights.push(
      'Inherited properties frequently come to market at below-value prices as heirs prioritize a quick, clean sale over maximum profit.'
    )
  }

  if (insights.length < 3 && p.absentee_owner) {
    insights.push(
      'Absentee ownership suggests the property is not owner-occupied, increasing the likelihood the owner is open to an off-market offer.'
    )
  }

  if (insights.length < 3 && (p.years_owned ?? 0) > 15) {
    insights.push(
      'Long-term ownership often means significant equity accumulation, giving the seller flexibility to accept a discounted offer while still profiting.'
    )
  }

  // ── 4. Days on market ───────────────────────────────────────────────────────
  if (insights.length < 3 && dom > 90) {
    insights.push(
      "Extended time on market suggests the property has not attracted strong conventional buyer interest, which can work in an investor's favor during negotiation."
    )
  } else if (insights.length < 3 && dom > 30) {
    insights.push(
      'Above-average days on market may indicate pricing resistance or condition concerns, both of which can create negotiating leverage.'
    )
  }

  // ── 5. Score-based fallbacks ────────────────────────────────────────────────
  if (insights.length < 3 && score >= 70) {
    insights.push(
      'Strong signal profile based on multiple data points — this property scores well across price, market conditions, and owner motivation indicators.'
    )
  }

  if (insights.length < 3 && score < 40) {
    insights.push(
      'Limited distress signals detected. This property may be better suited for conventional buyers than value-add investors.'
    )
  }

  // ── 6. Padding ──────────────────────────────────────────────────────────────
  const PAD =
    'Additional market data may reveal further opportunities not captured in current signals.'
  while (insights.length < 3) insights.push(PAD)

  return insights.slice(0, 3)
}
