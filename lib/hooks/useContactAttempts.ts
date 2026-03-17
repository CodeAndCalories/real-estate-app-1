'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserId, workspaceKey } from '@/lib/utils/userId'

export type ContactAttempt =
  | 'Called Owner'
  | 'Sent Mailer'
  | 'Sent Text'
  | 'Scheduled Follow-up'

export const ALL_ATTEMPTS: ContactAttempt[] = [
  'Called Owner',
  'Sent Mailer',
  'Sent Text',
  'Scheduled Follow-up',
]

export type ContactEntry = {
  userId: string
  propertyId: string
  attempts: ContactAttempt[]
  updatedAt: string
}

const LS_KEY = 'contact-attempts'
type Store = Record<string, ContactEntry>

function read(): Store {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Store) : {}
  } catch {
    return {}
  }
}

function write(store: Store) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)) } catch { /* ignore */ }
}

export function useContactAttempts(propertyId: string) {
  const [attempts, setAttempts] = useState<ContactAttempt[]>([])
  const userId = getUserId()
  const key    = workspaceKey(userId, propertyId)

  useEffect(() => {
    const store = read()
    setAttempts(store[key]?.attempts ?? [])
  }, [key])

  const toggle = useCallback(
    (attempt: ContactAttempt) => {
      setAttempts((prev) => {
        const next: ContactAttempt[] = prev.includes(attempt)
          ? prev.filter((a) => a !== attempt)
          : [...prev, attempt]

        const store = read()
        store[key] = { userId, propertyId, attempts: next, updatedAt: new Date().toISOString() }
        write(store)
        return next
      })
    },
    [key, userId, propertyId]
  )

  const isChecked = useCallback((a: ContactAttempt) => attempts.includes(a), [attempts])

  return { attempts, toggle, isChecked }
}
