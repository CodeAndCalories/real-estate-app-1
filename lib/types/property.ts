export type RawProperty = {
  id: string
  address: string
  city: string
  state: string
  zip: string
  price: number
  beds: number
  baths: number
  sqft: number
  days_on_market: number
  /** Chronological price history — most recent price is last */
  price_history: number[]
  listing_date: string   // ISO date string
  last_updated: string   // ISO date string

  // Optional enriched fields
  estimated_equity?: number
  loan_balance?: number
  owner_name?: string
}
