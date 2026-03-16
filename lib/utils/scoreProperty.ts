import { Property } from '@/app/finder/page'

export type LeadTag =
  | 'PRICE DROP'
  | 'DISTRESSED OWNER'
  | 'LONG DAYS ON MARKET'
  | 'HIGH EQUITY'
  | 'STRONG RENTAL POTENTIAL'

export type ScoreLabel = 'Hot Lead' | 'Strong Opportunity' | 'Moderate' | 'Low Priority'

export function calculateOpportunityScore(p: Property): number {
  let score = 0
  if ((p.price_drop_percent ?? 0) > 10) score += 20
  if ((p.days_on_market ?? 0) > 90) score += 20
  if ((p.days_in_default ?? 0) > 60) score += 20
  if (
    p.loan_balance_estimate !== null &&
    p.estimated_value > 0 &&
    p.loan_balance_estimate < p.estimated_value * 0.6
  ) score += 20
  if (
    p.rent_estimate !== null &&
    p.estimated_value > 0 &&
    p.rent_estimate >= p.estimated_value * 0.01
  ) score += 20
  return score
}

export function getScoreLabel(score: number): ScoreLabel {
  if (score >= 80) return 'Hot Lead'
  if (score >= 60) return 'Strong Opportunity'
  if (score >= 40) return 'Moderate'
  return 'Low Priority'
}

export function getLeadTags(p: Property): LeadTag[] {
  const tags: LeadTag[] = []
  if ((p.price_drop_percent ?? 0) > 10) tags.push('PRICE DROP')
  if ((p.days_in_default ?? 0) > 60) tags.push('DISTRESSED OWNER')
  if ((p.days_on_market ?? 0) > 90) tags.push('LONG DAYS ON MARKET')
  if (
    p.loan_balance_estimate !== null &&
    p.estimated_value > 0 &&
    p.loan_balance_estimate < p.estimated_value * 0.6
  ) tags.push('HIGH EQUITY')
  if (
    p.rent_estimate !== null &&
    p.estimated_value > 0 &&
    p.rent_estimate >= p.estimated_value * 0.01
  ) tags.push('STRONG RENTAL POTENTIAL')
  return tags
}

export function scoreAndEnrich(p: Property): Property {
  return { ...p, opportunity_score: calculateOpportunityScore(p) }
}
