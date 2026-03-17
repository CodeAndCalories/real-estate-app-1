'use client'

import { useActivityLog } from '@/lib/hooks/useActivityLog'
import type { ActivityActionType } from '@/lib/hooks/useActivityLog'

// ── Icon + colour per action type ─────────────────────────────────────────────
const ACTION_META: Record<ActivityActionType, { icon: string; color: string; dot: string }> = {
  saved_deal:      { icon: '⭐', color: 'text-yellow-600 bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-400' },
  removed_deal:    { icon: '✕',  color: 'text-gray-500 bg-gray-50 border-gray-200',        dot: 'bg-gray-400'   },
  added_note:      { icon: '📝', color: 'text-blue-600 bg-blue-50 border-blue-200',        dot: 'bg-blue-400'   },
  contact_attempt: { icon: '📞', color: 'text-green-600 bg-green-50 border-green-200',     dot: 'bg-green-500'  },
  added_tag:       { icon: '🏷️', color: 'text-purple-600 bg-purple-50 border-purple-200', dot: 'bg-purple-400' },
  removed_tag:     { icon: '🏷️', color: 'text-gray-500 bg-gray-50 border-gray-200',       dot: 'bg-gray-400'   },
  pipeline_status: { icon: '📊', color: 'text-indigo-600 bg-indigo-50 border-indigo-200',  dot: 'bg-indigo-400' },
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr  = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1)  return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24)  return `${diffHr}h ago`
  if (diffDay < 7)  return `${diffDay}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type Props = {
  propertyId: string
  maxItems?: number
}

export default function DealActivityTimeline({ propertyId, maxItems = 8 }: Props) {
  const { entries } = useActivityLog(propertyId)

  // Nothing to show yet
  if (entries.length === 0) {
    return (
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="text-base">🕐</span>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Deal Activity
          </h2>
        </div>
        <div className="px-4 py-5 text-center">
          <p className="text-sm text-gray-400">No activity recorded yet.</p>
          <p className="text-xs text-gray-300 mt-1">
            Activity is logged as you add notes, tags, and contact attempts.
          </p>
        </div>
      </section>
    )
  }

  const visible = entries.slice(0, maxItems)

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🕐</span>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Deal Activity
          </h2>
        </div>
        <span className="text-xs text-gray-400">
          {entries.length} event{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline */}
      <div className="px-4 py-3">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gray-100" aria-hidden="true" />

          <ul className="space-y-3">
            {visible.map((entry, idx) => {
              const meta = ACTION_META[entry.actionType]
              return (
                <li key={entry.id} className="flex items-start gap-3 relative">
                  {/* Dot */}
                  <span
                    className={`flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center text-[10px] z-10 mt-0.5 ${meta.dot}`}
                    style={{ boxShadow: '0 0 0 2px #f3f4f6' }}
                  >
                    <span className="sr-only">{entry.actionType}</span>
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm leading-none flex-shrink-0">{meta.icon}</span>
                        <span className="text-sm text-gray-800 leading-snug">{entry.label}</span>
                      </div>
                      <time
                        dateTime={entry.timestamp}
                        className="text-[11px] text-gray-400 flex-shrink-0 mt-0.5"
                      >
                        {formatTimestamp(entry.timestamp)}
                      </time>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {entries.length > maxItems && (
          <p className="text-xs text-gray-400 mt-3 text-center">
            Showing {maxItems} of {entries.length} events
          </p>
        )}
      </div>
    </section>
  )
}
