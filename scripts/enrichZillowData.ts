/**
 * enrichZillowData.ts — Fetches Zillow Research CSVs (ZHVI, ZORI, Market Temp)
 * and upserts matched metro data into the Supabase zillow_market_data table.
 *
 * Usage:
 *   npx ts-node scripts/enrichZillowData.ts
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

// ── Env ──────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ── CSV URLs ─────────────────────────────────────────────────────────────────

const ZHVI_URL =
  'https://files.zillowstatic.com/research/public_csvs/zhvi/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv'
const ZORI_URL =
  'https://files.zillowstatic.com/research/public_csvs/zori/Metro_zori_uc_sfrcondomfr_sm_month.csv'
const MARKET_TEMP_URL =
  'https://files.zillowstatic.com/research/public_csvs/market_temp_index/Metro_market_temp_index_uc_sfrcondo_month.csv'

// ── Metro name → city mapping ────────────────────────────────────────────────

const METRO_TO_CITY: Record<string, string> = {
  'Phoenix, AZ': 'Phoenix',
  'Miami-Fort Lauderdale, FL': 'Miami',
  'Dallas-Fort Worth, TX': 'Dallas',
  'Atlanta-Sandy Springs-Roswell, GA': 'Atlanta',
  'Atlanta, GA': 'Atlanta',
  'Chicago, IL': 'Chicago',
  'Cleveland, OH': 'Cleveland',
  'Los Angeles-Long Beach-Anaheim, CA': 'Los Angeles',
  'Los Angeles, CA': 'Los Angeles',
  'New York, NY': 'New York',
  'Tampa, FL': 'Tampa',
  'Tampa-St. Petersburg-Clearwater, FL': 'Tampa',
  'Nashville, TN': 'Nashville',
  'Nashville-Davidson--Murfreesboro--Franklin, TN': 'Nashville',
  'Jacksonville, FL': 'Jacksonville',
  'Denver, CO': 'Denver',
  'Denver-Aurora-Lakewood, CO': 'Denver',
  'Houston, TX': 'Houston',
  'San Antonio, TX': 'San Antonio',
  'San Antonio-New Braunfels, TX': 'San Antonio',
  'Seattle, WA': 'Seattle',
  'Seattle-Tacoma-Bellevue, WA': 'Seattle',
  'Charlotte, NC': 'Charlotte',
  'Charlotte-Concord-Gastonia, NC-SC': 'Charlotte',
  'Indianapolis, IN': 'Indianapolis',
  'Indianapolis-Carmel-Anderson, IN': 'Indianapolis',
  'Columbus, OH': 'Columbus',
  'Baltimore, MD': 'Baltimore',
  'Baltimore-Columbia-Towson, MD': 'Baltimore',
  'Memphis, TN': 'Memphis',
  'Memphis, TN-MS-AR': 'Memphis',
  'Raleigh, NC': 'Raleigh',
  'Raleigh-Cary, NC': 'Raleigh',
  'Pittsburgh, PA': 'Pittsburgh',
  'Las Vegas, NV': 'Las Vegas',
  'Las Vegas-Henderson-Paradise, NV': 'Las Vegas',
  'Salt Lake City, UT': 'Salt Lake City',
  'Kansas City, MO': 'Kansas City',
  'Kansas City, MO-KS': 'Kansas City',
  'Detroit, MI': 'Detroit',
  'Detroit-Warren-Dearborn, MI': 'Detroit',
  'Minneapolis, MN': 'Minneapolis',
  'Minneapolis-St. Paul-Bloomington, MN-WI': 'Minneapolis',
  'Portland, OR': 'Portland',
  'Portland-Vancouver-Hillsboro, OR-WA': 'Portland',
  'New Orleans, LA': 'New Orleans',
  'New Orleans-Metairie, LA': 'New Orleans',
  'Austin, TX': 'Austin',
  'Austin-Round Rock-Georgetown, TX': 'Austin',
  'Boston, MA': 'Boston',
  'Boston-Cambridge-Newton, MA-NH': 'Boston',
  'Milwaukee, WI': 'Milwaukee',
  'Milwaukee-Waukesha, WI': 'Milwaukee',
  'Louisville, KY': 'Louisville',
  'Louisville/Jefferson County, KY-IN': 'Louisville',
  'Omaha, NE': 'Omaha',
  'Omaha-Council Bluffs, NE-IA': 'Omaha',
  'Boise, ID': 'Boise',
  'Boise City, ID': 'Boise',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function matchCity(regionName: string): string | null {
  // Direct match
  if (METRO_TO_CITY[regionName]) return METRO_TO_CITY[regionName]

  // Fuzzy: check if any key starts with the same prefix
  for (const [metro, city] of Object.entries(METRO_TO_CITY)) {
    if (regionName.startsWith(metro.split(',')[0]) || metro.startsWith(regionName.split(',')[0])) {
      return city
    }
  }
  return null
}

async function fetchCsv(url: string): Promise<string> {
  console.log(`Fetching ${url.split('/').pop()} ...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.text()
}

function parseLatestValues(csvText: string): Map<string, number> {
  const result = new Map<string, number>()

  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true,
  })

  if (parsed.data.length < 2) return result

  const headers = parsed.data[0]
  const regionCol = headers.findIndex(
    (h) => h === 'RegionName' || h === 'region_name'
  )
  // Last column is the most recent month
  const lastCol = headers.length - 1

  if (regionCol === -1) {
    console.warn('Could not find RegionName column')
    return result
  }

  for (let i = 1; i < parsed.data.length; i++) {
    const row = parsed.data[i]
    const regionName = row[regionCol]?.trim()
    const rawValue = row[lastCol]?.trim()

    if (!regionName || !rawValue) continue

    const value = parseFloat(rawValue)
    if (isNaN(value)) continue

    const city = matchCity(regionName)
    if (city) {
      result.set(city, value)
    }
  }

  return result
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting Zillow data enrichment...\n')

  const [zhviCsv, zoriCsv, tempCsv] = await Promise.all([
    fetchCsv(ZHVI_URL),
    fetchCsv(ZORI_URL),
    fetchCsv(MARKET_TEMP_URL),
  ])

  const zhviMap = parseLatestValues(zhviCsv)
  const zoriMap = parseLatestValues(zoriCsv)
  const tempMap = parseLatestValues(tempCsv)

  console.log(`\nMatched metros — ZHVI: ${zhviMap.size}, ZORI: ${zoriMap.size}, Market Temp: ${tempMap.size}`)

  // Collect all cities that appeared in at least one dataset
  const allCities = new Set([...zhviMap.keys(), ...zoriMap.keys(), ...tempMap.keys()])

  const rows = [...allCities].map((city) => ({
    metro_name: city,
    median_home_value: zhviMap.get(city) ?? null,
    typical_rent: zoriMap.get(city) ?? null,
    market_temp_index: tempMap.get(city) ?? null,
    last_updated: new Date().toISOString(),
  }))

  if (rows.length === 0) {
    console.log('No matching metros found — nothing to upsert.')
    return
  }

  const { error } = await supabase
    .from('zillow_market_data')
    .upsert(rows, { onConflict: 'metro_name' })

  if (error) {
    console.error('Supabase upsert error:', error.message)
    process.exit(1)
  }

  console.log(`\nDone — upserted ${rows.length} metros into zillow_market_data.`)
  for (const row of rows) {
    console.log(
      `  ${row.metro_name}: ZHVI=${row.median_home_value ?? '—'}, ZORI=${row.typical_rent ?? '—'}, Temp=${row.market_temp_index ?? '—'}`
    )
  }
}

main()
