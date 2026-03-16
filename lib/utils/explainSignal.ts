import { Property } from '@/app/finder/page'

export function explainSignal(p: Property): string[] {
  const highEquity =
    p.loan_balance_estimate !== null &&
    p.estimated_value > 0 &&
    p.loan_balance_estimate < p.estimated_value * 0.6

  const priceDrop = (p.price_drop_percent ?? 0) > 10
  const distressed = (p.days_in_default ?? 0) > 60
  const longDOM = (p.days_on_market ?? 0) > 90
  const rental =
    p.rent_estimate !== null &&
    p.estimated_value > 0 &&
    p.rent_estimate >= p.estimated_value * 0.01

  const lines: string[] = []

  if (highEquity && longDOM) {
    lines.push('High equity and long listing time detected.')
  } else if (highEquity) {
    lines.push('Loan balance well below market value — high equity.')
  }

  if (priceDrop) lines.push('Recent price drop suggests motivated seller.')
  if (distressed) lines.push('Owner in default — distressed sale potential.')
  if (longDOM && !highEquity) lines.push('Extended days on market — seller may be flexible.')
  if (rental) lines.push('Strong rental yield relative to property value.')

  if (lines.length === 0) return ['No strong signals detected for this property.']

  const score = p.opportunity_score ?? 0
  if (score >= 80 && lines.length >= 2) {
    return ['Multiple strong signals detected.', lines[0]]
  }

  return lines.slice(0, 2)
}
