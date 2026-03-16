'use client'

import { useState, useEffect } from 'react'
import type { Signal } from '@/lib/data/getSignals'

type Alert = {
  id: string
  city?: string
  minScore?: number
  minEquity?: number
}

type Props = {
  isDark: boolean
}

function alertLabel(a: Alert): string {
  const parts: string[] = []
  if (a.city) parts.push(a.city)
  if (a.minScore) parts.push(`Score ≥ ${a.minScore}`)
  if (a.minEquity) parts.push(`Equity ≥ $${(a.minEquity / 1000).toFixed(0)}k`)
  return parts.length > 0 ? parts.join(' — ') : 'All signals'
}

function matchesAlert(s: Signal, a: Alert): boolean {
  if (a.city && s.city.toLowerCase() !== a.city.toLowerCase()) return false
  if (a.minScore && (s.opportunity_score ?? 0) < a.minScore) return false
  if (a.minEquity) {
    const equity =
      s.estimated_value > 0 && s.loan_balance_estimate != null
        ? s.estimated_value - s.loan_balance_estimate
        : 0
    if (equity < a.minEquity) return false
  }
  return true
}

const STORAGE_KEY = 'signal-alerts'
const CITIES = ['Miami', 'Los Angeles', 'New York', 'Dallas', 'Atlanta', 'Chicago', 'Phoenix', 'Cleveland']

export default function OpportunityAlerts({ isDark }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [matchCount, setMatchCount] = useState(0)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [newCity, setNewCity] = useState('')
  const [newScore, setNewScore] = useState(0)
  const [newEquity, setNewEquity] = useState(0)

  // Load alerts from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setAlerts(JSON.parse(raw) as Alert[])
    } catch { /* ignore */ }
  }, [])

  // Check alerts against signals
  useEffect(() => {
    if (alerts.length === 0) return
    fetch('/api/signals?limit=500', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { signals: Signal[] }) => {
        const matched = new Set<string>()
        for (const signal of data.signals) {
          for (const alert of alerts) {
            if (matchesAlert(signal, alert)) {
              matched.add(signal.id ?? signal.address)
            }
          }
        }
        setMatchCount(matched.size)
      })
      .catch(() => {})
  }, [alerts])

  const persist = (updated: Alert[]) => {
    setAlerts(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
  }

  const handleCreate = () => {
    const next: Alert = {
      id: Date.now().toString(36),
      ...(newCity ? { city: newCity } : {}),
      ...(newScore > 0 ? { minScore: newScore } : {}),
      ...(newEquity > 0 ? { minEquity: newEquity } : {}),
    }
    persist([...alerts, next])
    setNewCity('')
    setNewScore(0)
    setNewEquity(0)
    setShowForm(false)
  }

  const handleDelete = (id: string) => persist(alerts.filter((a) => a.id !== id))

  const card = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const divider = isDark ? 'border-gray-700' : 'border-gray-100'
  const textPrimary = isDark ? 'text-white' : 'text-gray-900'
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400'
  const inputCls = isDark
    ? 'bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'bg-white border border-gray-300 text-gray-900 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className={`rounded-xl border mb-5 overflow-hidden ${card}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-3 border-b ${divider}`}>
        <div className="flex items-center gap-2">
          <span>🔔</span>
          <h2 className={`text-sm font-bold ${textPrimary}`}>Opportunity Alerts</h2>
          {alerts.length > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'
            }`}>
              {alerts.length} active
            </span>
          )}
        </div>
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

      {/* Match banner */}
      {matchCount > 0 && (
        <div className={`flex items-center gap-2 px-5 py-2.5 border-b text-sm font-semibold ${
          isDark
            ? 'bg-green-900/20 border-green-800 text-green-400'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <span>✓</span>
          New Opportunities Found ({matchCount})
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className={`px-5 py-4 border-b ${divider}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${textMuted}`}>
            Alert conditions (leave blank for any)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className={`block text-xs mb-1 ${textMuted}`}>City</label>
              <select
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className={inputCls + ' w-full'}
              >
                <option value="">Any city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${textMuted}`}>Min Score</label>
              <select
                value={newScore}
                onChange={(e) => setNewScore(Number(e.target.value))}
                className={inputCls + ' w-full'}
              >
                <option value={0}>Any</option>
                <option value={40}>40+</option>
                <option value={60}>60+</option>
                <option value={80}>80+ (Hot)</option>
              </select>
            </div>
            <div>
              <label className={`block text-xs mb-1 ${textMuted}`}>Min Equity</label>
              <select
                value={newEquity}
                onChange={(e) => setNewEquity(Number(e.target.value))}
                className={inputCls + ' w-full'}
              >
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
          No alerts set. Create an alert to be notified when matching signals appear.
        </div>
      ) : (
        <div className="divide-y divide-transparent">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-center justify-between px-5 py-3 border-b last:border-0 ${divider}`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-green-500 flex-shrink-0`} />
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
