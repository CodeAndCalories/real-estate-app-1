'use client'

import { useDealTags } from '@/lib/hooks/useDealTags'
import { logActivity } from '@/lib/hooks/useActivityLog'

const PRESET_TAGS = [
  { label: 'Hot Deal',  icon: '🔥', color: { active: 'bg-red-500 border-red-500 text-white',    inactive: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'    } },
  { label: 'Rental',    icon: '🏠', color: { active: 'bg-blue-500 border-blue-500 text-white',   inactive: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'   } },
  { label: 'Flip',      icon: '🔨', color: { active: 'bg-orange-500 border-orange-500 text-white', inactive: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' } },
  { label: 'Wholesale', icon: '💼', color: { active: 'bg-purple-500 border-purple-500 text-white', inactive: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' } },
]

type Props = {
  propertyId: string
  onActivity?: () => void
}

export default function DealTags({ propertyId, onActivity }: Props) {
  const { toggleTag, hasTag } = useDealTags(propertyId)

  const handleToggle = (tag: string) => {
    const wasActive = hasTag(tag)
    toggleTag(tag)
    logActivity(
      propertyId,
      wasActive ? 'removed_tag' : 'added_tag',
      wasActive ? `Removed tag: ${tag}` : `Tagged as: ${tag}`
    )
    onActivity?.()
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Deal Tags</h2>
      </div>
      <div className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map(({ label, icon, color }) => {
            const active = hasTag(label)
            return (
              <button
                key={label}
                onClick={() => handleToggle(label)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  active ? color.active : color.inactive
                }`}
              >
                <span className="text-sm leading-none">{icon}</span>
                {label}
                {active && <span className="ml-0.5 opacity-80 text-[10px] font-black">✓</span>}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2.5">
          Click a tag to assign it to this deal. Tags are saved locally.
        </p>
      </div>
    </section>
  )
}
