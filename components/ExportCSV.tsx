'use client'

import { Property } from '@/app/finder/page'
import { exportToCSV } from '@/lib/utils/exportCSV'

type Props = {
  data: Property[]
}

export default function ExportCSV({ data }: Props) {
  const handleExport = () => {
    exportToCSV(data, 'real-estate-leads.csv')
  }

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors"
    >
      Download CSV
    </button>
  )
}
