'use client'

import type { Signal } from '@/lib/data/getSignals'
import type { Property } from '@/app/finder/page'

type Props = {
  isDark: boolean
  favorites: Signal[]
  onRemove: (s: Signal) => void
  onRowClick: (p: Property) => void
}

export default function FavoritesPanel({ isDark, favorites, onRemove, onRowClick }: Props) {
  const card    = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const divider = isDark ? 'border-gray-700'              : 'border-gray-100'

  const leadColor = (type: string) =>
    type === 'Pre-Foreclosure'
      ? isDark ? 'text-red-400'    : 'text-red-600'
      : type === 'Expired Listing'
      ? isDark ? 'text-yellow-400' : 'text-yellow-600'
      : isDark ? 'text-green-400'  : 'text-green-600'

  const scoreBg = (score: number) =>
    score >= 80 ? 'bg-green-500 text-white' :
    score >= 60 ? 'bg-yellow-400 text-yellow-900' :
    isDark      ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-700'

  if (favorites.length === 0) {
    return (
      <div className={`rounded-xl border px-5 py-8 text-center mb-5 ${card}`}>
        <div className="text-2xl mb-2">⭐</div>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          No favorites yet.
        </p>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          Click ⭐ on any signal row to add it to your shortlist.
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border mb-5 overflow-hidden ${card}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span>⭐</span>
          <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Investor Shortlist
          </h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {favorites.length}
          </span>
        </div>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Your saved opportunities
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b text-xs font-semibold uppercase tracking-wide ${
              isDark ? 'border-gray-700 text-gray-500' : 'border-gray-100 text-gray-400'
            }`}>
              <th className="text-left px-5 py-2.5">Address</th>
              <th className="text-left px-3 py-2.5">City</th>
              <th className="text-left px-3 py-2.5">Lead Type</th>
              <th className="text-center px-3 py-2.5">Score</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {favorites.map((s) => (
              <tr
                key={`${s.address}||${s.city}`}
                onClick={() => onRowClick(s as unknown as Property)}
                className={`border-b last:border-0 cursor-pointer transition-colors ${
                  isDark
                    ? 'border-gray-700/50 hover:bg-yellow-900/10'
                    : 'border-gray-50 hover:bg-yellow-50/60'
                }`}
              >
                <td className={`px-5 py-3 font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {s.address}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {s.city}
                </td>
                <td className={`px-3 py-3 whitespace-nowrap text-xs font-semibold ${leadColor(s.lead_type)}`}>
                  {s.lead_type}
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${scoreBg(s.opportunity_score ?? 0)}`}>
                    {s.opportunity_score ?? 0}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(s) }}
                    title="Remove from shortlist"
                    className={`text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
                      isDark
                        ? 'border-gray-600 text-gray-500 hover:border-red-700 hover:text-red-400'
                        : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'
                    }`}
                  >
                    ✕
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
