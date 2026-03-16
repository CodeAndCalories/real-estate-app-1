'use client'

import { useMemo } from 'react'
import propertiesData from '@/lib/data/properties.json'
import { Property } from '@/app/finder/page'
import type { RawProperty } from '@/lib/types/property'
import { scoreAndEnrich } from '@/lib/utils/scoreProperty'

type Props = {
  onRowClick: (p: Property) => void
}

export default function TopLeads({ onRowClick }: Props) {
  const topLeads = useMemo(() => {
    return (propertiesData as unknown as RawProperty[] as unknown as Property[])
      .map(scoreAndEnrich)
      .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0))
      .slice(0, 8)
  }, [])

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Top Opportunities Today</h2>
        <span className="text-xs text-gray-400 font-medium">Highest scored leads across all markets</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 pr-4">
                Address
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 pr-4">
                City
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 pr-4">
                Lead Type
              </th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {topLeads.map((p) => {
              const score = p.opportunity_score ?? 0
              const scoreColor =
                score >= 80
                  ? 'bg-green-100 text-green-800'
                  : score >= 60
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-700'
              const leadTypeBadge =
                p.lead_type === 'Pre-Foreclosure'
                  ? 'text-red-600'
                  : p.lead_type === 'Expired Listing'
                  ? 'text-yellow-600'
                  : 'text-green-600'

              return (
                <tr
                  key={`${p.address}||${p.city}`}
                  onClick={() => onRowClick(p)}
                  className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer"
                >
                  <td className="py-2.5 pr-4 font-medium text-gray-900">{p.address}</td>
                  <td className="py-2.5 pr-4 text-gray-600">{p.city}</td>
                  <td className={`py-2.5 pr-4 text-xs font-medium ${leadTypeBadge}`}>{p.lead_type}</td>
                  <td className="py-2.5 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${scoreColor}`}>
                      {score}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
