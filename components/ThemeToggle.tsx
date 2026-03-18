'use client'

import { useThemeMode } from '@/lib/hooks/useThemeMode'

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 6.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.061l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.061 1.06l1.06 1.061zM5.404 6.464a.75.75 0 001.06-1.06L5.404 4.343a.75.75 0 10-1.06 1.061l1.06 1.06z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { mode, setMode } = useThemeMode()

  return (
    <div className="hidden sm:flex items-center bg-white/5 rounded-lg p-1 gap-1 border border-white/10">
      <button
        onClick={() => setMode('day')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
          mode === 'day'
            ? 'bg-white/10 text-white'
            : 'text-gray-500 hover:text-gray-300'
        }`}
        aria-label="Light mode"
      >
        <SunIcon />
        <span>Light</span>
      </button>
      <button
        onClick={() => setMode('night')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 ${
          mode === 'night'
            ? 'bg-white/10 text-white'
            : 'text-gray-500 hover:text-gray-300'
        }`}
        aria-label="Dark mode"
      >
        <MoonIcon />
        <span>Dark</span>
      </button>
    </div>
  )
}
