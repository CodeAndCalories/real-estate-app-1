'use client'

import { useContactAttempts, ALL_ATTEMPTS } from '@/lib/hooks/useContactAttempts'
import type { ContactAttempt } from '@/lib/hooks/useContactAttempts'
import { logActivity } from '@/lib/hooks/useActivityLog'

const ATTEMPT_META: Record<ContactAttempt, { icon: string; desc: string }> = {
  'Called Owner':       { icon: '📞', desc: 'Spoke directly or left voicemail' },
  'Sent Mailer':        { icon: '✉️',  desc: 'Physical mailer mailed to owner' },
  'Sent Text':          { icon: '💬', desc: 'SMS sent to owner phone number' },
  'Scheduled Follow-up': { icon: '📅', desc: 'Calendar reminder set for follow-up' },
}

type Props = {
  propertyId: string
  onActivity?: () => void
}

export default function ContactTracker({ propertyId, onActivity }: Props) {
  const { toggle, isChecked } = useContactAttempts(propertyId)

  const handleToggle = (attempt: ContactAttempt) => {
    const wasChecked = isChecked(attempt)
    toggle(attempt)
    if (!wasChecked) {
      logActivity(propertyId, 'contact_attempt', `Marked Contacted: ${attempt}`)
      onActivity?.()
    }
  }

  const checkedCount = ALL_ATTEMPTS.filter(isChecked).length

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Contact Attempts
          </h2>
        </div>
        {checkedCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            {checkedCount} / {ALL_ATTEMPTS.length} done
          </span>
        )}
      </div>

      {/* Checkboxes */}
      <div className="px-4 py-3 space-y-3">
        {ALL_ATTEMPTS.map((attempt) => {
          const checked = isChecked(attempt)
          const meta    = ATTEMPT_META[attempt]
          return (
            <label
              key={attempt}
              className="flex items-start gap-3 cursor-pointer group"
            >
              {/* Checkbox */}
              <span
                onClick={() => handleToggle(attempt)}
                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                  checked
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-gray-300 group-hover:border-green-400'
                }`}
              >
                {checked && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>

              {/* Label */}
              <div
                className="flex-1 min-w-0"
                onClick={() => handleToggle(attempt)}
              >
                <div className={`flex items-center gap-1.5 text-sm font-semibold leading-tight transition-colors ${
                  checked ? 'text-green-700 line-through' : 'text-gray-800 group-hover:text-gray-900'
                }`}>
                  <span className="text-base leading-none">{meta.icon}</span>
                  {attempt}
                </div>
                <p className={`text-xs mt-0.5 transition-colors ${
                  checked ? 'text-green-500' : 'text-gray-400'
                }`}>
                  {meta.desc}
                </p>
              </div>

              {/* Checked timestamp badge */}
              {checked && (
                <span className="flex-shrink-0 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-0.5">
                  ✓ Done
                </span>
              )}
            </label>
          )
        })}
      </div>

      <div className="px-4 pb-3">
        <p className="text-xs text-gray-400">
          Selections saved automatically per deal.
        </p>
      </div>
    </section>
  )
}
