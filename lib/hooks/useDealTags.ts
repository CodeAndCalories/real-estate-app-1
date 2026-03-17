'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserId, workspaceKey } from '@/lib/utils/userId'

const LS_KEY = 'deal-tags'

type TagStore = Record<string, string[]>   // key = workspaceKey, value = tag list

function read(): TagStore {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as TagStore) : {}
  } catch {
    return {}
  }
}

function write(store: TagStore) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(store)) } catch { /* ignore */ }
}

export function useDealTags(propertyId: string) {
  const [tags, setTags] = useState<string[]>([])
  const userId = getUserId()
  const key    = workspaceKey(userId, propertyId)

  useEffect(() => {
    const store = read()
    setTags(store[key] ?? [])
  }, [key])

  const toggleTag = useCallback(
    (tag: string) => {
      setTags((prev) => {
        const next = prev.includes(tag)
          ? prev.filter((t) => t !== tag)
          : [...prev, tag]
        const store = read()
        store[key] = next
        write(store)
        return next
      })
    },
    [key]
  )

  const hasTag = useCallback((tag: string) => tags.includes(tag), [tags])

  return { tags, toggleTag, hasTag }
}
