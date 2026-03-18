'use client'

import { Property } from '@/app/finder/page'
import { getScoreLabel, getLeadTags, LeadTag } from '@/lib/utils/scoreProperty'
import { explainSignal } from '@/lib/utils/explainSignal'
import { propertyKey } from '@/lib/hooks/useSavedLeads'
import { useThemeMode } from '@/lib/hooks/useThemeMode'
import { isInvestorPick, INVESTOR_PICK_LABEL } from '@/lib/utils/investorPick'
import { getDealVelocity, VELOCITY_STYLES } from '@/lib/utils/dealVelocity'

type Props = {
  data: Property[]
  onRowClick: (p: Property) => void
  onToggleSave: (p: Property) => void
  savedKeys: Set<string>
  onToggleFavorite?: (p: Property) => void
  favoriteKeys?: Set<string>
  onCompare?: (p: Property) => void
  compareKeys?: Set<string>
  isPro?: boolean
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

function getFreshnessDays(address: string): number {
  const hash = address.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return (hash % 7) + 1
}

function FreshnessBadge({ address }: { address: string }) {
  const days = getFreshnessDays(address)
  if (days <= 2) {
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
        New
      </span>
    )
  }
  if (days <= 5) {
    return (
      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-600 border border-blue-200 whitespace-nowrap">
        Updated
      </span>
    )
  }
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200 whitespace-nowrap">
      Recent
    </span>
  )
}

function ScoreBadge({ score, lines }: { score: number; lines: string[] }) {
  const label = getScoreLabel(score)
  const colorClass =
    score >= 80
      ? 'bg-green-100 text-green-800 border border-green-300'
      : score >= 60
      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
      : 'bg-red-100 text-red-700 border border-red-200'
  return (
    <div className="flex flex-col gap-0.5 relative group">
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold cursor-help ${colorClass}`}>
        {score}
      </span>
      <span className="text-[10px] text-gray-400 leading-tight">{label}</span>
      {/* Tooltip */}
      <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-50 pointer-events-none">
        <div className="bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-2 shadow-xl w-52 leading-snug">
          <span className="font-semibold block mb-1.5">Score: {score}</span>
          <ul className="space-y-1">
            {lines.map((line, i) => (
              <li key={i} className="flex gap-1.5 opacity-90">
                <span className="flex-shrink-0 mt-0.5">•</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2 h-2 bg-gray-900 rotate-45 ml-3 -mt-1" />
      </div>
    </div>
  )
}

export default function ResultsTable({ data, onRowClick, onToggleSave, savedKeys, onToggleFavorite, favoriteKeys, onCompare, compareKeys, isPro = false }: Props) {
  const { isDark } = useThemeMode()

  if (data.length === 0) {
    return (
      <div className={`text-center py-12 rounded-xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <p className={`text-base font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          No signals found
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Try adjusting your filters or explore another market.
        </p>
        {!isPro && (
          <p className={`text-sm mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Pro users unlock signals across all 20 markets.{' '}
            <a href="/upgrade" className="text-blue-400 hover:underline">
              Upgrade →
            </a>
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto rounded-xl border shadow-sm ${
      isDark ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <table className={`min-w-full text-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <thead>
          <tr className={`text-left text-xs font-semibold uppercase tracking-wide ${
            isDark
              ? 'bg-gray-700 text-gray-400'
              : 'bg-gray-50 text-gray-500'
          }`}>
            <th className="px-3 py-3 w-8" />
            {onToggleFavorite && <th className="px-2 py-3 w-8" />}
            <th className="px-4 py-3 whitespace-nowrap">Address</th>
            <th className="px-4 py-3 whitespace-nowrap">Freshness</th>
            <th className="px-4 py-3 whitespace-nowrap">Velocity</th>
            <th className="px-4 py-3 whitespace-nowrap">City</th>
            <th className="px-4 py-3 whitespace-nowrap">Lead Type</th>
            <th className="px-4 py-3 whitespace-nowrap">Score</th>
            <th className="px-4 py-3 whitespace-nowrap">Tags</th>
            <th className="px-4 py-3 whitespace-nowrap">Est. Equity</th>
            <th className="px-4 py-3 whitespace-nowrap">Rent %</th>
            <th className="px-4 py-3 whitespace-nowrap">Est. Value</th>
            {onCompare && <th className="px-3 py-3 w-16 whitespace-nowrap">Compare</th>}
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
          {data.map((p, i) => {
            const score     = p.opportunity_score ?? 0
            const tags      = getLeadTags(p)
            const saved     = savedKeys.has(propertyKey(p))
            const favorited = favoriteKeys?.has(propertyKey(p)) ?? false
            const pick      = isInvestorPick(p)
            const velocity  = getDealVelocity(p)
            const inCompare = compareKeys?.has(propertyKey(p)) ?? false

            const equity =
              p.estimated_value && p.loan_balance_estimate !== null
                ? p.estimated_value - p.loan_balance_estimate
                : null

            const rentRatio =
              p.rent_estimate && p.estimated_value
                ? ((p.rent_estimate / p.estimated_value) * 100).toFixed(2) + '%'
                : null

            return (
              <tr
                key={i}
                className={`cursor-pointer transition-colors ${
                  isDark
                    ? 'hover:bg-blue-900/20'
                    : 'hover:bg-blue-50'
                }`}
                onClick={() => onRowClick(p)}
              >
                {/* Save (★) */}
                <td
                  className="px-3 py-3 text-center"
                  onClick={(e) => { e.stopPropagation(); onToggleSave(p) }}
                >
                  <button
                    className={`text-base leading-none transition-colors ${
                      saved ? 'text-yellow-400 hover:text-yellow-500' : isDark ? 'text-gray-600 hover:text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                    }`}
                    aria-label={saved ? 'Unsave lead' : 'Save lead'}
                  >
                    {saved ? '★' : '☆'}
                  </button>
                </td>

                {/* Favorite (⭐) — only when wired up */}
                {onToggleFavorite && (
                  <td
                    className="px-2 py-3 text-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isPro) onToggleFavorite(p)
                    }}
                  >
                    {isPro ? (
                      <button
                        className={`text-sm leading-none transition-colors ${
                          favorited ? 'text-yellow-400' : isDark ? 'text-gray-600 hover:text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                        }`}
                        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favorited ? '⭐' : '☆'}
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Upgrade to save favorites"
                        className="text-sm leading-none text-gray-300 cursor-not-allowed opacity-40"
                        aria-label="Upgrade to save favorites"
                      >
                        ☆
                      </button>
                    )}
                  </td>
                )}

                {/* Address */}
                <td className={`px-4 py-3 whitespace-nowrap font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  <div className="flex flex-col gap-0.5">
                    <span>{p.address}</span>
                    {pick && (
                      <span className={`inline-block w-fit text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isDark ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-600'
                      }`}>
                        {INVESTOR_PICK_LABEL}
                      </span>
                    )}
                  </div>
                </td>

                {/* Freshness */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <FreshnessBadge address={p.address} />
                </td>

                {/* Velocity */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isDark ? VELOCITY_STYLES[velocity].dark : VELOCITY_STYLES[velocity].light
                  }`}>
                    {velocity}
                  </span>
                </td>

                {/* City */}
                <td className={`px-4 py-3 whitespace-nowrap text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {p.city}, {p.zip}
                </td>

                {/* Lead Type */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      p.lead_type === 'Pre-Foreclosure'
                        ? 'bg-red-100 text-red-700'
                        : p.lead_type === 'Expired Listing'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {p.lead_type}
                  </span>
                </td>

                {/* Score with tooltip */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <ScoreBadge score={score} lines={explainSignal(p)} />
                </td>

                {/* Tags */}
                <td className="px-4 py-3">
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 min-w-[140px]">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold leading-tight ${TAG_STYLES[tag]}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>—</span>
                  )}
                </td>

                {/* Est. Equity */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {equity !== null ? (
                    <span className={`font-medium ${equity > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {fmt(equity, '$')}
                    </span>
                  ) : (
                    <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>—</span>
                  )}
                </td>

                {/* Rent % */}
                <td className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {rentRatio ?? <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>—</span>}
                </td>

                {/* Est. Value */}
                <td className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {fmt(p.estimated_value, '$')}
                </td>

                {/* Compare */}
                {onCompare && (
                  <td
                    className="px-3 py-3 text-center"
                    onClick={(e) => { e.stopPropagation(); onCompare(p) }}
                  >
                    <button
                      title={inCompare ? 'Remove from comparison' : 'Add to comparison'}
                      className={`text-xs font-semibold px-2 py-1 rounded border transition-colors ${
                        inCompare
                          ? isDark
                            ? 'bg-blue-900/40 border-blue-600 text-blue-400'
                            : 'bg-blue-100 border-blue-400 text-blue-700'
                          : isDark
                          ? 'bg-gray-700 border-gray-600 text-gray-400 hover:border-blue-600 hover:text-blue-400'
                          : 'bg-white border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600'
                      }`}
                    >
                      {inCompare ? '✓' : '⚖'}
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
