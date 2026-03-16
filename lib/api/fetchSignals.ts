import type { Signal } from '@/lib/data/getSignals'

export type { Signal }

export type FetchSignalsOptions = {
  city?: string
  lead_type?: string
  limit?: number
  page?: number
}

export type SignalsResponse = {
  total: number    // total matching records before pagination
  page: number     // current page (1-based)
  limit: number | null  // page size (null = no limit applied)
  signals: Signal[]
}

export async function fetchSignals(options: FetchSignalsOptions = {}): Promise<SignalsResponse> {
  const params = new URLSearchParams()

  if (options.city) params.set('city', options.city)
  if (options.lead_type) params.set('lead_type', options.lead_type)
  if (options.limit !== undefined) params.set('limit', String(options.limit))
  if (options.page !== undefined && options.page > 1) params.set('page', String(options.page))

  const query = params.toString()
  const url = `/api/signals${query ? `?${query}` : ''}`

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch signals: ${res.status}`)

  return res.json() as Promise<SignalsResponse>
}
