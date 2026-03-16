'use client'

import { useDealPipeline } from '@/lib/hooks/useDealPipeline'

type Props = {
  isDark: boolean
}

type Stage = {
  key: 'new' | 'contacted' | 'negotiating' | 'under_contract' | 'closed'
  label: string
  icon: string
  valueColor: string
  lightBg: string
  darkBg: string
}

const STAGES: Stage[] = [
  { key: 'new',            label: 'New Leads',     icon: '🆕', valueColor: 'text-blue-500',   lightBg: 'bg-blue-50 border-blue-200',     darkBg: 'bg-blue-900/30 border-blue-700' },
  { key: 'contacted',      label: 'Contacted',      icon: '📞', valueColor: 'text-yellow-500', lightBg: 'bg-yellow-50 border-yellow-200', darkBg: 'bg-yellow-900/30 border-yellow-700' },
  { key: 'negotiating',    label: 'Negotiating',    icon: '🤝', valueColor: 'text-orange-500', lightBg: 'bg-orange-50 border-orange-200', darkBg: 'bg-orange-900/30 border-orange-700' },
  { key: 'under_contract', label: 'Under Contract', icon: '📝', valueColor: 'text-purple-500', lightBg: 'bg-purple-50 border-purple-200', darkBg: 'bg-purple-900/30 border-purple-700' },
  { key: 'closed',         label: 'Closed',         icon: '✅', valueColor: 'text-green-500',  lightBg: 'bg-green-50 border-green-200',   darkBg: 'bg-green-900/30 border-green-700' },
]

export default function PipelineSummary({ isDark }: Props) {
  const { counts } = useDealPipeline()
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
      {STAGES.map((stage) => (
        <div
          key={stage.key}
          className={`rounded-xl border px-4 py-3 text-center ${isDark ? stage.darkBg : stage.lightBg}`}
        >
          <div className="text-lg mb-0.5">{stage.icon}</div>
          <div className={`text-2xl font-black leading-none ${stage.valueColor}`}>
            {counts[stage.key]}
          </div>
          <div className={`text-xs mt-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {stage.label}
          </div>
        </div>
      ))}
    </div>
  )
}
