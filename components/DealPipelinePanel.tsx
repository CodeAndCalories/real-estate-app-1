'use client'

import { useDealPipeline, DealStatus } from '@/lib/hooks/useDealPipeline'
import type { Property } from '@/app/finder/page'

type Props = {
  isDark: boolean
  onRowClick: (p: Property) => void
}

const STAGES: { key: DealStatus; label: string; color: string; darkColor: string }[] = [
  { key: 'new',            label: 'New Leads',      color: 'bg-blue-100 border-blue-200 text-blue-700',   darkColor: 'bg-blue-900/30 border-blue-700 text-blue-400' },
  { key: 'contacted',      label: 'Contacted',       color: 'bg-yellow-100 border-yellow-200 text-yellow-700', darkColor: 'bg-yellow-900/30 border-yellow-700 text-yellow-400' },
  { key: 'negotiating',    label: 'Negotiating',     color: 'bg-orange-100 border-orange-200 text-orange-700', darkColor: 'bg-orange-900/30 border-orange-700 text-orange-400' },
  { key: 'under_contract', label: 'Under Contract',  color: 'bg-purple-100 border-purple-200 text-purple-700', darkColor: 'bg-purple-900/30 border-purple-700 text-purple-400' },
  { key: 'closed',         label: 'Closed',          color: 'bg-green-100 border-green-200 text-green-700', darkColor: 'bg-green-900/30 border-green-700 text-green-400' },
]

function scoreBg(score: number, isDark: boolean): string {
  if (score >= 80) return 'bg-green-500 text-white'
  if (score >= 60) return 'bg-yellow-400 text-yellow-900'
  return isDark ? 'bg-gray-600 text-gray-100' : 'bg-gray-200 text-gray-700'
}

export default function DealPipelinePanel({ isDark, onRowClick }: Props) {
  const { byStatus, counts } = useDealPipeline()

  const totalDeals = Object.values(counts).reduce((a, b) => a + b, 0)
  if (totalDeals === 0) return null

  const card = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const divider = isDark ? 'border-gray-700' : 'border-gray-100'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`rounded-xl border mb-5 overflow-hidden ${card}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span>📋</span>
          <h2 className={`text-sm font-bold ${textPrimary}`}>Deal Pipeline</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
          }`}>
            {totalDeals} deal{totalDeals !== 1 ? 's' : ''}
          </span>
        </div>
        <span className={`text-xs ${textMuted}`}>Track your deals across stages</span>
      </div>

      {/* Stages */}
      <div className="px-5 py-4 space-y-5">
        {STAGES.map((stage) => {
          const entries = byStatus(stage.key)
          if (entries.length === 0) return null
          return (
            <div key={stage.key}>
              {/* Stage header */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isDark ? stage.darkColor : stage.color
                }`}>
                  {stage.label}
                </span>
                <span className={`text-xs ${textMuted}`}>{entries.length}</span>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {entries.map((entry) => (
                  <button
                    key={entry.signalId}
                    onClick={() => onRowClick(entry as unknown as Property)}
                    className={`text-left rounded-lg border p-3 transition-colors ${
                      isDark
                        ? 'bg-gray-750 border-gray-600 hover:bg-gray-700 hover:border-gray-500'
                        : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                    }`}
                  >
                    <p className={`text-sm font-semibold leading-snug mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {entry.address}
                    </p>
                    <p className={`text-xs mb-2 ${textMuted}`}>{entry.city}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        scoreBg(entry.opportunity_score ?? 0, isDark)
                      }`}>
                        {entry.opportunity_score ?? 0}
                      </span>
                      <span className={`text-[10px] font-medium ${
                        entry.lead_type === 'Pre-Foreclosure'
                          ? isDark ? 'text-red-400' : 'text-red-600'
                          : entry.lead_type === 'Expired Listing'
                          ? isDark ? 'text-yellow-400' : 'text-yellow-600'
                          : isDark ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {entry.lead_type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
