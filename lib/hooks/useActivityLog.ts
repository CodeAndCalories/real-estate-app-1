'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserId, workspaceKey } from '@/lib/utils/userId'

export type ActivityActionType =
  | 'saved_deal'
  | 'removed_deal'
  | 'added_note'
  | 'contact_attempt'
  | 'added_tag'
  | 'removed_tag'
  | 'pipeline_status'

export type ActivityEntry = {
  id: string
  timestamp: string          // ISO-8601
  userId: string
  propertyId: string
  actionType: ActivityActionType
  label: string              // Human-readable description
}

const LS_KEY = 'deal-activity'

function readAll(): ActivityEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : []
  } catch {
    return []
  }
}

function writeAll(entries: ActivityEntry[]) {
  try {
    // Cap at 500 entries to avoid localStorage bloat
    localStorage.setItem(LS_KEY, JSON.stringify(entries.slice(0, 500)))
  } catch { /* ignore */ }
}

/**
 * Append a single activity entry without React state — callable from any
 * component without needing to mount the full hook.
 */
export function logActivity(
  propertyId: string,
  actionType: ActivityActionType,
  label: string
): ActivityEntry {
  const userId = getUserId()
  const entry: ActivityEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId,
    propertyId,
    actionType,
    label,
  }
  const prev = readAll()
  // Deduplicate recent identical actions within 5 seconds
  const recent = prev[0]
  if (
    recent &&
    recent.propertyId === propertyId &&
    recent.actionType === actionType &&
    Date.now() - new Date(recent.timestamp).getTime() < 5000
  ) {
    return recent
  }
  writeAll([entry, ...prev])
  return entry
}

/** Hook — provides the activity list for a specific property, live-updated. */
export function useActivityLog(propertyId: string) {
  const [entries, setEntries] = useState<ActivityEntry[]>([])

  const refresh = useCallback(() => {
    const all = readAll()
    setEntries(all.filter((e) => e.propertyId === propertyId))
  }, [propertyId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const log = useCallback(
    (actionType: ActivityActionType, label: string) => {
      logActivity(propertyId, actionType, label)
      refresh()
    },
    [propertyId, refresh]
  )

  return { entries, log, refresh }
}

export { workspaceKey }
