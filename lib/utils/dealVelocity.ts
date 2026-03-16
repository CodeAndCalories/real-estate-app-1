/**
 * Deal Velocity — indicates how urgently a deal needs attention.
 *
 * Scoring:
 *   Days on market  ≤ 7  → +3   ≤ 30 → +2   ≤ 90 → +1
 *   Price drop %   ≥ 10  → +3   ≥ 5  → +2   > 0  → +1
 *   Relisted (Expired Listing)   → +2
 *
 *   Total ≥ 5 → "Hot"  |  ≥ 3 → "Warm"  |  else → "Slow"
 */

export type VelocityLevel = 'Hot' | 'Warm' | 'Slow'

export function getDealVelocity(p: {
  days_on_market?: number | null
  price_drop_percent?: number | null
  lead_type?: string
}): VelocityLevel {
  let score = 0

  const dom  = p.days_on_market ?? 0
  const drop = p.price_drop_percent ?? 0
  const relisted = p.lead_type === 'Expired Listing'

  if (dom <= 7)       score += 3
  else if (dom <= 30) score += 2
  else if (dom <= 90) score += 1

  if (drop >= 10)      score += 3
  else if (drop >= 5)  score += 2
  else if (drop > 0)   score += 1

  if (relisted) score += 2

  if (score >= 5) return 'Hot'
  if (score >= 3) return 'Warm'
  return 'Slow'
}

export const VELOCITY_STYLES: Record<VelocityLevel, { light: string; dark: string }> = {
  Hot:  { light: 'bg-red-100 text-red-700 border border-red-200',    dark: 'bg-red-900/30 text-red-400 border border-red-700' },
  Warm: { light: 'bg-yellow-100 text-yellow-700 border border-yellow-200', dark: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' },
  Slow: { light: 'bg-gray-100 text-gray-500 border border-gray-200', dark: 'bg-gray-700 text-gray-400 border border-gray-600' },
}
