/**
 * download-county-data.js — Fetches county property data,
 * maps fields to the Supabase `properties` schema, and upserts in batches.
 *
 * Usage:
 *   node scripts/download-county-data.js cook
 *   node scripts/download-county-data.js cook --limit 500
 *   node scripts/download-county-data.js dallas
 *   node scripts/download-county-data.js maricopa
 *   node scripts/download-county-data.js all
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

// ── Env ───────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('✗ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BATCH_SIZE       = 100
const FETCH_TIMEOUT_MS = 30_000  // 30 seconds per request
const PROGRESS_EVERY   = 1000    // log a line every N rows processed

// ── FNV-1a 32-bit ID ──────────────────────────────────────────────────────────

function computeId(address, city) {
  const str = `${address}||${city}`
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeNum(val) {
  if (val === null || val === undefined || val === '') return null
  const n = parseFloat(String(val).replace(/[$,]/g, ''))
  return isNaN(n) ? null : n
}

function safeInt(val) {
  if (val === null || val === undefined || val === '') return null
  const n = parseInt(String(val).replace(/[$,]/g, ''), 10)
  return isNaN(n) ? null : n
}

function safeStr(val) {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  return s === '' ? null : s
}

/** fetch() with an AbortController timeout. Throws descriptive errors. */
async function fetchWithTimeout(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    return res
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      throw new Error(
        `Request timed out after ${timeoutMs / 1000}s.\n` +
        `  Tip: use --limit to fetch fewer rows, or check your network connection.`
      )
    }
    throw new Error(`Network error: ${err.message}`)
  }
}

// ── County Config ─────────────────────────────────────────────────────────────

const COUNTIES = {

  // ── Cook County, IL ─────────────────────────────────────────────────────────
  // Uses the Socrata JSON API (paginated) instead of the bulk CSV download.
  // Socrata endpoint: /resource/<dataset-id>.json?$limit=N&$offset=N
  cook: {
    label:       'Cook County, IL',
    // Dataset: Assessor - Parcel Sales (5pge-nu6u)
    // Fields confirmed: addr, sale_price, est_land, est_bldg, zip_code (not present — derived)
    url:         'https://datacatalog.cookcountyil.gov/api/views/5pge-nu6u/rows.csv?accessType=DOWNLOAD',
    socrataUrl:  'https://datacatalog.cookcountyil.gov/resource/5pge-nu6u.json',
    useSocrata:  true,
    state:       'IL',
    mapRow(r) {
      // Confirmed field name from API: 'addr'
      const address = safeStr(r['addr'] ?? r['address'] ?? r['Address'])
      if (!address) return null

      // This dataset has no city column — default to Chicago (dominant Cook County city)
      const city = 'Chicago'

      // Use Cook County parcel number (pin / pin14) as the unique ID.
      // It is already unique per parcel so it avoids intra-batch hash collisions.
      // Fall back to hash of address+zip if the pin field is missing.
      const rawPin = safeStr(r['pin'] ?? r['pin14'] ?? r['PIN'] ?? r['PIN14'])
      const id = rawPin
        ? `cook-${rawPin.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, IL`, city)

      // Sale price is the primary value; fall back to land + building estimate
      const salePrice = safeNum(r['sale_price'])
      const estLand   = safeNum(r['est_land'])
      const estBldg   = safeNum(r['est_bldg'])
      const assessedValue = (estLand != null && estBldg != null) ? estLand + estBldg : null
      const estimatedValue = salePrice ?? assessedValue
      if (!estimatedValue || estimatedValue <= 0) return null

      // Square footage for price/sqft
      const sqft = safeNum(r['hd_sf'])
      const pricePerSqft = sqft && sqft > 0
        ? Math.round(estimatedValue / sqft) : null

      return {
        id,
        address, city,
        zip: '',
        estimated_value: Math.round(estimatedValue),
        price_per_sqft: pricePerSqft,
        owner_name: null,
        tax_delinquent: null,
        lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, owner_mailing_address: null,
        owner_state: null, years_owned: null,
      }
    },
  },

  // ── Dallas County, TX ────────────────────────────────────────────────────────
  dallas: {
    label:  'Dallas County, TX',
    url:    'https://www.dallascad.org/Downloads/Misc/2024_Certified_Values_-_All_Real_Accounts.zip',
    state:  'TX',
    isZip:  true,
    mapRow(r) {
      const address = safeStr(
        r['situs_address'] ?? r['SITUS_ADDRESS'] ?? r['property_address'] ?? r['ADDRESS']
      )
      const city = safeStr(r['situs_city'] ?? r['SITUS_CITY'] ?? r['city'] ?? r['CITY'])
      const zip  = safeStr(r['situs_zip']  ?? r['SITUS_ZIP']  ?? r['zip']  ?? r['ZIP'])
      if (!address || !city) return null

      const marketValue = safeNum(
        r['appraised_value'] ?? r['APPRAISED_VALUE'] ?? r['market_value'] ?? r['MARKET_VALUE']
      )
      if (!marketValue) return null

      const ownerName  = safeStr(r['owner_name']    ?? r['OWNER_NAME']    ?? r['owner1_name'])
      const ownerAddr  = safeStr(r['owner_address'] ?? r['OWNER_ADDRESS'] ?? r['mail_address'])
      const ownerState = safeStr(r['owner_state']   ?? r['OWNER_STATE'])

      const addr = `${address}, ${city}, TX`
      return {
        id: computeId(addr, city),
        address, city,
        zip: zip ?? '',
        estimated_value: Math.round(marketValue),
        owner_name: ownerName, owner_mailing_address: ownerAddr, owner_state: ownerState,
        tax_delinquent: null, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null, price_per_sqft: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },

  // ── Maricopa County, AZ ──────────────────────────────────────────────────────
  maricopa: {
    label: 'Maricopa County, AZ',
    url:   'https://opendata.arcgis.com/datasets/YOUR_DATASET_ID_HERE.csv',
    state: 'AZ',
    mapRow(r) {
      const address = safeStr(
        r['situs_address'] ?? r['SITUS_STADDR'] ?? r['SITUS_ADDR'] ?? r['address']
      )
      const city = safeStr(r['situs_city'] ?? r['SITUS_CITY'] ?? r['city'])
      const zip  = safeStr(r['situs_zip']  ?? r['SITUS_ZIP']  ?? r['zip'])
      if (!address || !city) return null

      const assessedValue = safeNum(
        r['assessed_value'] ?? r['ASSESSED_VALUE'] ?? r['full_cash_value'] ?? r['FULL_CASH_VALUE']
      )
      if (!assessedValue) return null

      const sqft = safeNum(r['bldg_area'] ?? r['BLDG_AREA'] ?? r['sq_ft'] ?? r['SQFT'])
      const pricePerSqft = sqft && sqft > 0
        ? Math.round(assessedValue / sqft) : null

      const ownerName = safeStr(r['owner_name'] ?? r['OWNER_NAME'] ?? r['own_name1'])
      const ownerAddr = safeStr(r['owner_address'] ?? r['MAIL_ADDR'] ?? r['mail_address'])

      const addr = `${address}, ${city}, AZ`
      return {
        id: computeId(addr, city),
        address, city,
        zip: zip ?? '',
        estimated_value: Math.round(assessedValue),
        price_per_sqft: pricePerSqft,
        owner_name: ownerName, owner_mailing_address: ownerAddr, owner_state: null,
        tax_delinquent: null, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },
}

// ── Socrata JSON API processor ────────────────────────────────────────────────
//
// Paginates through /resource/<id>.json?$limit=PAGE&$offset=N until
// no more rows or the optional --limit cap is reached.

async function processCountySocrata(countyKey, rowLimit) {
  const config    = COUNTIES[countyKey]
  const PAGE_SIZE = 100
  let offset         = 0
  let totalFetched   = 0
  let totalUpserted  = 0
  let totalSkipped   = 0
  let totalErrors    = 0
  let lastProgressAt = 0

  const effectiveLimit = rowLimit ?? Infinity

  console.log(`\n── ${config.label} (Socrata JSON API) ${'─'.repeat(20)}`)
  if (rowLimit) console.log(`  Row limit: ${rowLimit}`)
  console.log(`  Endpoint: ${config.socrataUrl}`)

  while (totalFetched < effectiveLimit) {
    const thisPage = Math.min(PAGE_SIZE, effectiveLimit - totalFetched)
    const url = `${config.socrataUrl}?$limit=${thisPage}&$offset=${offset}`

    process.stdout.write(`  Fetching offset=${offset}… `)

    let res
    try {
      res = await fetchWithTimeout(url)
    } catch (err) {
      console.error(`\n✗ ${err.message}`)
      break
    }

    if (!res.ok) {
      console.error(`\n✗ HTTP ${res.status} ${res.statusText} at offset=${offset}`)
      console.error(`  URL: ${url}`)
      break
    }

    let page
    try {
      page = await res.json()
    } catch (err) {
      console.error(`\n✗ Failed to parse JSON response: ${err.message}`)
      break
    }

    if (!Array.isArray(page) || page.length === 0) {
      console.log('no more records.')
      break
    }

    console.log(`got ${page.length} rows.`)

    // Map to schema
    const batch = []
    for (const row of page) {
      try {
        const record = config.mapRow(row)
        if (record) batch.push(record)
        else totalSkipped++
      } catch {
        totalSkipped++
      }
    }

    totalFetched += page.length
    offset       += page.length

    // Upsert to Supabase
    if (batch.length > 0) {
      const { error } = await supabase
        .from('properties')
        .upsert(batch, { onConflict: 'id' })

      if (error) {
        totalErrors++
        console.error(`  ✗ Upsert error: ${error.message}`)
      } else {
        totalUpserted += batch.length
      }
    }

    // Progress log every PROGRESS_EVERY rows
    if (totalFetched - lastProgressAt >= PROGRESS_EVERY || page.length < thisPage) {
      console.log(
        `  ── ${totalFetched} fetched | ${totalUpserted} upserted | ${totalSkipped} skipped | ${totalErrors} errors`
      )
      lastProgressAt = totalFetched
    }

    // End of dataset
    if (page.length < thisPage) break
  }

  console.log(
    `\n✓ Done — ${totalUpserted} upserted, ${totalSkipped} skipped, ${totalErrors} errors`
  )
}

// ── CSV processor ─────────────────────────────────────────────────────────────

async function processCountyCSV(countyKey, rowLimit) {
  const config = COUNTIES[countyKey]

  console.log(`\n── ${config.label} (CSV) ${'─'.repeat(30)}`)
  if (rowLimit) console.log(`  Row limit: ${rowLimit}`)
  console.log(`  Fetching: ${config.url}`)
  console.log(`  (30s timeout — will abort if server doesn't respond)`)

  let res
  try {
    res = await fetchWithTimeout(config.url)
  } catch (err) {
    console.error(`✗ ${err.message}`)
    return
  }

  if (!res.ok) {
    console.error(`✗ HTTP ${res.status} ${res.statusText}`)
    console.error(`  The server rejected the request. Check the URL in COUNTIES.${countyKey}.url`)
    return
  }

  let csvText
  try {
    process.stdout.write('  Downloading… ')
    csvText = await res.text()
    console.log(`${(csvText.length / 1024 / 1024).toFixed(2)} MB received.`)
  } catch (err) {
    console.error(`\n✗ Failed to read response body: ${err.message}`)
    return
  }

  // Log headers for mapping verification
  const firstNl = csvText.indexOf('\n')
  if (firstNl !== -1) {
    console.log(`  Headers: ${csvText.slice(0, firstNl).trim()}`)
  }

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  if (parsed.errors.length > 0) {
    console.warn(`  Parse warnings: ${parsed.errors.slice(0, 3).map((e) => e.message).join('; ')}`)
  }

  const allRows = parsed.data
  const rows    = rowLimit ? allRows.slice(0, rowLimit) : allRows
  console.log(`  Parsed ${rows.length} rows${rowLimit ? ` (limited from ${allRows.length})` : ''}.`)

  let processed    = 0
  let upserted     = 0
  let skipped      = 0
  let errors       = 0
  let lastProgress = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const rawBatch = rows.slice(i, i + BATCH_SIZE)
    const mapped   = []

    for (const row of rawBatch) {
      try {
        const record = config.mapRow(row)
        if (record) mapped.push(record)
        else skipped++
      } catch {
        skipped++
      }
    }

    processed += rawBatch.length

    if (mapped.length > 0) {
      const { error } = await supabase
        .from('properties')
        .upsert(mapped, { onConflict: 'id' })

      if (error) {
        errors++
        console.error(`\n  ✗ Batch error at row ${i}: ${error.message}`)
      } else {
        upserted += mapped.length
      }
    }

    // Progress every PROGRESS_EVERY rows
    if (processed - lastProgress >= PROGRESS_EVERY || processed === rows.length) {
      console.log(
        `  ── ${processed} / ${rows.length} | upserted ${upserted} | skipped ${skipped} | errors ${errors}`
      )
      lastProgress = processed
    }
  }

  console.log(`\n✓ Done — ${upserted} upserted, ${skipped} skipped, ${errors} errors`)
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

async function processCounty(countyKey, rowLimit) {
  const config = COUNTIES[countyKey]
  if (!config) {
    console.error(`✗ Unknown county: "${countyKey}". Available: ${Object.keys(COUNTIES).join(', ')}`)
    return
  }

  if (config.isZip) {
    console.warn(
      `\n⚠  ${config.label}: source is a ZIP file — auto-extraction not implemented.\n` +
      `   Extract the CSV manually and update COUNTIES.${countyKey}.url to point to the CSV.`
    )
    return
  }

  if (config.url.includes('YOUR_DATASET_ID_HERE')) {
    console.warn(
      `\n⚠  ${config.label}: URL not configured.\n` +
      `   Update COUNTIES.${countyKey}.url with a direct download link.`
    )
    return
  }

  if (config.useSocrata) {
    await processCountySocrata(countyKey, rowLimit)
  } else {
    await processCountyCSV(countyKey, rowLimit)
  }
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)

  // Parse --limit N
  const limitIdx = args.indexOf('--limit')
  const rowLimit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null
  if (rowLimit !== null && (isNaN(rowLimit) || rowLimit < 1)) {
    console.error('✗ --limit must be a positive integer')
    process.exit(1)
  }

  // First positional arg (not a flag)
  const target = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--limit')

  if (!target) {
    console.error(`Usage: node scripts/download-county-data.js <county|all> [--limit N]`)
    console.error(`Available counties: ${Object.keys(COUNTIES).join(', ')}`)
    process.exit(1)
  }

  const targets = target === 'all' ? Object.keys(COUNTIES) : [target]

  for (const county of targets) {
    await processCounty(county, rowLimit ?? null)
  }

  console.log('\nAll done.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
