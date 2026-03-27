/**
 * seedSupabase.ts — Upserts all records from generated-signals.json
 * into the Supabase `properties` table in batches of 500.
 *
 * Usage:
 *   npx ts-node scripts/seedSupabase.ts
 *
 * Requires:
 *   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// FNV-1a 32-bit — matches lib/utils/signalId.ts
function computeSignalId(address: string, city: string): string {
  const str = `${address}||${city}`
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

interface RawSignal {
  id?: string
  address: string
  city: string
  zip: string
  owner_name: string | null
  estimated_value: number
  loan_balance_estimate: number | null
  days_in_default: number | null
  previous_listing_price: number | null
  days_on_market: number | null
  agent_name: string | null
  lead_type: string
  price_per_sqft: number | null
  market_avg_price_per_sqft: number | null
  price_drop_percent: number | null
  rent_estimate: number | null
  opportunity_score: number | null
  owner_phone: string | null
  owner_mailing_address: string | null
  owner_state: string | null
  years_owned: number | null
  tax_delinquent: boolean | null
  vacancy_signal: boolean | null
  inherited: boolean | null
  absentee_owner: boolean | null
}

const BATCH_SIZE = 500

async function seed() {
  const filePath = join(process.cwd(), 'lib', 'data', 'generated-signals.json')
  const raw: RawSignal[] = JSON.parse(readFileSync(filePath, 'utf-8'))
  console.log(`Loaded ${raw.length} records from generated-signals.json`)

  let upserted = 0

  for (let i = 0; i < raw.length; i += BATCH_SIZE) {
    const batch = raw.slice(i, i + BATCH_SIZE).map((r) => ({
      id: r.id ?? computeSignalId(r.address, r.city),
      address: r.address,
      city: r.city,
      zip: r.zip,
      owner_name: r.owner_name,
      estimated_value: r.estimated_value,
      loan_balance_estimate: r.loan_balance_estimate,
      days_in_default: r.days_in_default,
      previous_listing_price: r.previous_listing_price,
      days_on_market: r.days_on_market,
      agent_name: r.agent_name,
      lead_type: r.lead_type,
      price_per_sqft: r.price_per_sqft,
      market_avg_price_per_sqft: r.market_avg_price_per_sqft,
      price_drop_percent: r.price_drop_percent,
      rent_estimate: r.rent_estimate,
      opportunity_score: r.opportunity_score,
      owner_phone: r.owner_phone,
      owner_mailing_address: r.owner_mailing_address,
      owner_state: r.owner_state,
      years_owned: r.years_owned,
      tax_delinquent: r.tax_delinquent,
      vacancy_signal: r.vacancy_signal,
      inherited: r.inherited,
      absentee_owner: r.absentee_owner,
    }))

    const { error } = await supabase
      .from('properties')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`Error at batch starting index ${i}:`, error.message)
      process.exit(1)
    }

    upserted += batch.length
    console.log(`Upserted ${upserted} / ${raw.length} records`)
  }

  console.log(`Done — ${upserted} records seeded.`)
}

seed()
