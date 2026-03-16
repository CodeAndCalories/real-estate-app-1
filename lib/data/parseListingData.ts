import type { RawProperty } from '@/lib/types/property'

/** Loosely-typed external listing record from any MLS / listing feed. */
export type ExternalListing = Record<string, unknown>

/**
 * parseListingData
 *
 * Converts an external listing object (MLS feed, scrape, API response, etc.)
 * into the RawProperty shape used internally by the signal pipeline.
 *
 * Field mapping tries common key variants so the function handles data from
 * multiple providers without pre-processing.
 *
 * Usage:
 *   const raw = parseListingData(mlsRow)
 *   const signals = generateSignals([raw])
 */
export function parseListingData(rawListing: ExternalListing): RawProperty {
  const today = new Date().toISOString().split('T')[0]

  const str  = (keys: string[], fallback = ''): string => {
    for (const k of keys) {
      const v = rawListing[k]
      if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
    }
    return fallback
  }

  const num  = (keys: string[], fallback = 0): number => {
    for (const k of keys) {
      const v = rawListing[k]
      const n = parseFloat(String(v ?? ''))
      if (!isNaN(n)) return n
    }
    return fallback
  }

  const price = num(['price', 'list_price', 'listing_price', 'asking_price', 'sale_price'])

  // Price history: use the field if it's already an array of numbers,
  // otherwise fall back to a single-element array with the current price.
  let priceHistory: number[] = [price]
  const rawHistory = rawListing['price_history'] ?? rawListing['price_changes']
  if (Array.isArray(rawHistory) && rawHistory.length > 0) {
    const parsed = rawHistory.map((v: unknown) => parseFloat(String(v))).filter((n) => !isNaN(n))
    if (parsed.length > 0) priceHistory = parsed
  }

  const result: RawProperty = {
    id:              str(['id', 'mls_id', 'listing_id', 'property_id', 'mlsnum']),
    address:         str(['address', 'street_address', 'full_address', 'property_address']),
    city:            str(['city', 'municipality', 'locality']),
    state:           str(['state', 'state_code', 'state_abbr', 'province']),
    zip:             str(['zip', 'zipcode', 'zip_code', 'postal_code']),
    price,
    beds:            num(['beds', 'bedrooms', 'bedroom_count', 'num_beds', 'bed_count']),
    baths:           num(['baths', 'bathrooms', 'bathroom_count', 'num_baths', 'bath_count']),
    sqft:            num(['sqft', 'square_feet', 'living_area', 'sq_ft', 'size_sqft', 'gross_sqft']),
    days_on_market:  num(['days_on_market', 'dom', 'days_listed', 'market_days']),
    price_history:   priceHistory,
    listing_date:    str(['listing_date', 'list_date', 'listed_on', 'listed_date', 'on_market_date'], today),
    last_updated:    str(['last_updated', 'updated_at', 'modified_date', 'last_modified', 'date_modified'], today),
  }

  // Optional fields — only include if present in the source
  const loanBalance = rawListing['loan_balance'] ?? rawListing['mortgage_balance'] ?? rawListing['outstanding_loan']
  if (loanBalance !== undefined) result.loan_balance = parseFloat(String(loanBalance)) || undefined

  const ownerName = rawListing['owner_name'] ?? rawListing['owner'] ?? rawListing['seller_name']
  if (ownerName !== undefined) result.owner_name = String(ownerName).trim() || undefined

  return result
}
