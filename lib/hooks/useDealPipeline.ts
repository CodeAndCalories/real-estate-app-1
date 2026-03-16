'use client'

import { useState, useEffect, useCallback } from 'react'

export type DealStatus =
  | 'new'
  | 'contacted'
  | 'negotiating'
  | 'under_contract'
  | 'closed'

export type PipelineEntry = {
  status: DealStatus
  notes?: string
  updatedAt: number
  // Display data stored alongside status so the panel can render without fetching
  address: string
  city: string
  opportunity_score: number | null
  lead_type: string
}

export type Pipeline = Record<string, PipelineEntry>

const STORAGE_KEY = 'deal-pipeline'

function load(): Pipeline {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Pipeline) : {}
  } catch {
    return {}
  }
}

function persist(pipeline: Pipeline) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pipeline))
  } catch { /* ignore */ }
}

export function useDealPipeline() {
  const [pipeline, setPipeline] = useState<Pipeline>({})

  useEffect(() => {
    setPipeline(load())
  }, [])

  const setStatus = useCallback(
    (
      signalId: string,
      status: DealStatus,
      displayData: { address: string; city: string; opportunity_score: number | null; lead_type: string }
    ) => {
      setPipeline((prev) => {
        const updated: Pipeline = {
          ...prev,
          [signalId]: {
            ...(prev[signalId] ?? {}),
            status,
            updatedAt: Date.now(),
            address: displayData.address,
            city: displayData.city,
            opportunity_score: displayData.opportunity_score,
            lead_type: displayData.lead_type,
          },
        }
        persist(updated)
        return updated
      })
    },
    []
  )

  const getStatus = useCallback(
    (signalId: string): DealStatus | null => pipeline[signalId]?.status ?? null,
    [pipeline]
  )

  const byStatus = useCallback(
    (status: DealStatus): Array<{ signalId: string } & PipelineEntry> =>
      Object.entries(pipeline)
        .filter(([, e]) => e.status === status)
        .map(([signalId, entry]) => ({ signalId, ...entry }))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [pipeline]
  )

  const counts = {
    new: Object.values(pipeline).filter((e) => e.status === 'new').length,
    contacted: Object.values(pipeline).filter((e) => e.status === 'contacted').length,
    negotiating: Object.values(pipeline).filter((e) => e.status === 'negotiating').length,
    under_contract: Object.values(pipeline).filter((e) => e.status === 'under_contract').length,
    closed: Object.values(pipeline).filter((e) => e.status === 'closed').length,
  }

  return { pipeline, setStatus, getStatus, byStatus, counts }
}
