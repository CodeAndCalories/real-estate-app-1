import { useState, useEffect, useMemo, useCallback } from 'react'
import type { Signal } from '@/lib/data/getSignals'

const LS_KEY = 'favorite-signals'

export function favoriteKey(s: { address: string; city: string }): string {
  return `${s.address}||${s.city}`
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Signal[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setFavorites(JSON.parse(raw) as Signal[])
    } catch {}
  }, [])

  const favoriteKeys = useMemo(
    () => new Set(favorites.map(favoriteKey)),
    [favorites]
  )

  const toggleFavorite = useCallback((s: Signal) => {
    setFavorites((prev) => {
      const key = favoriteKey(s)
      const next = prev.some((f) => favoriteKey(f) === key)
        ? prev.filter((f) => favoriteKey(f) !== key)
        : [...prev, s]
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (s: { address: string; city: string }) => favoriteKeys.has(favoriteKey(s)),
    [favoriteKeys]
  )

  return { favorites, favoriteKeys, toggleFavorite, isFavorite }
}
