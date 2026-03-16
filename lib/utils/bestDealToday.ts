import type { Signal } from '@/lib/data/getSignals'

/**
 * Returns the signal with the highest opportunity_score from a list.
 * Falls back to the first signal if the list is empty.
 */
export function bestDealToday(signals: Signal[]): Signal | null {
  if (signals.length === 0) return null
  return signals.reduce((best, s) =>
    (s.opportunity_score ?? 0) > (best.opportunity_score ?? 0) ? s : best
  )
}
