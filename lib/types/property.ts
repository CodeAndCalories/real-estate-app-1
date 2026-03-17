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

  // Optional enriched fields (populated by scripts/enrichProperties.ts)
  estimated_equity?: number
  loan_balance?: number
  owner_name?: string
  owner_phone?: string
  owner_mailing_address?: string
  owner_state?: string
  years_owned?: number
  tax_delinquent?: boolean
  vacancy_signal?: boolean
  inherited?: boolean
}
