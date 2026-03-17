'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserId, workspaceKey } from '@/lib/utils/userId'

export type NoteEntry = {
  userId: string
  propertyId: string
  note: string
  updatedAt: string    // ISO-8601
}

const LS_KEY = 'deal-notes'

type NoteStore = Record<string, NoteEntry>   // key = workspaceKey

function read(): NoteStore {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as NoteStore) : {}
  } catch {
    return {}
  }
}

function write(store: NoteStore) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)) } catch { /* ignore */ }
}

export function useDealNotes(propertyId: string) {
  const [note, setNote]       = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const userId = getUserId()
  const key    = workspaceKey(userId, propertyId)

  useEffect(() => {
    const store = read()
    const entry = store[key]
    setNote(entry?.note ?? '')
    setUpdatedAt(entry?.updatedAt ?? null)
  }, [key])

  const saveNote = useCallback(
    (text: string) => {
      const entry: NoteEntry = {
        userId,
        propertyId,
        note: text,
        updatedAt: new Date().toISOString(),
      }
      const store = read()
      store[key] = entry
      write(store)
      setUpdatedAt(entry.updatedAt)
    },
    [key, userId, propertyId]
  )

  return { note, setNote, saveNote, updatedAt }
}
