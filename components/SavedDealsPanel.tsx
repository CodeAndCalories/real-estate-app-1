'use client'

import Link from 'next/link'
import { useSavedDeals } from '@/lib/hooks/useSavedDeals'

type Props = {
  isDark: boolean
}

function scoreColor(score: number | null, isDark: boolean): string {
  const s = score ?? 0
  if (s >= 80)
    return isDark ? 'text-green-400 bg-green-900/30 border-green-700' : 'text-green-700 bg-green-50 border-green-200'
  if (s >= 60)
    return isDark ? 'text-yellow-400 bg-yellow-900/30 border-yellow-700' : 'text-yellow-700 bg-yellow-50 border-yellow-200'
  return isDark ? 'text-gray-400 bg-gray-700 border-gray-600' : 'text-gray-600 bg-gray-50 border-gray-200'
}

function leadTypeColor(type: string, isDark: boolean): string {
  if (type === 'Pre-Foreclosure')
    return isDark ? 'bg-red-900/40 text-red-400 border-red-700' : 'bg-red-50 text-red-700 border-red-200'
  if (type === 'Expired Listing')
    return isDark ? 'bg-yellow-900/40 text-yellow-400 border-yellow-700' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
  return isDark ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

export default function SavedDealsPanel({ isDark }: Props) {
  const { deals, removeDeal } = useSavedDeals()

  const card = isDark
    ? 'bg-gray-800 border border-gray-700 rounded-xl shadow-sm'
    : 'bg-white border border-gray-200 rounded-xl shadow-sm'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500'
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400'
  const rowHover = isDark ? 'hover:bg-gray-750/60' : 'hover:bg-gray-50'
  const divider = isDark ? 'border-gray-700' : 'border-gray-100'

  if (deals.length === 0) return null

  return (
    <div className={`${card} mb-6`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span className="text-base">⭐</span>
          <h2 className={`text-sm font-bold uppercase tracking-wide ${textPrimary}`}>
            Saved Deals
          </h2>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-yellow-500 text-white`}>
            {deals.length}
          </span>
        </div>
        <span className={`text-xs ${textMuted}`}>Stored locally in your browser</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px]">
          <thead>
            <tr className={`border-b ${divider}`}>
              {['Address', 'City', 'Score', 'Lead Type', ''].map((h) => (
                <th
                  key={h}
                  className={`text-left text-xs font-semibold uppercase tracking-wide px-4 py-2.5 ${textMuted}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr
                key={deal.id}
                className={`border-b last:border-0 transition-colors ${divider} ${rowHover}`}
              >
                {/* Address */}
                <td className="px-4 py-3">
                  <Link
                    href={`/property/${encodeURIComponent(deal.id)}`}
                    className={`text-sm font-semibold hover:text-blue-500 transition-colors truncate max-w-[180px] block ${textPrimary}`}
                  >
                    {deal.address}
                  </Link>
                </td>

                {/* City */}
                <td className={`px-4 py-3 text-sm ${textSecondary}`}>
                  {deal.city}
                </td>

                {/* Score */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center justify-center w-9 h-7 rounded-lg border text-xs font-black ${scoreColor(deal.opportunity_score, isDark)}`}
                  >
                    {deal.opportunity_score ?? '—'}
                  </span>
                </td>

                {/* Lead Type */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${leadTypeColor(deal.lead_type, isDark)}`}
                  >
                    {deal.lead_type}
                  </span>
                </td>

                {/* Remove */}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => removeDeal(deal.id)}
                    title="Remove from saved deals"
                    className={`text-xs font-medium transition-colors ${textMuted} hover:text-red-500`}
                  >
                    ✕ Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
