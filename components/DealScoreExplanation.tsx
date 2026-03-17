// Server-compatible — no 'use client' needed (pure props, no hooks)

type SignalLike = {
  opportunity_score?: number | null
  price_drop_percent?: number | null
  days_on_market?: number | null
  days_in_default?: number | null
  estimated_value?: number
  loan_balance_estimate?: number | null
  rent_estimate?: number | null
  price_per_sqft?: number | null
  market_avg_price_per_sqft?: number | null
  lead_type?: string
}

type CheckPoint = { text: string; category: 'price' | 'time' | 'owner' | 'equity' | 'rental' }

function buildPoints(s: SignalLike): CheckPoint[] {
  const points: CheckPoint[] = []

  if ((s.price_drop_percent ?? 0) > 5)
    points.push({
      text: `Price drop detected (−${s.price_drop_percent?.toFixed(1)}%)`,
      category: 'price',
    })

  if ((s.days_on_market ?? 0) > 90)
    points.push({
      text: `Long days on market (${s.days_on_market} days listed)`,
      category: 'time',
    })

  if ((s.days_in_default ?? 0) > 60)
    points.push({
      text: `Distressed owner — ${s.days_in_default} days in default`,
      category: 'owner',
    })

  if (
    s.loan_balance_estimate != null &&
    (s.estimated_value ?? 0) > 0 &&
    s.loan_balance_estimate < (s.estimated_value ?? 0) * 0.6
  ) {
    const pct = Math.round(
      (1 - s.loan_balance_estimate / (s.estimated_value ?? 1)) * 100
    )
    points.push({
      text: `High estimated equity position (~${pct}% equity)`,
      category: 'equity',
    })
  }

  if (
    s.price_per_sqft != null &&
    s.market_avg_price_per_sqft != null &&
    s.price_per_sqft < s.market_avg_price_per_sqft * 0.9
  ) {
    const diff = Math.round(
      ((s.market_avg_price_per_sqft - s.price_per_sqft) / s.market_avg_price_per_sqft) * 100
    )
    points.push({
      text: `Below market price/sqft (${diff}% below area avg)`,
      category: 'price',
    })
  }

  if (
    s.rent_estimate != null &&
    (s.estimated_value ?? 0) > 0 &&
    s.rent_estimate >= (s.estimated_value ?? 0) * 0.009
  ) {
    const yld = ((s.rent_estimate / (s.estimated_value ?? 1)) * 100).toFixed(2)
    points.push({
      text: `Strong rental yield (${yld}% monthly rent-to-value)`,
      category: 'rental',
    })
  }

  if (s.lead_type === 'Expired Listing')
    points.push({
      text: 'Previously expired listing — seller flexibility likely',
      category: 'time',
    })

  return points
}

function scoreTier(score: number): {
  label: string
  barColor: string
  badgeClass: string
} {
  if (score >= 80)
    return {
      label: 'Hot Lead',
      barColor: 'bg-green-500',
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
    }
  if (score >= 60)
    return {
      label: 'Strong Opportunity',
      barColor: 'bg-yellow-400',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    }
  return {
    label: 'Moderate',
    barColor: 'bg-orange-400',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
  }
}

type Props = {
  signal: SignalLike
}

export default function DealScoreExplanation({ signal }: Props) {
  const score = signal.opportunity_score ?? 0
  const points = buildPoints(signal)
  const tier = scoreTier(score)

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Deal Score Explanation
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-gray-900">{score}</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tier.badgeClass}`}
          >
            {tier.label}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Score bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400 font-medium">Opportunity Score</span>
            <span className="text-xs text-gray-500 font-semibold">{score} / 100</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${tier.barColor}`}
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>

        {/* Why this deal stands out */}
        {points.length > 0 ? (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Why this deal stands out
            </p>
            <ul className="space-y-1.5">
              {points.map((p) => (
                <li key={p.text} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 mt-0.5 text-green-500 font-bold">✓</span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No strong signal drivers detected for this property.
          </p>
        )}

        {/* Driver count note */}
        {points.length > 0 && (
          <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
            {points.length} signal driver{points.length !== 1 ? 's' : ''} contributed to this score.
            Higher scores indicate stronger investor opportunities.
          </p>
        )}
      </div>
    </section>
  )
}
