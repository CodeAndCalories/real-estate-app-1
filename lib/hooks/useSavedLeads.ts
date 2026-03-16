import { useState, useEffect, useMemo, useCallback } from 'react'
import { Property } from '@/app/finder/page'

export const propertyKey = (p: Property): string => `${p.address}||${p.city}`

export function useSavedLeads() {
  const [savedLeads, setSavedLeads] = useState<Property[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('savedLeads')
      if (raw) setSavedLeads(JSON.parse(raw))
    } catch {}
  }, [])

  const savedKeys = useMemo(
    () => new Set(savedLeads.map(propertyKey)),
    [savedLeads]
  )

  const toggleSave = useCallback((p: Property) => {
    setSavedLeads((prev) => {
      const key = propertyKey(p)
      const next = prev.some((s) => propertyKey(s) === key)
        ? prev.filter((s) => propertyKey(s) !== key)
        : [...prev, p]
      try {
        localStorage.setItem('savedLeads', JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const isSaved = useCallback(
    (p: Property) => savedKeys.has(propertyKey(p)),
    [savedKeys]
  )

  return { savedLeads, savedKeys, toggleSave, isSaved }
}
