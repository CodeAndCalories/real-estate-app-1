/**
 * Investor Pick — marks a property as a top-tier pick when score >= 90.
 */

export function isInvestorPick(p: { opportunity_score?: number | null }): boolean {
  return (p.opportunity_score ?? 0) >= 90
}

export const INVESTOR_PICK_LABEL = '🔥 Investor Pick'
