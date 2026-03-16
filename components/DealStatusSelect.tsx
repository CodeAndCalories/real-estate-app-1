'use client'

import { useState, useEffect } from 'react'
import type { DealStatus } from '@/lib/hooks/useDealPipeline'
import { useDealPipeline } from '@/lib/hooks/useDealPipeline'

type Props = {
  signalId: string
  address: string
  city: string
  opportunityScore: number | null
  leadType: string
}

const OPTIONS: { value: DealStatus; label: string }[] = [
  { value: 'new',            label: 'New Lead' },
  { value: 'contacted',      label: 'Contacted' },
  { value: 'negotiating',    label: 'Negotiating' },
  { value: 'under_contract', label: 'Under Contract' },
  { value: 'closed',         label: 'Closed' },
]

const STATUS_COLORS: Record<DealStatus, string> = {
  new:            'bg-blue-100 text-blue-700 border-blue-300',
  contacted:      'bg-yellow-100 text-yellow-700 border-yellow-300',
  negotiating:    'bg-orange-100 text-orange-700 border-orange-300',
  under_contract: 'bg-purple-100 text-purple-700 border-purple-300',
  closed:         'bg-green-100 text-green-700 border-green-300',
}

export default function DealStatusSelect({ signalId, address, city, opportunityScore, leadType }: Props) {
  const { getStatus, setStatus } = useDealPipeline()
  const [current, setCurrent] = useState<DealStatus | null>(null)

  useEffect(() => {
    setCurrent(getStatus(signalId))
  }, [signalId, getStatus])

  const handleChange = (value: string) => {
    const status = value as DealStatus
    setCurrent(status)
    setStatus(signalId, status, { address, city, opportunity_score: opportunityScore, lead_type: leadType })
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Deal Status</h2>
      </div>
      <div className="px-4 py-4 flex items-center gap-3 flex-wrap">
        <select
          value={current ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">— Not tracking —</option>
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {current && (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[current]}`}>
            {OPTIONS.find((o) => o.value === current)?.label}
          </span>
        )}
      </div>
    </section>
  )
}
