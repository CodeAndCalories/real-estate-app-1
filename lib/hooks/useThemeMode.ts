'use client'

import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'day' | 'night'
export type EffectiveTheme = 'day' | 'night'

const STORAGE_KEY = 'leadfinder-theme'

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>('night')
  const [effective, setEffective] = useState<EffectiveTheme>('night')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    // If stored value was 'auto' (legacy), default to 'night'
    const resolved: ThemeMode = stored === 'day' ? 'day' : 'night'
    setModeState(resolved)
    setEffective(resolved)

    const sync = () => {
      const updated = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
      const r: ThemeMode = updated === 'day' ? 'day' : 'night'
      setModeState(r)
      setEffective(r)
    }

    window.addEventListener('theme-changed', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('theme-changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setMode = useCallback((m: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, m)
    setModeState(m)
    setEffective(m)
    window.dispatchEvent(new Event('theme-changed'))
  }, [])

  return { mode, effective, setMode, isDark: effective === 'night' }
}
