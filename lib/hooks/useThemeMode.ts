'use client'

import { useState, useEffect, useCallback } from 'react'

export type ThemeMode = 'auto' | 'day' | 'night'
export type EffectiveTheme = 'day' | 'night'

const STORAGE_KEY = 'leadfinder-theme'

function computeEffective(mode: ThemeMode): EffectiveTheme {
  if (mode === 'day') return 'day'
  if (mode === 'night') return 'night'
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'day' : 'night'
}

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>('auto')
  const [effective, setEffective] = useState<EffectiveTheme>('day')

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'auto'
    setModeState(stored)
    setEffective(computeEffective(stored))

    const sync = () => {
      const updated = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'auto'
      setModeState(updated)
      setEffective(computeEffective(updated))
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
    setEffective(computeEffective(m))
    window.dispatchEvent(new Event('theme-changed'))
  }, [])

  return { mode, effective, setMode, isDark: effective === 'night' }
}
