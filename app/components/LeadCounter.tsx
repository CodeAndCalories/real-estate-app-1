'use client'

import { useEffect, useState } from 'react'

export const dynamic = 'force-dynamic'

export default function LeadCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/lead-count')
      .then((r) => r.json())
      .then((data) => setCount(data.count))
      .catch(() => {})
  }, [])

  return (
    <span className="font-black text-blue-400 tabular-nums">
      {count !== null ? count.toLocaleString() : '1,000,000+'}
    </span>
  )
}
