import type { Signal } from '@/lib/data/getSignals'

/**
 * Returns the single signal with the highest opportunity_score.
 * Pure function — no side effects, safe to call server- or client-side.
 */
export function getBestDeal(signals: Signal[]): Signal | null {
  if (signals.length === 0) return null
  return signals.reduce((best, s) =>
    (s.opportunity_score ?? 0) > (best.opportunity_score ?? 0) ? s : best
  )
}
