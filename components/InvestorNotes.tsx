'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  signalId: string
}

const STORAGE_KEY = 'investor-notes'

function loadNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

function saveNote(signalId: string, text: string) {
  try {
    const notes = loadNotes()
    notes[signalId] = text
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch { /* ignore */ }
}

export default function InvestorNotes({ signalId }: Props) {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const notes = loadNotes()
    setNote(notes[signalId] ?? '')
  }, [signalId])

  const handleChange = (value: string) => {
    setNote(value)
    setSaved(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveNote(signalId, value)
      setSaved(true)
    }, 800)
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Investor Notes</h2>
        {saved && (
          <span className="text-xs text-green-500 font-medium">Notes saved automatically.</span>
        )}
      </div>
      <div className="px-4 py-4">
        <textarea
          value={note}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Add your notes about this property — deal strategy, contact attempts, follow-up dates…"
          rows={5}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </section>
  )
}
