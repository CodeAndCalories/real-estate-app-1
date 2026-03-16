/**
 * generateSignals.ts
 *
 * Generates mock property signal records for testing.
 * Run with: npx ts-node scripts/generateSignals.ts
 *
 * Output: writes to lib/data/generated-signals.json
 */

import fs from 'fs'
import path from 'path'

const CITIES = [
  { name: 'Miami', state: 'FL', zips: ['33101', '33125', '33130', '33145', '33160'] },
  { name: 'Atlanta', state: 'GA', zips: ['30301', '30310', '30318', '30339', '30354'] },
  { name: 'Houston', state: 'TX', zips: ['77001', '77019', '77027', '77056', '77080'] },
  { name: 'Phoenix', state: 'AZ', zips: ['85001', '85013', '85032', '85044', '85085'] },
  { name: 'Dallas', state: 'TX', zips: ['75201', '75209', '75218', '75228', '75243'] },
  { name: 'Chicago', state: 'IL', zips: ['60601', '60614', '60618', '60629', '60640'] },
  { name: 'Tampa', state: 'FL', zips: ['33601', '33609', '33614', '33619', '33629'] },
  { name: 'Las Vegas', state: 'NV', zips: ['89101', '89109', '89117', '89128', '89146'] },
]

const LEAD_TYPES = ['Pre-Foreclosure', 'Expired Listing', 'High Equity', 'Price Drop', 'Vacant']

const STREET_NAMES = [
  'Oak St', 'Maple Ave', 'Cedar Rd', 'Pine Dr', 'Elm Blvd',
  'River Rd', 'Park Ave', 'Lake Dr', 'Hill St', 'Valley Rd',
  'Forest Ln', 'Sunset Blvd', 'Ocean Dr', 'Bay St', 'Spring St',
]

const FIRST_NAMES = ['James', 'Maria', 'Robert', 'Linda', 'Michael', 'Barbara', 'David', 'Susan',
  'Richard', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Lisa']

const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin']

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function maybe<T>(value: T, probability = 0.7): T | null {
  return Math.random() < probability ? value : null
}

function computeScore(p: {
  price_drop_percent: number | null
  days_on_market: number | null
  days_in_default: number | null
  loan_balance_estimate: number | null
  estimated_value: number
  rent_estimate: number | null
}): number {
  let score = 0
  if (p.price_drop_percent && p.price_drop_percent > 10) score += 20
  if (p.days_on_market && p.days_on_market > 90) score += 20
  if (p.days_in_default && p.days_in_default > 60) score += 20
  if (p.loan_balance_estimate && p.loan_balance_estimate < p.estimated_value * 0.6) score += 20
  if (p.rent_estimate && p.rent_estimate >= p.estimated_value * 0.01) score += 20
  return score
}

function generateSignal(index: number) {
  const city = pick(CITIES)
  const lead_type = pick(LEAD_TYPES)
  const estimated_value = rand(180_000, 1_800_000)
  const loan_balance_estimate = maybe(rand(Math.floor(estimated_value * 0.3), Math.floor(estimated_value * 0.9)))
  const price_drop_percent = maybe(rand(3, 35))
  const days_on_market = maybe(rand(14, 300), 0.6)
  const days_in_default = lead_type === 'Pre-Foreclosure' ? rand(30, 300) : maybe(rand(10, 120), 0.3)
  const rent_estimate = maybe(rand(Math.floor(estimated_value * 0.004), Math.floor(estimated_value * 0.015)))

  const record = {
    address: `${rand(100, 9999)} ${pick(STREET_NAMES)}`,
    city: city.name,
    zip: pick(city.zips),
    owner_name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    estimated_value,
    loan_balance_estimate,
    days_in_default,
    previous_listing_price: maybe(Math.floor(estimated_value * (1 + rand(5, 25) / 100))),
    days_on_market,
    agent_name: null,
    lead_type,
    price_per_sqft: null,
    market_avg_price_per_sqft: null,
    price_drop_percent,
    rent_estimate,
    opportunity_score: null as number | null,
  }

  record.opportunity_score = computeScore(record)
  return record
}

function main() {
  const count = parseInt(process.argv[2] ?? '1000', 10)
  console.log(`Generating ${count} mock property signals...`)

  const signals = Array.from({ length: count }, (_, i) => generateSignal(i))

  const outPath = path.resolve(__dirname, '../lib/data/generated-signals.json')
  fs.writeFileSync(outPath, JSON.stringify(signals, null, 2), 'utf-8')

  console.log(`Done. Written to ${outPath}`)
  console.log(`Cities: ${[...new Set(signals.map((s) => s.city))].join(', ')}`)
  console.log(`Lead types: ${[...new Set(signals.map((s) => s.lead_type))].join(', ')}`)
}

main()
