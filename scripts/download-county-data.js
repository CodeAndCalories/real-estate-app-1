/**
 * download-county-data.js — Fetches county property data,
 * maps fields to the Supabase `properties` schema, and upserts in batches.
 *
 * Usage:
 *   node scripts/download-county-data.js cook
 *   node scripts/download-county-data.js cook --limit 500
 *   node scripts/download-county-data.js dallas
 *   node scripts/download-county-data.js maricopa
 *   node scripts/download-county-data.js miami_dade
 *   node scripts/download-county-data.js fulton
 *   node scripts/download-county-data.js king
 *   node scripts/download-county-data.js mecklenburg
 *   node scripts/download-county-data.js travis
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

const BATCH_SIZE       = 50
const FETCH_TIMEOUT_MS = 30_000
const ARCGIS_TIMEOUT_MS = 60_000  // ArcGIS endpoints can be slower
const PROGRESS_EVERY   = 1000

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
  // Socrata JSON API — Assessor Parcel Sales (5pge-nu6u)
  cook: {
    label:       'Cook County, IL',
    url:         'https://datacatalog.cookcountyil.gov/api/views/5pge-nu6u/rows.csv?accessType=DOWNLOAD',
    socrataUrl:  'https://datacatalog.cookcountyil.gov/resource/5pge-nu6u.json',
    useSocrata:  true,
    state:       'IL',
    mapRow(r) {
      const address = safeStr(r['addr'] ?? r['address'] ?? r['Address'])
      if (!address) return null

      const city = 'Chicago'

      const rawPin = safeStr(r['pin'] ?? r['pin14'] ?? r['PIN'] ?? r['PIN14'])
      const id = rawPin
        ? `cook-${rawPin.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, IL`, city)

      const salePrice = safeNum(r['sale_price'])
      const estLand   = safeNum(r['est_land'])
      const estBldg   = safeNum(r['est_bldg'])
      const assessedValue = (estLand != null && estBldg != null) ? estLand + estBldg : null
      const estimatedValue = salePrice ?? assessedValue
      if (!estimatedValue || estimatedValue <= 0) return null

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
  // Socrata JSON API — Dallas Tax Parcels (y9i7-p37p), ~497K records
  // Note: Dallas CAD does not publish assessed values via public API.
  // This dataset has owner name, address, and parcel ID.
  dallas: {
    label:      'Dallas County, TX',
    socrataUrl: 'https://www.dallasopendata.com/resource/y9i7-p37p.json',
    useSocrata: true,
    state:      'TX',
    mapRow(r) {
      // Build situs address from components
      const parts = [
        safeStr(r['st_num']),
        safeStr(r['st_dir']),
        safeStr(r['st_name']),
        safeStr(r['st_type']),
      ].filter(Boolean)
      const address = parts.length > 0 ? parts.join(' ') : null
      if (!address) return null

      const city = safeStr(r['city']) ?? 'Dallas'
      const zip  = safeStr(r['taxpazip'])

      const ownerName = safeStr(r['taxpaname1'])
      const parcelId  = safeStr(r['acct'])
      const id = parcelId
        ? `dallas-${parcelId.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, TX`, city)

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: null,  // Not available in public API
        price_per_sqft: null,
        owner_name: ownerName, owner_mailing_address: null, owner_state: null,
        tax_delinquent: null, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },

  // ── Maricopa County, AZ ──────────────────────────────────────────────────────
  // ArcGIS REST — Maricopa County Assessor, ~1.75M parcels
  // Endpoint: gis.mcassessor.maricopa.gov — confirmed live, fields verified
  maricopa: {
    label:       'Maricopa County, AZ',
    arcgisUrl:   'https://gis.mcassessor.maricopa.gov/arcgis/rest/services/MaricopaDynamicQueryService/MapServer/3/query',
    arcgisFields: 'APN,OWNER_NAME,PHYSICAL_ADDRESS,PHYSICAL_CITY,PHYSICAL_ZIP,FCV_CUR,LPV_CUR',
    useArcGIS:   true,
    state:       'AZ',
    mapRow(r) {
      const address = safeStr(r['PHYSICAL_ADDRESS'])
      const city    = safeStr(r['PHYSICAL_CITY'])
      const zip     = safeStr(r['PHYSICAL_ZIP'])
      if (!address || !city) return null

      // Full Cash Value is the primary market value indicator
      const fcv = safeNum(r['FCV_CUR'])
      const lpv = safeNum(r['LPV_CUR'])
      const assessedValue = fcv ?? lpv
      if (!assessedValue || assessedValue <= 0) return null

      const ownerName = safeStr(r['OWNER_NAME'])
      const apn       = safeStr(r['APN'])
      const id = apn
        ? `maricopa-${apn.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, AZ`, city)

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: Math.round(assessedValue),
        price_per_sqft: null,
        owner_name: ownerName, owner_mailing_address: null, owner_state: null,
        tax_delinquent: null, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },

  // ── Miami-Dade County, FL ────────────────────────────────────────────────────
  // ArcGIS FeatureServer — Miami-Dade Property Point View, ~942K parcels
  // ASSESSED_VAL_CUR is null in current GIS view; using PRICE_1 (last sale price)
  miami_dade: {
    label:        'Miami-Dade County, FL',
    arcgisUrl:    'https://services.arcgis.com/8Pc9XBTAsYuxx9Ny/arcgis/rest/services/PaGISView_gdb/FeatureServer/0/query',
    arcgisFields: 'FOLIO,TRUE_SITE_ADDR,TRUE_SITE_CITY,TRUE_SITE_ZIP_CODE,TRUE_OWNER1,PRICE_1',
    useArcGIS:    true,
    state:        'FL',
    mapRow(r) {
      const address = safeStr(r['TRUE_SITE_ADDR'])
      const city    = safeStr(r['TRUE_SITE_CITY'])
      const zip     = safeStr(r['TRUE_SITE_ZIP_CODE'])
      if (!address || !city) return null

      // Use last sale price as value proxy (assessed value not published in GIS layer)
      const salePrice = safeNum(r['PRICE_1'])

      const ownerName = safeStr(r['TRUE_OWNER1'])
      const folio     = safeStr(r['FOLIO'])
      const id = folio
        ? `miamidade-${folio.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, FL`, city)

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: salePrice && salePrice > 0 ? Math.round(salePrice) : null,
        price_per_sqft: null,
        owner_name: ownerName, owner_mailing_address: null, owner_state: null,
        tax_delinquent: null, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },

  // ── Fulton County, GA (Atlanta) ──────────────────────────────────────────────
  // ArcGIS MapServer — Fulton County PropertyMapViewer, ~372K parcels
  // Note: city/zip not in this layer; defaults to 'Atlanta'
  fulton: {
    label:        'Fulton County, GA',
    arcgisUrl:    'https://gismaps.fultoncountyga.gov/arcgispub2/rest/services/PropertyMapViewer/PropertyMapViewer/MapServer/11/query',
    arcgisFields: 'ParcelID,Address,Owner,TotAppr,TotAssess',
    useArcGIS:    true,
    state:        'GA',
    mapRow(r) {
      const address = safeStr(r['Address'])
      if (!address) return null

      // City/ZIP not available in this layer — Fulton County is primarily Atlanta
      const city = 'Atlanta'

      const appraisedValue = safeNum(r['TotAppr']) ?? safeNum(r['TotAssess'])
      if (!appraisedValue || appraisedValue <= 0) return null

      const ownerName = safeStr(r['Owner'])
      const parcelId  = safeStr(r['ParcelID'])
      const id = parcelId
        ? `fulton-${parcelId.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, GA`, city)

      return {
        id,
        address, city,
        zip: '',
        estimated_value: Math.round(appraisedValue),
        price_per_sqft: null,
        owner_name: ownerName, owner_mailing_address: null, owner_state: null,
        tax_delinquent: null, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },

  // ── King County, WA (Seattle) ────────────────────────────────────────────────
  // ArcGIS MapServer — King County parcel address + property info, ~635K parcels
  // Note: owner name withheld per WA RCW 42.56.070(9) privacy policy
  king: {
    label:        'King County, WA',
    arcgisUrl:    'https://gisdata.kingcounty.gov/arcgis/rest/services/OpenDataPortal/property__parcel_address_area/MapServer/1722/query',
    arcgisFields: 'PIN,ADDR_FULL,CTYNAME,ZIP5,TAX_LNDVAL,TAX_IMPR',
    useArcGIS:    true,
    state:        'WA',
    mapRow(r) {
      const address = safeStr(r['ADDR_FULL'])
      const city    = safeStr(r['CTYNAME'])
      const zip     = safeStr(r['ZIP5'])
      if (!address || !city) return null

      const landVal = safeNum(r['TAX_LNDVAL']) ?? 0
      const imprVal = safeNum(r['TAX_IMPR'])   ?? 0
      const totalVal = landVal + imprVal
      if (totalVal <= 0) return null

      const pin = safeStr(r['PIN'])
      const id  = pin
        ? `king-${pin.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, WA`, city)

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: Math.round(totalVal),
        price_per_sqft: null,
        owner_name: null,  // Withheld per WA privacy law
        owner_mailing_address: null, owner_state: null,
        tax_delinquent: null, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },

  // ── Mecklenburg County, NC (Charlotte) ──────────────────────────────────────
  // ArcGIS MapServer — Charlotte PLN/VacantLand, ~24K parcels
  // Note: This is the only public layer with owner + value fields;
  //       the full ~350K parcel roll is behind the POLARIS portal (no bulk API).
  mecklenburg: {
    label:        'Mecklenburg County, NC',
    arcgisUrl:    'https://gis.charlottenc.gov/arcgis/rest/services/PLN/VacantLand/MapServer/0/query',
    arcgisFields: 'nc_pin,FULL_ADDRESS,city,zipcode,totalvalue,ownerlastname,ownerfirstname',
    useArcGIS:    true,
    state:        'NC',
    mapRow(r) {
      const address = safeStr(r['FULL_ADDRESS'])
      const city    = safeStr(r['city'])
      const zip     = safeStr(r['zipcode'])
      if (!address || !city) return null

      const totalValue = safeNum(r['totalvalue'])
      if (!totalValue || totalValue <= 0) return null

      const lastName  = safeStr(r['ownerlastname'])
      const firstName = safeStr(r['ownerfirstname'])
      const ownerName = [firstName, lastName].filter(Boolean).join(' ') || null

      const pin = safeStr(r['nc_pin'])
      const id  = pin
        ? `mecklenburg-${pin.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, NC`, city)

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: Math.round(totalValue),
        price_per_sqft: null,
        owner_name: ownerName, owner_mailing_address: null, owner_state: null,
        tax_delinquent: null, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: null, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },

  // ── Travis County, TX (Austin) ───────────────────────────────────────────────
  // ArcGIS MapServer — TCAD public parcels, ~382K parcels
  // Note: owner name and assessed value not in public GIS layer (TCAD policy).
  //       Full data (owner + value) available as ZIP from traviscad.org/publicinformation/
  travis: {
    label:        'Travis County, TX',
    arcgisUrl:    'https://gis.traviscountytx.gov/server1/rest/services/Boundaries_and_Jurisdictions/TCAD_public/MapServer/0/query',
    arcgisFields: 'PROP_ID,situs_address,situs_city,situs_zip',
    useArcGIS:    true,
    state:        'TX',
    mapRow(r) {
      const address = safeStr(r['situs_address'])
      const city    = safeStr(r['situs_city'])
      const zip     = safeStr(r['situs_zip'])
      if (!address || !city) return null

      const propId = safeStr(r['PROP_ID'])
      const id = propId
        ? `travis-${propId.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, TX`, city)

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: null,  // Not in public GIS layer
        price_per_sqft: null,
        owner_name: null,       // Not in public GIS layer
        owner_mailing_address: null, owner_state: null,
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

    const unique = [...new Map(batch.map(r => [r.id, r])).values()]
    const dupeCount = batch.length - unique.length
    if (dupeCount > 0) totalSkipped += dupeCount

    if (offset === unique.length || offset === page.length) {
      console.log('  Sample IDs:', unique.slice(0, 3).map(r => r.id))
    }

    if (unique.length > 0) {
      const { error } = await supabase
        .from('properties')
        .upsert(unique, { onConflict: 'id' })

      if (error) {
        totalErrors++
        console.error(`  ✗ Upsert error: ${error.message}`)
      } else {
        totalUpserted += unique.length
      }
    }

    if (totalFetched - lastProgressAt >= PROGRESS_EVERY || page.length < thisPage) {
      console.log(
        `  ── ${totalFetched} fetched | ${totalUpserted} upserted | ${totalSkipped} skipped | ${totalErrors} errors`
      )
      lastProgressAt = totalFetched
    }

    if (page.length < thisPage) break
  }

  console.log(
    `\n✓ Done — ${totalUpserted} upserted, ${totalSkipped} skipped, ${totalErrors} errors`
  )
}

// ── ArcGIS REST processor ──────────────────────────────────────────────────────
//
// Paginates through an ArcGIS MapServer or FeatureServer query endpoint using
// resultOffset + resultRecordCount. Stops when exceededTransferLimit is false
// or the page is smaller than requested.

async function processCountyArcGIS(countyKey, rowLimit) {
  const config    = COUNTIES[countyKey]
  const PAGE_SIZE = 1000
  let offset         = 0
  let totalFetched   = 0
  let totalUpserted  = 0
  let totalSkipped   = 0
  let totalErrors    = 0
  let lastProgressAt = 0

  const effectiveLimit = rowLimit ?? Infinity
  const baseUrl        = config.arcgisUrl
  const fields         = config.arcgisFields ?? '*'

  console.log(`\n── ${config.label} (ArcGIS REST) ${'─'.repeat(20)}`)
  if (rowLimit) console.log(`  Row limit: ${rowLimit}`)
  console.log(`  Endpoint: ${baseUrl}`)

  while (totalFetched < effectiveLimit) {
    const thisPage = Math.min(PAGE_SIZE, effectiveLimit - totalFetched)
    const url = (
      `${baseUrl}?where=1%3D1` +
      `&outFields=${encodeURIComponent(fields)}` +
      `&resultRecordCount=${thisPage}` +
      `&resultOffset=${offset}` +
      `&returnGeometry=false` +
      `&f=json`
    )

    process.stdout.write(`  Fetching offset=${offset}… `)

    let res
    try {
      res = await fetchWithTimeout(url, ARCGIS_TIMEOUT_MS)
    } catch (err) {
      console.error(`\n✗ ${err.message}`)
      break
    }

    if (!res.ok) {
      console.error(`\n✗ HTTP ${res.status} ${res.statusText} at offset=${offset}`)
      console.error(`  URL: ${url}`)
      break
    }

    let data
    try {
      data = await res.json()
    } catch (err) {
      console.error(`\n✗ Failed to parse JSON: ${err.message}`)
      break
    }

    if (data.error) {
      console.error(`\n✗ ArcGIS error: ${data.error.message ?? JSON.stringify(data.error)}`)
      break
    }

    const features = data.features ?? []
    if (features.length === 0) {
      console.log('no more records.')
      break
    }

    console.log(`got ${features.length} rows.`)

    const batch = []
    for (const feature of features) {
      try {
        const record = config.mapRow(feature.attributes ?? feature)
        if (record) batch.push(record)
        else totalSkipped++
      } catch {
        totalSkipped++
      }
    }

    totalFetched += features.length
    offset       += features.length

    const unique = [...new Map(batch.map(r => [r.id, r])).values()]
    const dupeCount = batch.length - unique.length
    if (dupeCount > 0) totalSkipped += dupeCount

    // Show sample IDs on first page
    if (offset === features.length) {
      console.log('  Sample IDs:', unique.slice(0, 3).map(r => r.id))
    }

    if (unique.length > 0) {
      const { error } = await supabase
        .from('properties')
        .upsert(unique, { onConflict: 'id' })

      if (error) {
        totalErrors++
        console.error(`  ✗ Upsert error: ${error.message}`)
      } else {
        totalUpserted += unique.length
      }
    }

    if (totalFetched - lastProgressAt >= PROGRESS_EVERY || features.length < thisPage) {
      console.log(
        `  ── ${totalFetched} fetched | ${totalUpserted} upserted | ${totalSkipped} skipped | ${totalErrors} errors`
      )
      lastProgressAt = totalFetched
    }

    // ArcGIS signals no more data via exceededTransferLimit === false/absent
    if (!data.exceededTransferLimit) break
    if (features.length < thisPage) break
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

  if (config.useArcGIS) {
    await processCountyArcGIS(countyKey, rowLimit)
  } else if (config.useSocrata) {
    await processCountySocrata(countyKey, rowLimit)
  } else {
    await processCountyCSV(countyKey, rowLimit)
  }
}

// ── CLI entry ─────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)

  const limitIdx = args.indexOf('--limit')
  const rowLimit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : null
  if (rowLimit !== null && (isNaN(rowLimit) || rowLimit < 1)) {
    console.error('✗ --limit must be a positive integer')
    process.exit(1)
  }

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
