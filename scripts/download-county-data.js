/**
 * download-county-data.js — Fetches county property data CSVs,
 * maps fields to the Supabase `properties` schema, and upserts in batches.
 *
 * Usage:
 *   node scripts/download-county-data.js cook
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
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BATCH_SIZE = 500

// ── FNV-1a 32-bit ID (matches existing scripts) ───────────────────────────────

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

// ── County Config ─────────────────────────────────────────────────────────────
//
// Each county entry defines:
//   url        — direct CSV download URL
//   state      — two-letter state code
//   mapRow(r)  — maps raw CSV row → properties schema object (returns null to skip)
//
// Field mapping targets the `properties` table schema:
//   id, address, city, state, zip, estimated_value, price_per_sqft,
//   owner_name, owner_phone, owner_mailing_address, owner_state,
//   years_owned, tax_delinquent, vacancy_signal, inherited, absentee_owner,
//   lead_type, days_on_market, rent_estimate, opportunity_score,
//   loan_balance_estimate, days_in_default, previous_listing_price,
//   price_drop_percent, market_avg_price_per_sqft, agent_name

const COUNTIES = {
  // ── Cook County, IL ─────────────────────────────────────────────────────────
  // Dataset: Assessor - Parcel Sales (nj4t-kc8j)
  // Key fields: pin, class, address, city, nbhd, sale_price, sale_date, year
  cook: {
    label: 'Cook County, IL',
    url: 'https://datacatalog.cookcountyil.gov/api/views/nj4t-kc8j/rows.csv?accessType=DOWNLOAD',
    state: 'IL',
    mapRow(r) {
      // Build address from available columns (Socrata export uses header names directly)
      const address =
        safeStr(r['address'] ?? r['Address'] ?? r['PROP_ADDRESS'] ?? r['prop_address'])
      const city =
        safeStr(r['city'] ?? r['City'] ?? r['CITY'] ?? r['township_name'] ?? r['Township'])
      const zip =
        safeStr(r['zip_code'] ?? r['zip'] ?? r['Zip'] ?? r['ZIP'])

      // Skip rows without a usable address
      if (!address || !city) return null

      const salePrice = safeNum(
        r['sale_price'] ?? r['Sale Price'] ?? r['SALE_PRICE'] ?? r['sale_amt']
      )
      const assessedValue = safeNum(
        r['assessed_value'] ?? r['Assessed Value'] ?? r['tot_assess'] ?? r['mktval']
      )

      const estimatedValue = salePrice ?? assessedValue

      // Skip rows with no value at all
      if (!estimatedValue) return null

      const ownerName = safeStr(
        r['taxpayer_name'] ?? r['owner_name'] ?? r['Owner Name'] ?? r['taxpayer1']
      )
      const taxDelinqRaw = safeStr(r['tax_delinquent'] ?? r['Tax Delinquent'] ?? '')
      const taxDelinquent =
        taxDelinqRaw ? taxDelinqRaw.toLowerCase() === 'true' || taxDelinqRaw === '1' : null

      const addr = `${address}, ${city}, IL`
      return {
        id: computeId(addr, city),
        address,
        city,
        state: 'IL',
        zip: zip ?? '',
        estimated_value: estimatedValue,
        owner_name: ownerName,
        tax_delinquent: taxDelinquent,
        lead_type: 'county_record',
        absentee_owner: null,
        vacancy_signal: null,
        inherited: null,
        loan_balance_estimate: null,
        days_in_default: null,
        days_on_market: null,
        previous_listing_price: null,
        price_drop_percent: null,
        price_per_sqft: null,
        market_avg_price_per_sqft: null,
        rent_estimate: null,
        opportunity_score: null,
        agent_name: null,
        owner_phone: null,
        owner_mailing_address: null,
        owner_state: null,
        years_owned: null,
      }
    },
  },

  // ── Dallas County, TX ────────────────────────────────────────────────────────
  // Dataset: Dallas CAD bulk download
  // NOTE: Dallas CAD uses a file portal at dallascad.org — update the url below
  // with the direct CSV/TSV link once obtained from the DataProducts.aspx page.
  // Typical direct URL pattern:
  //   https://www.dallascad.org/AcctDetailRes.aspx  (no bulk CSV)
  //   Bulk exports are available as zip files; extract and point to the CSV.
  dallas: {
    label: 'Dallas County, TX',
    url: 'https://www.dallascad.org/Downloads/Misc/2024_Certified_Values_-_All_Real_Accounts.zip',
    state: 'TX',
    isZip: true, // flag — not yet auto-extracted; see TODO below
    mapRow(r) {
      const address = safeStr(
        r['situs_address'] ?? r['SITUS_ADDRESS'] ?? r['property_address'] ?? r['ADDRESS']
      )
      const city = safeStr(
        r['situs_city'] ?? r['SITUS_CITY'] ?? r['city'] ?? r['CITY']
      )
      const zip = safeStr(r['situs_zip'] ?? r['SITUS_ZIP'] ?? r['zip'] ?? r['ZIP'])

      if (!address || !city) return null

      const marketValue = safeNum(
        r['appraised_value'] ?? r['APPRAISED_VALUE'] ?? r['market_value'] ?? r['MARKET_VALUE']
      )
      if (!marketValue) return null

      const ownerName = safeStr(
        r['owner_name'] ?? r['OWNER_NAME'] ?? r['owner1_name']
      )
      const ownerAddr = safeStr(
        r['owner_address'] ?? r['OWNER_ADDRESS'] ?? r['mail_address']
      )
      const ownerState = safeStr(r['owner_state'] ?? r['OWNER_STATE'])

      const addr = `${address}, ${city}, TX`
      return {
        id: computeId(addr, city),
        address,
        city,
        state: 'TX',
        zip: zip ?? '',
        estimated_value: marketValue,
        owner_name: ownerName,
        owner_mailing_address: ownerAddr,
        owner_state: ownerState,
        tax_delinquent: null,
        lead_type: 'county_record',
        absentee_owner: null,
        vacancy_signal: null,
        inherited: null,
        loan_balance_estimate: null,
        days_in_default: null,
        days_on_market: null,
        previous_listing_price: null,
        price_drop_percent: null,
        price_per_sqft: null,
        market_avg_price_per_sqft: null,
        rent_estimate: null,
        opportunity_score: null,
        agent_name: null,
        owner_phone: null,
        years_owned: null,
      }
    },
  },

  // ── Maricopa County, AZ ───────────────────────────────────────────────────────
  // Dataset: Maricopa County GIS Open Data parcels
  // The ArcGIS portal provides CSV exports. A direct CSV URL can be obtained by:
  //   1. Going to https://data-maricopa.opendata.arcgis.com/
  //   2. Searching "parcels"
  //   3. Clicking Download → CSV and copying the URL
  // Update the url below with the actual download link.
  maricopa: {
    label: 'Maricopa County, AZ',
    url: 'https://opendata.arcgis.com/datasets/YOUR_DATASET_ID_HERE.csv',
    state: 'AZ',
    mapRow(r) {
      const address = safeStr(
        r['situs_address'] ?? r['SITUS_STADDR'] ?? r['SITUS_ADDR'] ?? r['address']
      )
      const city = safeStr(
        r['situs_city'] ?? r['SITUS_CITY'] ?? r['city']
      )
      const zip = safeStr(
        r['situs_zip'] ?? r['SITUS_ZIP'] ?? r['zip']
      )

      if (!address || !city) return null

      const assessedValue = safeNum(
        r['assessed_value'] ?? r['ASSESSED_VALUE'] ?? r['full_cash_value'] ?? r['FULL_CASH_VALUE']
      )
      if (!assessedValue) return null

      const sqft = safeNum(r['bldg_area'] ?? r['BLDG_AREA'] ?? r['sq_ft'] ?? r['SQFT'])
      const pricePerSqft =
        sqft && sqft > 0 ? Math.round((assessedValue / sqft) * 100) / 100 : null

      const ownerName = safeStr(
        r['owner_name'] ?? r['OWNER_NAME'] ?? r['own_name1']
      )
      const ownerAddr = safeStr(
        r['owner_address'] ?? r['MAIL_ADDR'] ?? r['mail_address']
      )

      const addr = `${address}, ${city}, AZ`
      return {
        id: computeId(addr, city),
        address,
        city,
        state: 'AZ',
        zip: zip ?? '',
        estimated_value: assessedValue,
        price_per_sqft: pricePerSqft,
        owner_name: ownerName,
        owner_mailing_address: ownerAddr,
        owner_state: null,
        tax_delinquent: null,
        lead_type: 'county_record',
        absentee_owner: null,
        vacancy_signal: null,
        inherited: null,
        loan_balance_estimate: null,
        days_in_default: null,
        days_on_market: null,
        previous_listing_price: null,
        price_drop_percent: null,
        market_avg_price_per_sqft: null,
        rent_estimate: null,
        opportunity_score: null,
        agent_name: null,
        owner_phone: null,
        years_owned: null,
      }
    },
  },
}

// ── Fetch + Stream Parse ───────────────────────────────────────────────────────

async function processCounty(countyKey) {
  const config = COUNTIES[countyKey]
  if (!config) {
    console.error(`Unknown county: ${countyKey}. Options: ${Object.keys(COUNTIES).join(', ')}`)
    return
  }

  if (config.isZip) {
    console.warn(
      `\n⚠  ${config.label}: URL points to a ZIP file.\n` +
      `   Auto-extraction is not implemented. Extract the CSV manually and re-run,\n` +
      `   or update the 'url' in the config to point directly to the CSV.\n`
    )
    return
  }

  if (config.url.includes('YOUR_DATASET_ID_HERE')) {
    console.warn(
      `\n⚠  ${config.label}: URL not yet configured.\n` +
      `   Update the 'url' in COUNTIES.${countyKey} with a direct CSV download link.\n`
    )
    return
  }

  console.log(`\n── ${config.label} ─────────────────────────────────`)
  console.log(`Fetching: ${config.url}`)

  const res = await fetch(config.url)
  if (!res.ok) {
    console.error(`HTTP ${res.status} fetching ${config.label}: ${res.statusText}`)
    return
  }

  const csvText = await res.text()
  console.log(`Downloaded ${(csvText.length / 1024 / 1024).toFixed(2)} MB — parsing...`)

  // Log first row of headers for debugging / mapping verification
  const firstNewline = csvText.indexOf('\n')
  if (firstNewline !== -1) {
    console.log(`Headers: ${csvText.slice(0, firstNewline).trim()}`)
  }

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  })

  if (parsed.errors.length > 0) {
    console.warn(`Parse warnings (first 3): ${parsed.errors.slice(0, 3).map(e => e.message).join('; ')}`)
  }

  const rows = parsed.data
  console.log(`Parsed ${rows.length} rows`)

  let processed = 0
  let upserted = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const rawBatch = rows.slice(i, i + BATCH_SIZE)

    const mapped = []
    for (const row of rawBatch) {
      try {
        const record = config.mapRow(row)
        if (record) {
          mapped.push(record)
        } else {
          skipped++
        }
      } catch (err) {
        skipped++
      }
    }

    processed += rawBatch.length

    if (mapped.length === 0) {
      process.stdout.write(`\r  Processed ${processed} / ${rows.length} rows  (${skipped} skipped)`)
      continue
    }

    const { error } = await supabase
      .from('properties')
      .upsert(mapped, { onConflict: 'id' })

    if (error) {
      errors++
      console.error(`\n  Batch error at row ${i}: ${error.message}`)
    } else {
      upserted += mapped.length
    }

    process.stdout.write(
      `\r  Processed ${processed} / ${rows.length} rows  |  upserted ${upserted}  |  skipped ${skipped}  |  errors ${errors}`
    )
  }

  console.log(`\n\nDone — ${upserted} upserted, ${skipped} skipped, ${errors} batch errors`)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2]

  if (!arg) {
    console.error(`Usage: node scripts/download-county-data.js <county|all>`)
    console.error(`Available: ${Object.keys(COUNTIES).join(', ')}, all`)
    process.exit(1)
  }

  const targets = arg === 'all' ? Object.keys(COUNTIES) : [arg]

  for (const county of targets) {
    await processCounty(county)
  }

  console.log('\nAll done.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
