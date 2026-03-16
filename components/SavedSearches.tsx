'use client'


export type SavedSearch = {
  id: string
  city?: string
  minScore?: number
  minEquity?: number
  maxDaysOnMarket?: number
}

type Props = {
  isDark: boolean
  searches: SavedSearch[]
  onApplySearch: (filters: SavedSearch) => void
  onDelete: (id: string) => void
}

const LS_KEY = 'saved-searches'

function save(searches: SavedSearch[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(searches))
  } catch {
    // ignore
  }
}

function labelParts(s: SavedSearch): string[] {
  const parts: string[] = []
  if (s.city) parts.push(s.city)
  if (s.minScore) parts.push(`Score ≥ ${s.minScore}`)
  if (s.minEquity) parts.push(`Equity ≥ $${(s.minEquity / 1000).toFixed(0)}k`)
  if (s.maxDaysOnMarket) parts.push(`DOM ≤ ${s.maxDaysOnMarket}`)
  return parts
}

export default function SavedSearches({ isDark, searches, onApplySearch, onDelete }: Props) {
  if (searches.length === 0) return null

  return (
    <div className="mb-5">
      <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Saved Searches
      </p>
      <div className="flex flex-wrap gap-2">
        {searches.map((s) => {
          const parts = labelParts(s)
          const label = parts.length > 0 ? parts.join(' — ') : 'All Signals'

          return (
            <div
              key={s.id}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-700 hover:bg-gray-750'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <button
                onClick={() => onApplySearch(s)}
                className="flex items-center gap-1.5"
                title="Apply this search"
              >
                <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>⟳</span>
                <span>{label}</span>
              </button>
              <button
                onClick={() => onDelete(s.id)}
                title="Delete saved search"
                className={`ml-1 text-xs leading-none rounded hover:opacity-100 opacity-50 transition-opacity ${
                  isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'
                }`}
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function saveSearch(searches: SavedSearch[], next: Omit<SavedSearch, 'id'>): SavedSearch[] {
  const newSearch: SavedSearch = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ...next,
  }
  const updated = [newSearch, ...searches].slice(0, 10) // cap at 10
  save(updated)
  return updated
}
