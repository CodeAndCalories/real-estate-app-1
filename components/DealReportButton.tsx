'use client'

import { generateDealReport } from '@/lib/utils/generateDealReport'
import type { Signal } from '@/lib/data/getSignals'

type Props = {
  signal: Signal
  priceHistory?: number[]
}

export default function DealReportButton({ signal, priceHistory = [] }: Props) {
  return (
    <button
      onClick={() => generateDealReport(signal, priceHistory)}
      className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download Deal Report
    </button>
  )
}
