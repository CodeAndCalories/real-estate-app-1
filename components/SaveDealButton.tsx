'use client'

import { useSavedDeals } from '@/lib/hooks/useSavedDeals'

type Props = {
  id: string
  address: string
  city: string
  opportunity_score: number | null
  lead_type: string
}

export default function SaveDealButton({ id, address, city, opportunity_score, lead_type }: Props) {
  const { saveDeal, removeDeal, isSaved } = useSavedDeals()
  const saved = isSaved(id)

  const handleClick = () => {
    if (saved) {
      removeDeal(id)
    } else {
      saveDeal({ id, address, city, opportunity_score, lead_type })
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
        saved
          ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100'
          : 'bg-white border-gray-200 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700'
      }`}
    >
      <span className="text-base leading-none">{saved ? '⭐' : '☆'}</span>
      {saved ? 'Deal Saved' : '⭐ Save Deal'}
    </button>
  )
}
