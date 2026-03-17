'use client'

import { useThemeMode, ThemeMode } from '@/lib/hooks/useThemeMode'

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
]

export default function ThemeToggle() {
  const { mode, setMode } = useThemeMode()

  return (
    <div className="hidden sm:flex items-center rounded-full border border-gray-200 bg-gray-100 p-0.5 gap-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setMode(opt.value)}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            mode === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
