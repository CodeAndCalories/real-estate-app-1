'use client'

import { useState, useEffect } from 'react'

export type DealAlert = {
  id: string
  city?: string
  minScore?: number
  minEquity?: number
  createdAt: number
}

type Props = {
  isDark: boolean
  /** Current Finder filter values — used by "Create Alert From Filters" */
  currentCity?: string
  currentMinScore?: number
  currentMinEquity?: number
}

const STORAGE_KEY = 'property-alerts'
const CITIES = ['Miami', 'Los Angeles', 'New York', 'Dallas', 'Atlanta', 'Chicago', 'Phoenix', 'Cleveland']

function alertLabel(a: DealAlert): string {
  const parts: string[] = []
  if (a.city) parts.push(a.city)
  if (a.minScore) parts.push(`Score ≥ ${a.minScore}`)
  if (a.minEquity) parts.push(`Equity ≥ $${(a.minEquity / 1000).toFixed(0)}k`)
  return parts.length > 0 ? parts.join(' — ') : 'All signals'
}

function load(): DealAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DealAlert[]) : []
  } catch {
    return []
  }
}

function persist(alerts: DealAlert[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts)) } catch { /* ignore */ }
}

export function getAlertCount(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DealAlert[]).length : 0
  } catch {
    return 0
  }
}

export default function DealAlertsPanel({
  isDark,
  currentCity = '',
  currentMinScore = 0,
  currentMinEquity = 0,
}: Props) {
  const [alerts, setAlerts]       = useState<DealAlert[]>([])
  const [showForm, setShowForm]   = useState(false)
  const [newCity, setNewCity]     = useState('')
  const [newScore, setNewScore]   = useState(0)
  const [newEquity, setNewEquity] = useState(0)

  useEffect(() => { setAlerts(load()) }, [])

  const save = (updated: DealAlert[]) => {
    setAlerts(updated)
    persist(updated)
  }

  const handleCreate = () => {
    const next: DealAlert = {
      id: Date.now().toString(36),
      createdAt: Date.now(),
      ...(newCity   ? { city: newCity }           : {}),
      ...(newScore  > 0 ? { minScore: newScore }  : {}),
      ...(newEquity > 0 ? { minEquity: newEquity } : {}),
    }
    save([...alerts, next])
    setNewCity('')
    setNewScore(0)
    setNewEquity(0)
    setShowForm(false)
  }

  const handleCreateFromFilters = () => {
    if (!currentCity && !currentMinScore && !currentMinEquity) return
    const next: DealAlert = {
      id: Date.now().toString(36),
      createdAt: Date.now(),
      ...(currentCity      ? { city: currentCity }             : {}),
      ...(currentMinScore  > 0 ? { minScore: currentMinScore } : {}),
      ...(currentMinEquity > 0 ? { minEquity: currentMinEquity } : {}),
    }
    save([...alerts, next])
  }

  const handleDelete = (id: string) => save(alerts.filter((a) => a.id !== id))

  const hasCurrentFilters = !!(currentCity || currentMinScore || currentMinEquity)

  const card    = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const divider = isDark ? 'border-gray-700' : 'border-gray-100'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textMuted   = isDark ? 'text-gray-500' : 'text-gray-400'
  const inputCls    = isDark
    ? 'bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className={`rounded-xl border mb-5 overflow-hidden ${card}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span>📣</span>
          <h2 className={`text-sm font-bold ${textPrimary}`}>Deal Alerts</h2>
          {alerts.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              {alerts.length} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasCurrentFilters && (
            <button
              onClick={handleCreateFromFilters}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                isDark
                  ? 'bg-green-900/30 border-green-700 text-green-400 hover:bg-green-900/50'
                  : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
              }`}
              title="Create alert from current search filters"
            >
              + From Filters
            </button>
          )}
          <button
            onClick={() => setShowForm((v) => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              showForm
                ? isDark
                  ? 'bg-blue-900/30 border-blue-700 text-blue-400'
                  : 'bg-blue-50 border-blue-300 text-blue-600'
                : isDark
                ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {showForm ? '✕ Cancel' : '+ Create Alert'}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className={`px-5 py-4 border-b ${divider}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textMuted}`}>
            Alert conditions (leave blank for any)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className={`block text-xs mb-1 ${textMuted}`}>City</label>
              <select value={newCity} onChange={(e) => setNewCity(e.target.value)} className={inputCls + ' w-full'}>
                <option value="">Any city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${textMuted}`}>Min Score</label>
              <select value={newScore} onChange={(e) => setNewScore(Number(e.target.value))} className={inputCls + ' w-full'}>
                <option value={0}>Any</option>
                <option value={40}>40+</option>
                <option value={60}>60+</option>
                <option value={80}>80+ (Hot)</option>
                <option value={90}>90+ (Investor Pick)</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${textMuted}`}>Min Equity</label>
              <select value={newEquity} onChange={(e) => setNewEquity(Number(e.target.value))} className={inputCls + ' w-full'}>
                <option value={0}>Any</option>
                <option value={50000}>$50k+</option>
                <option value={100000}>$100k+</option>
                <option value={200000}>$200k+</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
          >
            Save Alert
          </button>
        </div>
      )}

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div className={`px-5 py-6 text-center text-sm ${textMuted}`}>
          No alerts set. Create an alert to track specific market conditions.
        </div>
      ) : (
        <div>
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-center justify-between px-5 py-3 border-b last:border-0 ${divider}`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className={`text-sm font-medium ${textPrimary}`}>{alertLabel(a)}</span>
              </div>
              <button
                onClick={() => handleDelete(a.id)}
                title="Delete alert"
                className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                  isDark
                    ? 'border-gray-600 text-gray-500 hover:border-red-700 hover:text-red-400'
                    : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'
                }`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
