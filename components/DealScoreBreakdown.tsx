// Server-compatible — no 'use client' needed (pure props, no hooks)

type SignalLike = {
  opportunity_score?: number | null
  price_drop_percent?: number | null
  days_on_market?: number | null
  days_in_default?: number | null
  estimated_value?: number
  loan_balance_estimate?: number | null
  rent_estimate?: number | null
  previous_listing_price?: number | null
  lead_type?: string
  price_per_sqft?: number | null
  market_avg_price_per_sqft?: number | null
}

type Tag = {
  label: string
  description: string
  color: {
    bg: string
    text: string
    border: string
    dot: string
  }
}

function buildTags(s: SignalLike): Tag[] {
  const tags: Tag[] = []

  const priceDrop   = (s.price_drop_percent ?? 0) > 5
  const longDOM     = (s.days_on_market ?? 0) > 90
  const distressed  = (s.days_in_default ?? 0) > 60
  const relisted    = s.lead_type === 'Expired Listing'
  const highEquity  =
    s.loan_balance_estimate != null &&
    (s.estimated_value ?? 0) > 0 &&
    s.loan_balance_estimate < (s.estimated_value ?? 0) * 0.6
  const belowMarket =
    s.price_per_sqft != null &&
    s.market_avg_price_per_sqft != null &&
    s.price_per_sqft < s.market_avg_price_per_sqft * 0.9
  const strongRental =
    s.rent_estimate != null &&
    (s.estimated_value ?? 0) > 0 &&
    s.rent_estimate >= (s.estimated_value ?? 0) * 0.009

  if (priceDrop) {
    tags.push({
      label: 'Price Drop Detected',
      description: `Price reduced ${s.price_drop_percent?.toFixed(1) ?? ''}% — motivated seller signal`,
      color: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
    })
  }

  if (longDOM) {
    tags.push({
      label: 'Long Days on Market',
      description: `${s.days_on_market} days listed — seller urgency increasing`,
      color: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' },
    })
  }

  if (distressed) {
    tags.push({
      label: 'Distressed Owner',
      description: `${s.days_in_default} days in default — pre-foreclosure pressure`,
      color: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    })
  }

  if (relisted) {
    tags.push({
      label: 'Relisted Property',
      description: 'Previously expired — owner may be more flexible on price',
      color: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400' },
    })
  }

  if (highEquity) {
    tags.push({
      label: 'High Equity Position',
      description: 'Loan balance well below market value — strong equity buffer',
      color: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
    })
  }

  if (belowMarket) {
    tags.push({
      label: 'Below Market Price',
      description: 'Price per sqft below area average — potential value gap',
      color: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-400' },
    })
  }

  if (strongRental) {
    tags.push({
      label: 'Strong Rental Yield',
      description: 'Monthly rent-to-value ratio above 0.9% — solid cash flow',
      color: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-400' },
    })
  }

  return tags
}

type Props = {
  signal: SignalLike
}

export default function DealScoreBreakdown({ signal }: Props) {
  const tags = buildTags(signal)
  const score = signal.opportunity_score ?? 0

  if (tags.length === 0) {
    return (
      <div className="text-xs text-gray-400 italic px-1">
        No strong score drivers detected for this property.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Score bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
          {tags.length} driver{tags.length !== 1 ? 's' : ''} detected
        </span>
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.label}
            title={tag.description}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-help ${tag.color.bg} ${tag.color.text} ${tag.color.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tag.color.dot}`} />
            {tag.label}
          </span>
        ))}
      </div>

      {/* Tag detail list */}
      <ul className="space-y-1.5 pt-1">
        {tags.map((tag) => (
          <li key={tag.label} className="flex items-start gap-2 text-xs text-gray-600">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${tag.color.dot}`} />
            <span>
              <span className="font-semibold">{tag.label}:</span>{' '}
              {tag.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
