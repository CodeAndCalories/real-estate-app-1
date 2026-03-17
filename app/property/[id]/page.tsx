import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSignals } from '@/lib/data/getSignals'
import type { Signal } from '@/lib/data/getSignals'
import propertiesJson from '@/lib/data/properties.json'
import type { RawProperty } from '@/lib/types/property'
import InvestorNotes from '@/components/InvestorNotes'
import DealReportButton from '@/components/DealReportButton'
import DealStatusSelect from '@/components/DealStatusSelect'
import OwnerContactCard from '@/components/OwnerContactCard'
import DealScoreBreakdown from '@/components/DealScoreBreakdown'
import DealScoreExplanation from '@/components/DealScoreExplanation'
import InvestorQuickActions from '@/components/InvestorQuickActions'
import SaveDealButton from '@/components/SaveDealButton'

// [id] = encodeURIComponent(signal.address)

function fmt(v: number | null | undefined, prefix = ''): string {
  if (v == null) return '—'
  return prefix + v.toLocaleString()
}

// ── Inline explanation (avoids importing from a 'use client' module) ─────────
function explainProperty(p: Signal): string[] {
  const highEquity =
    p.loan_balance_estimate != null &&
    p.estimated_value > 0 &&
    p.loan_balance_estimate < p.estimated_value * 0.6

  const priceDrop = (p.price_drop_percent ?? 0) > 10
  const distressed = (p.days_in_default ?? 0) > 60
  const longDOM = (p.days_on_market ?? 0) > 90
  const rental =
    p.rent_estimate != null &&
    p.estimated_value > 0 &&
    p.rent_estimate >= p.estimated_value * 0.01

  const lines: string[] = []

  if (highEquity && longDOM) {
    lines.push('High equity combined with extended listing time — strong negotiation leverage.')
  } else if (highEquity) {
    lines.push('Loan balance well below market value — significant equity captured.')
  }

  if (priceDrop) lines.push('Recent price reduction signals a motivated seller.')
  if (distressed) lines.push('Owner in default — distressed sale potential.')
  if (longDOM && !highEquity) lines.push('Extended days on market — seller may accept below ask.')
  if (rental) lines.push('Strong monthly rent relative to property value.')

  return lines.length > 0 ? lines : ['No strong signals detected for this property.']
}

// ── SVG price history spark chart ─────────────────────────────────────────────
function PriceHistoryChart({ history }: { history: number[] }) {
  if (history.length < 2) {
    return <p className="text-sm text-gray-400 italic">Only one price recorded — no history to chart.</p>
  }

  const W = 440
  const H = 100
  const pad = { top: 12, right: 16, bottom: 28, left: 60 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1

  const toX = (i: number) => pad.left + (i / (history.length - 1)) * innerW
  const toY = (v: number) => pad.top + innerH - ((v - min) / range) * innerH

  const points = history.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

  // gradient fill path
  const fillPath =
    `M${toX(0)},${toY(history[0])} ` +
    history.slice(1).map((v, i) => `L${toX(i + 1)},${toY(v)}`).join(' ') +
    ` L${toX(history.length - 1)},${pad.top + innerH} L${toX(0)},${pad.top + innerH} Z`

  const isUp = history[history.length - 1] >= history[0]
  const stroke = isUp ? '#22c55e' : '#ef4444'
  const fillColor = isUp ? '#dcfce7' : '#fee2e2'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 110 }}>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Fill */}
      <path d={fillPath} fill="url(#chartFill)" />

      {/* Line */}
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Data points */}
      {history.map((v, i) => (
        <circle key={i} cx={toX(i)} cy={toY(v)} r={3.5} fill={stroke} stroke="white" strokeWidth="1.5" />
      ))}

      {/* Y axis labels */}
      <text x={pad.left - 6} y={pad.top + 4} textAnchor="end" fontSize="8" fill="#9ca3af">
        ${(max / 1000).toFixed(0)}k
      </text>
      <text x={pad.left - 6} y={pad.top + innerH} textAnchor="end" fontSize="8" fill="#9ca3af">
        ${(min / 1000).toFixed(0)}k
      </text>

      {/* X axis labels */}
      {history.map((_, i) => (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="#9ca3af">
          #{i + 1}
        </text>
      ))}
    </svg>
  )
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const label =
    score >= 80 ? 'Hot Lead' :
    score >= 60 ? 'Strong Opportunity' :
    score >= 40 ? 'Moderate' : 'Low Priority'

  const cls =
    score >= 80 ? 'bg-green-100 text-green-800 border-green-200' :
    score >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
    'bg-gray-100 text-gray-700 border-gray-200'

  return (
    <div className={`inline-flex flex-col items-center rounded-xl border px-5 py-3 ${cls}`}>
      <span className="text-3xl font-black leading-none">{score}</span>
      <span className="text-xs font-semibold mt-1 opacity-80">{label}</span>
    </div>
  )
}

// ── Lead type badge ───────────────────────────────────────────────────────────
function LeadBadge({ type }: { type: string }) {
  const cls =
    type === 'Pre-Foreclosure'
      ? 'bg-red-100 text-red-700 border-red-200'
      : type === 'Expired Listing'
      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200'

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>
      {type}
    </span>
  )
}

// ── Row helper ────────────────────────────────────────────────────────────────
function Row({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'red' }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 odd:bg-gray-50 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${
        accent === 'green' ? 'text-green-600' :
        accent === 'red'   ? 'text-red-500' :
        'text-gray-800'
      }`}>
        {value}
      </span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const decoded = decodeURIComponent(id)

  // Load signal data — look up by stable hash id first, then fall back to address
  const { signals } = getSignals({ limit: 9999 })
  const signal = signals.find((s) => s.id === decoded) ?? signals.find((s) => s.address === decoded)
  if (!signal) notFound()

  const address = signal.address

  const s = signal

  // Load raw property for price_history
  const raw = (propertiesJson as unknown as RawProperty[]).find(
    (p) => p.address === address
  )
  const priceHistory: number[] = raw?.price_history ?? []

  // Derived values
  const equity =
    s.estimated_value > 0 && s.loan_balance_estimate != null
      ? s.estimated_value - s.loan_balance_estimate
      : null

  const rentPct =
    s.rent_estimate != null && s.estimated_value > 0
      ? ((s.rent_estimate / s.estimated_value) * 100).toFixed(2) + '%'
      : null

  const explanations = explainProperty(s)
  const score = s.opportunity_score ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/finder" className="hover:text-blue-600 transition-colors">
            ← Signal Finder
          </Link>
          <span>/</span>
          <span className="text-gray-600 truncate">{s.address}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{s.address}</h1>
            <p className="text-gray-500 mt-1">{s.city}, {s.zip}</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <ScoreBadge score={score} />
            <LeadBadge type={s.lead_type} />
          </div>
        </div>

        {/* Deal Score Explanation — why this scored high */}
        <DealScoreExplanation signal={s} />

        {/* Save Deal button */}
        <div className="mb-6">
          <SaveDealButton
            id={s.id}
            address={s.address}
            city={s.city}
            opportunity_score={s.opportunity_score}
            lead_type={s.lead_type}
          />
        </div>

        {/* Key metrics */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Property Details</h2>
          </div>
          <Row label="Estimated Value"    value={fmt(s.estimated_value, '$')} />
          <Row
            label="Estimated Equity"
            value={equity != null ? fmt(equity, '$') : '—'}
            accent={equity != null ? (equity > 0 ? 'green' : 'red') : undefined}
          />
          <Row label="Loan Balance"       value={fmt(s.loan_balance_estimate, '$')} />
          <Row label="Rent Estimate"      value={s.rent_estimate != null ? `${fmt(s.rent_estimate, '$')}/mo` : '—'} />
          <Row
            label="Rent Yield"
            value={rentPct ?? '—'}
            accent={rentPct ? 'green' : undefined}
          />
          <Row label="Days on Market"     value={s.days_on_market != null ? `${s.days_on_market} days` : '—'} />
          <Row label="Days in Default"    value={s.days_in_default != null ? `${s.days_in_default} days` : '—'} />
          <Row label="Price Drop"         value={s.price_drop_percent != null ? `${s.price_drop_percent}%` : '—'} />
          <Row label="Price / sqft"       value={fmt(s.price_per_sqft, '$')} />
          <Row label="Market Avg / sqft"  value={fmt(s.market_avg_price_per_sqft, '$')} />
          <Row label="City"               value={s.city} />
          <Row label="ZIP"                value={s.zip} />
          <Row label="Lead Type"          value={s.lead_type} />
        </section>

        {/* Why This Is an Opportunity */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-3">
            Why This Is an Opportunity
          </h2>
          <ul className="space-y-2 mb-4">
            {explanations.map((line, i) => (
              <li key={i} className="flex gap-2 text-sm text-blue-800">
                <span className="flex-shrink-0 text-blue-400 mt-0.5">•</span>
                {line}
              </li>
            ))}
          </ul>
          {/* Score breakdown tags */}
          <div className="pt-3 border-t border-blue-200">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Score Drivers</p>
            <DealScoreBreakdown signal={s} />
          </div>
        </section>

        {/* Price History Chart */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Price History</h2>
            {priceHistory.length >= 2 && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                priceHistory[priceHistory.length - 1] <= priceHistory[0]
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              }`}>
                {priceHistory[priceHistory.length - 1] <= priceHistory[0] ? '▼' : '▲'}{' '}
                {Math.abs(Math.round(
                  ((priceHistory[priceHistory.length - 1] - priceHistory[0]) / priceHistory[0]) * 100
                ))}%
              </span>
            )}
          </div>
          <div className="px-4 py-4">
            <PriceHistoryChart history={priceHistory} />
            {priceHistory.length >= 1 && (
              <div className="flex flex-wrap gap-4 mt-3">
                {priceHistory.map((price, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xs text-gray-400 mb-0.5">Entry #{i + 1}</div>
                    <div className={`text-sm font-bold ${
                      i === priceHistory.length - 1 ? 'text-gray-900' : 'text-gray-400 line-through'
                    }`}>
                      ${price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Owner Contact Card */}
        <OwnerContactCard ownerName={s.owner_name} />

        {/* Investor Quick Actions */}
        <InvestorQuickActions signal={s} priceHistory={priceHistory} />

        {/* Deal Status */}
        <DealStatusSelect
          signalId={s.id}
          address={s.address}
          city={s.city}
          opportunityScore={s.opportunity_score}
          leadType={s.lead_type}
        />

        {/* Investor Notes */}
        <InvestorNotes signalId={s.id} />

        {/* Deal Report Export */}
        <div className="mb-6 flex items-center gap-3">
          <DealReportButton signal={s} priceHistory={priceHistory} />
        </div>

        {/* Footer nav */}
        <div className="text-center">
          <Link
            href="/finder"
            className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
          >
            ← Back to Signal Finder
          </Link>
        </div>

      </div>
    </div>
  )
}
