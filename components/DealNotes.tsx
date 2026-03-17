'use client'

import { useRef, useState } from 'react'
import { useDealNotes } from '@/lib/hooks/useDealNotes'
import { logActivity } from '@/lib/hooks/useActivityLog'

type SaveState = 'idle' | 'saving' | 'saved'

type Props = {
  propertyId: string
  onActivity?: () => void
}

function formatUpdatedAt(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function DealNotes({ propertyId, onActivity }: Props) {
  const { note, setNote, saveNote, updatedAt } = useDealNotes(propertyId)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loggedRef = useRef(false)   // prevent spamming activity log

  const handleChange = (value: string) => {
    setNote(value)
    setSaveState('saving')
    loggedRef.current = false
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveNote(value)
      setSaveState('saved')
      if (!loggedRef.current) {
        logActivity(propertyId, 'added_note', 'Note updated')
        loggedRef.current = true
        onActivity?.()
      }
      setTimeout(() => setSaveState('idle'), 2000)
    }, 800)
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📝</span>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Deal Notes</h2>
        </div>
        <div className="flex items-center gap-2">
          {saveState === 'saving' && (
            <span className="text-xs text-gray-400 animate-pulse">Saving…</span>
          )}
          {saveState === 'saved' && (
            <span className="text-xs text-green-500 font-medium">✓ Saved</span>
          )}
          {saveState === 'idle' && updatedAt && (
            <span className="text-[11px] text-gray-400">
              Last saved {formatUpdatedAt(updatedAt)}
            </span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="px-4 py-4">
        <textarea
          value={note}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Add deal strategy notes, contact history, follow-up dates, offer details…"
          rows={5}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
          <span>🔒</span>
          Notes saved to your browser. Auto-saves as you type.
        </p>
      </div>
    </section>
  )
}
