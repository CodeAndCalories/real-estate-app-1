'use client'

import { useState, useEffect, useCallback } from 'react'

export type SavedDeal = {
  id: string
  address: string
  city: string
  opportunity_score: number | null
  lead_type: string
  savedAt: string
}

const LS_KEY = 'saved-deals'

function readFromStorage(): SavedDeal[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as SavedDeal[]) : []
  } catch {
    return []
  }
}

function writeToStorage(deals: SavedDeal[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(deals))
  } catch { /* ignore */ }
}

export function useSavedDeals() {
  const [deals, setDeals] = useState<SavedDeal[]>([])

  useEffect(() => {
    setDeals(readFromStorage())
  }, [])

  const saveDeal = useCallback((deal: Omit<SavedDeal, 'savedAt'>) => {
    setDeals((prev) => {
      if (prev.some((d) => d.id === deal.id)) return prev
      const next = [{ ...deal, savedAt: new Date().toISOString() }, ...prev]
      writeToStorage(next)
      return next
    })
  }, [])

  const removeDeal = useCallback((id: string) => {
    setDeals((prev) => {
      const next = prev.filter((d) => d.id !== id)
      writeToStorage(next)
      return next
    })
  }, [])

  const isSaved = useCallback(
    (id: string) => deals.some((d) => d.id === id),
    [deals]
  )

  return { deals, saveDeal, removeDeal, isSaved }
}
