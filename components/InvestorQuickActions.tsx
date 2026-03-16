'use client'

import { useState, useEffect } from 'react'
import { useSavedLeads, propertyKey } from '@/lib/hooks/useSavedLeads'
import { useDealPipeline } from '@/lib/hooks/useDealPipeline'
import { generateDealReport } from '@/lib/utils/generateDealReport'
import type { Signal } from '@/lib/data/getSignals'
import type { Property } from '@/app/finder/page'

type Props = {
  signal: Signal
  priceHistory?: number[]
}

export default function InvestorQuickActions({ signal, priceHistory = [] }: Props) {
  const { savedKeys, toggleSave } = useSavedLeads()
  const { getStatus, setStatus, counts } = useDealPipeline()
  const [inPipeline, setInPipeline] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pipelineAdded, setPipelineAdded] = useState(false)

  const asProperty = signal as unknown as Property
  const key = propertyKey(asProperty)

  useEffect(() => {
    setSaved(savedKeys.has(key))
  }, [savedKeys, key])

  useEffect(() => {
    const status = getStatus(signal.id)
    setInPipeline(status !== null)
  }, [signal.id, getStatus, counts])

  const handleSave = () => {
    toggleSave(asProperty)
  }

  const handleAddToPipeline = () => {
    if (inPipeline) return
    setStatus(signal.id, 'new', {
      address: signal.address,
      city: signal.city,
      opportunity_score: signal.opportunity_score,
      lead_type: signal.lead_type,
    })
    setInPipeline(true)
    setPipelineAdded(true)
    setTimeout(() => setPipelineAdded(false), 2500)
  }

  const handleCompare = () => {
    window.location.href = '/finder'
  }

  const actions = [
    {
      id: 'save',
      icon: saved ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      label: saved ? 'Saved' : 'Save Lead',
      onClick: handleSave,
      active: saved,
      activeClass: 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100',
      inactiveClass: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
    },
    {
      id: 'pipeline',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: pipelineAdded ? '✓ Added!' : inPipeline ? 'In Pipeline' : 'Add to Pipeline',
      onClick: handleAddToPipeline,
      active: inPipeline,
      activeClass: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100',
      inactiveClass: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
    },
    {
      id: 'compare',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      label: 'Compare Deal',
      onClick: handleCompare,
      active: false,
      activeClass: '',
      inactiveClass: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
    },
    {
      id: 'report',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: 'Deal Report',
      onClick: () => generateDealReport(signal, priceHistory),
      active: false,
      activeClass: '',
      inactiveClass: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
    },
  ]

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Quick Actions</h2>
      </div>
      <div className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                action.active ? action.activeClass : action.inactiveClass
              }`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Saved leads and pipeline status are stored in your browser.
        </p>
      </div>
    </section>
  )
}
