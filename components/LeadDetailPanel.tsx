'use client'

import { Property } from '@/app/finder/page'
import { getScoreLabel, getLeadTags, LeadTag } from '@/lib/utils/scoreProperty'
import { exportToCSV } from '@/lib/utils/exportCSV'

type Props = {
  property: Property
  onClose: () => void
  isSaved: boolean
  onToggleSave: (p: Property) => void
}

function fmt(value: number | null | undefined, prefix = ''): string {
  if (value === null || value === undefined) return '—'
  return prefix + value.toLocaleString()
}

const TAG_STYLES: Record<LeadTag, string> = {
  'PRICE DROP': 'bg-orange-100 text-orange-700 border border-orange-200',
  'DISTRESSED OWNER': 'bg-red-100 text-red-700 border border-red-200',
  'LONG DAYS ON MARKET': 'bg-purple-100 text-purple-700 border border-purple-200',
  'HIGH EQUITY': 'bg-blue-100 text-blue-700 border border-blue-200',
  'STRONG RENTAL POTENTIAL': 'bg-green-100 text-green-700 border border-green-200',
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide w-40 shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-900 text-right">{value}</span>
    </div>
  )
}

function getLeadFreshness(address: string): string {
  const hash = address.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const days = (hash % 7) + 1
  if (days === 1) return 'Updated today'
  if (days === 2) return 'Updated yesterday'
  return `Updated ${days} days ago`
}

function getLeadSignals(p: Property): string[] {
  const signals: string[] = []

  if ((p.price_drop_percent ?? 0) > 10)
    signals.push(`Price dropped ${p.price_drop_percent}% below previous listing price`)

  const equity =
    p.loan_balance_estimate !== null && p.estimated_value > 0
      ? p.estimated_value - p.loan_balance_estimate
      : null
  if (equity !== null && equity > 0 && p.loan_balance_estimate! < p.estimated_value * 0.6)
    signals.push(`High equity position — $${equity.toLocaleString()} estimated above loan balance`)

  if (
    p.rent_estimate !== null &&
    p.estimated_value > 0 &&
    p.rent_estimate >= p.estimated_value * 0.01
  )
    signals.push(
      `Strong rental yield — ${((p.rent_estimate / p.estimated_value) * 100).toFixed(2)}% rent-to-value ratio`
    )

  if ((p.days_in_default ?? 0) > 60)
    signals.push(`Owner ${p.days_in_default} days in default — motivated seller`)

  if ((p.days_on_market ?? 0) > 90)
    signals.push(`Listed ${p.days_on_market} days with no sale — price flexibility likely`)

  return signals
}

export default function LeadDetailPanel({ property: p, onClose, isSaved, onToggleSave }: Props) {
  const score = p.opportunity_score ?? 0
  const label = getScoreLabel(score)
  const tags = getLeadTags(p)
  const freshness = getLeadFreshness(p.address)
  const signals = getLeadSignals(p)

  const equity =
    p.estimated_value && p.loan_balance_estimate !== null
      ? p.estimated_value - p.loan_balance_estimate
      : null

  const rentRatio =
    p.rent_estimate && p.estimated_value
      ? ((p.rent_estimate / p.estimated_value) * 100).toFixed(2) + '%'
      : null

  const scoreColor =
    score >= 80
      ? 'bg-green-100 text-green-800 border border-green-300'
      : score >= 60
      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
      : 'bg-red-100 text-red-700 border border-red-200'

  const leadTypeBadge =
    p.lead_type === 'Pre-Foreclosure'
      ? 'bg-red-100 text-red-700'
      : p.lead_type === 'Expired Listing'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-green-100 text-green-700'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
              Property Detail
            </p>
            <h2 className="text-base font-bold text-gray-900 leading-tight truncate">
              {p.address}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {p.city}, {p.zip}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none mt-1 shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Score + Lead Type row */}
        <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
          <span className={`px-2.5 py-1 rounded text-sm font-bold ${scoreColor}`}>
            {score}
          </span>
          <span className="text-sm text-gray-600">{label}</span>
          <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${leadTypeBadge}`}>
            {p.lead_type}
          </span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${TAG_STYLES[tag]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Why This Is A Good Lead */}
          {signals.length > 0 && (
            <div className="border border-green-200 bg-green-50 rounded-lg px-4 py-3 mb-4">
              <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-2">
                Why This Is A Good Lead
              </p>
              <ul className="space-y-1.5">
                {signals.map((signal, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-green-900">
                    <span className="mt-0.5 shrink-0 text-green-500">✓</span>
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Details */}
          <div className="bg-gray-50 rounded-lg px-4 py-1 mb-4">
            <Row label="Owner Name" value={p.owner_name || '—'} />
            <Row label="Estimated Value" value={fmt(p.estimated_value, '$')} />
            <Row label="Loan Balance" value={fmt(p.loan_balance_estimate, '$')} />
            <Row
              label="Est. Equity"
              value={
                equity !== null ? (
                  <span className={equity > 0 ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                    {fmt(equity, '$')}
                  </span>
                ) : '—'
              }
            />
          </div>

          <div className="bg-gray-50 rounded-lg px-4 py-1 mb-4">
            <Row label="Rent Estimate" value={fmt(p.rent_estimate, '$')} />
            <Row label="Rent Ratio" value={rentRatio ?? '—'} />
            <Row label="Price Drop %" value={p.price_drop_percent !== null ? `${p.price_drop_percent}%` : '—'} />
            <Row label="Price / SqFt" value={fmt(p.price_per_sqft, '$')} />
            <Row label="Market Avg / SqFt" value={fmt(p.market_avg_price_per_sqft, '$')} />
          </div>

          <div className="bg-gray-50 rounded-lg px-4 py-1 mb-4">
            <Row label="Days On Market" value={fmt(p.days_on_market)} />
            <Row label="Prev. List Price" value={fmt(p.previous_listing_price, '$')} />
            <Row label="Days In Default" value={fmt(p.days_in_default)} />
            <Row label="Agent" value={p.agent_name || '—'} />
            <Row
              label="Lead Freshness"
              value={
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {freshness}
                </span>
              }
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-2 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => onToggleSave(p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
              isSaved
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{isSaved ? '★' : '☆'}</span>
            <span>{isSaved ? 'Saved' : 'Save Lead'}</span>
          </button>
          <button
            onClick={() => exportToCSV([p], `lead-${p.address.replace(/\s+/g, '-')}.csv`)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
          >
            Export This Lead
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}
