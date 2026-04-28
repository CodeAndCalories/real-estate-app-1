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
 *   node scripts/download-county-data.js cuyahoga
 *   node scripts/download-county-data.js kent
 *   node scripts/download-county-data.js summit
 *   node scripts/download-county-data.js franklin
 *   node scripts/download-county-data.js hamilton
 *   node scripts/download-county-data.js tarrant
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

/**
 * Resolves an ArcGIS Hub slug to a FeatureServer /query URL by calling the
 * opendata.arcgis.com v3 datasets API. Used when the exact org/service URL
 * is not known ahead of time.
 */
async function resolveArcGISHubFeatureServer(slug) {
  const apiUrl = `https://opendata.arcgis.com/api/v3/datasets?filter[slug]=${encodeURIComponent(slug)}`
  const res = await fetchWithTimeout(apiUrl, ARCGIS_TIMEOUT_MS)
  if (!res.ok) throw new Error(`ArcGIS Hub API returned HTTP ${res.status} for slug: ${slug}`)
  const data = await res.json()
  const item = data?.data?.[0]
  if (!item) throw new Error(`No dataset found in ArcGIS Hub for slug: ${slug}`)
  const serviceUrl = item?.attributes?.url
  if (!serviceUrl) throw new Error(`ArcGIS Hub response missing service URL for slug: ${slug}`)
  // attributes.url is the FeatureServer layer URL (e.g. .../FeatureServer/0)
  return serviceUrl.endsWith('/query') ? serviceUrl : `${serviceUrl}/query`
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
  // Socrata JSON API — Assessor Parcel Sales (5pge-nu6u), ~500K records
  cook: {
    label:      'Cook County, IL',
    socrataUrl: 'https://datacatalog.cookcountyil.gov/resource/5pge-nu6u.json',
    useSocrata: true,
    state:      'IL',
    mapRow(r) {
      const address = safeStr(r['addr'] ?? r['address'] ?? r['Address'])
      if (!address) return null

      const city = 'Chicago'  // no city field in this dataset; Cook County is predominantly Chicago

      const pin = safeStr(r['pin'] ?? r['pin14'] ?? r['PIN'] ?? r['PIN14'])
      const id  = pin
        ? `cook-${pin.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, IL`, city)

      const salePrice = safeNum(r['sale_price'])
      const estLand   = safeNum(r['est_land'])
      const estBldg   = safeNum(r['est_bldg'])
      const assessedValue = (estLand != null && estBldg != null) ? estLand + estBldg : null
      const estimatedValue = salePrice ?? assessedValue

      const sqft = safeNum(r['hd_sf'])
      const pricePerSqft = estimatedValue && estimatedValue > 0 && sqft && sqft > 0
        ? Math.round(estimatedValue / sqft) : null

      return {
        id,
        address, city,
        zip: '',  // no zip field in this dataset
        estimated_value: estimatedValue && estimatedValue > 0 ? Math.round(estimatedValue) : null,
        price_per_sqft: pricePerSqft,
        owner_name: null,
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

  // ── Dallas County, TX ────────────────────────────────────────────────────────
  // ArcGIS FeatureServer — DCAD_PARCELS (Dallas County GIS, org zqe2kwz79KUqUvxC)
  // Owner name + address available; no assessed value field in this public layer
  // (DCAD assessed values are only available as ZIP download from dcad.org).
  dallas: {
    label:        'Dallas County, TX',
    arcgisUrl:    'https://services3.arcgis.com/zqe2kwz79KUqUvxC/arcgis/rest/services/DCAD_PARCELS/FeatureServer/0/query',
    arcgisFields: 'ACCOUNT_NUM,GIS_PARCEL_ID,SiteAddress,STREET_NUM,FULL_STREET_NAME,UNIT_ID,PROPERTY_CITY,PROPERTY_ZIPCODE,OWNER_NAME1,OWNER_NAME2,OWNER_ADDRESS_LINE1,OWNER_STATE',
    useArcGIS:    true,
    state:        'TX',
    mapRow(r) {
      // SiteAddress is a pre-combined field; fall back to assembling from components
      const siteAddr   = safeStr(r['SiteAddress'])
      const streetNum  = safeStr(r['STREET_NUM'])
      const streetName = safeStr(r['FULL_STREET_NAME'])
      const unit       = safeStr(r['UNIT_ID'])
      const assembled  = streetNum && streetName
        ? [streetNum, streetName, unit].filter(Boolean).join(' ').trim()
        : null
      const address = siteAddr ?? assembled
      if (!address) return null

      const rawCity = safeStr(r['PROPERTY_CITY'])
      const city = (!rawCity || rawCity === 'NO TOWN') ? 'Dallas' : rawCity
      const zip  = r['PROPERTY_ZIPCODE'] != null
        ? String(r['PROPERTY_ZIPCODE']).padStart(5, '0') : ''

      const ownerName   = safeStr(r['OWNER_NAME1'])
      const mailAddress = safeStr(r['OWNER_ADDRESS_LINE1'])
      const mailState   = safeStr(r['OWNER_STATE'])

      const acctNum = safeStr(r['ACCOUNT_NUM']) ?? safeStr(r['GIS_PARCEL_ID'])
      const id = acctNum
        ? `dallas-${acctNum.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, TX`, city)

      return {
        id,
        address, city,
        zip,
        estimated_value: null,  // not available in this public GIS layer
        price_per_sqft: null,
        owner_name: ownerName,
        owner_mailing_address: mailAddress ?? null,
        owner_state: mailState ?? null,
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
  // ArcGIS MapServer — MC Assessor Parcels layer 0, ~1.75M parcels
  // Service: https://gis.mcassessor.maricopa.gov/arcgis/rest/services/Parcels/MapServer
  // Note: Previous FeatureServer URL (services1.arcgis.com/.../Secured_Master) returned
  // HTTP 400 "Invalid URL" and has been replaced with the direct Assessor GIS endpoint.
  maricopa: {
    label:       'Maricopa County, AZ',
    arcgisUrl:   'https://gis.mcassessor.maricopa.gov/arcgis/rest/services/Parcels/MapServer/0/query',
    arcgisFields: 'APN,OWNER_NAME,PHYSICAL_ADDRESS,PHYSICAL_CITY,PHYSICAL_ZIP,FCV_CUR,LIVING_SPACE,MAIL_ADDRESS,MAIL_STATE',
    useArcGIS:   true,
    state:       'AZ',
    mapRow(r) {
      const address = safeStr(r['PHYSICAL_ADDRESS'])
      const city    = safeStr(r['PHYSICAL_CITY'])
      const zip     = safeStr(r['PHYSICAL_ZIP'])
      if (!address || !city) return null

      // FCV_CUR = Full Cash Value (current year) — primary market value indicator
      const fcv = safeNum(r['FCV_CUR'])
      if (!fcv || fcv <= 0) return null

      const ownerName    = safeStr(r['OWNER_NAME'])
      const mailAddress  = safeStr(r['MAIL_ADDRESS'])
      const mailState    = safeStr(r['MAIL_STATE'])
      const apn          = safeStr(r['APN'])
      const id = apn
        ? `maricopa-${apn.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, AZ`, city)

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: Math.round(fcv),
        price_per_sqft: null,
        owner_name: ownerName,
        owner_mailing_address: mailAddress ?? null,
        owner_state: mailState ?? null,
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
  // ArcGIS Hub — Tax Parcels 2025, ~372K parcels
  // Hub: https://gisdata.fultoncountyga.gov/datasets/fulcogis::tax-parcels-2025/about
  // Feature server URL is resolved dynamically from the Hub slug at runtime.
  fulton: {
    label:        'Fulton County, GA',
    hubSlug:      'fulcogis::tax-parcels-2025',
    arcgisFields: 'PARCEL_ID,OWNER,SITUS_ADDR,SITUS_CITY,SITUS_ZIP,APPRAISED_VALUE,ASSESSED_VALUE',
    useArcGIS:    true,
    state:        'GA',
    mapRow(r) {
      const address = safeStr(r['SITUS_ADDR'])
      const city    = safeStr(r['SITUS_CITY']) ?? 'Atlanta'
      const zip     = safeStr(r['SITUS_ZIP'])
      if (!address) return null

      const appraisedValue = safeNum(r['APPRAISED_VALUE']) ?? safeNum(r['ASSESSED_VALUE'])
      if (!appraisedValue || appraisedValue <= 0) return null

      const ownerName = safeStr(r['OWNER'])
      const parcelId  = safeStr(r['PARCEL_ID'])
      const id = parcelId
        ? `fulton-${parcelId.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, GA`, city)

      return {
        id,
        address, city,
        zip: zip ?? '',
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
  // Socrata JSON API — King County Parcel + Value (2kfd-2c3u), ~635K parcels
  // Note: owner name withheld per WA RCW 42.56.070(9) privacy policy
  king: {
    label:        'King County, WA',
    socrataUrl:   'https://data.kingcounty.gov/resource/2kfd-2c3u.json',
    useSocrata:   true,
    state:        'WA',
    mapRow(r) {
      const address = safeStr(r['addr_full'])
      const city    = safeStr(r['ctyname'])
      const zip     = safeStr(r['zip5'])
      if (!address || !city) return null

      const landVal = safeNum(r['tax_lndval']) ?? 0
      const imprVal = safeNum(r['tax_impr'])   ?? 0
      const totalVal = landVal + imprVal
      if (totalVal <= 0) return null

      const pin = safeStr(r['pin'])
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

  // ── Cuyahoga County, OH (Cleveland) ──────────────────────────────────────────
  // ArcGIS MapServer — CCGIS/Parcels_CAMA_Real_Property layer 3 (AppraisalParcelView)
  // Service: https://gis.cuyahogacounty.us/server/rest/services/CCGIS/Parcels_CAMA_Real_Property/MapServer
  cuyahoga: {
    label:      'Cuyahoga County, OH',
    arcgisUrl:  'https://gis.cuyahogacounty.us/server/rest/services/CCGIS/Parcels_CAMA_Real_Property/MapServer/3/query',
    useArcGIS:  true,
    state:      'OH',
    mapRow(r) {
      // par_addr_all = "12710  BENWOOD AVE, CLEVELAND, OH, 44105" — extract street portion
      const addrAll = safeStr(r['par_addr_all'])
      const address = addrAll ? addrAll.split(',')[0].trim() : null
      const city    = safeStr(r['par_city']) ?? 'Cleveland'
      const zip     = r['par_zip'] != null ? String(r['par_zip']) : null
      if (!address) return null

      const ppn = safeStr(r['parcelpin'])
      const id  = ppn
        ? `cuyahoga-${ppn.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, OH`, city)

      // certified_tax_total is the appraised value; sales_amount is last sale price
      const appraisedValue = safeNum(r['certified_tax_total']) ?? safeNum(r['gross_certified_total'])
      const sqft = safeNum(r['total_res_liv_area'])
      const ownerName = safeStr(r['parcel_owner'])

      const estimatedValue = appraisedValue && appraisedValue > 0 ? Math.round(appraisedValue) : null
      const pricePerSqft = estimatedValue && sqft && sqft > 0 ? Math.round(estimatedValue / sqft) : null

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: estimatedValue,
        price_per_sqft: pricePerSqft,
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

  // ── Kent County, MI (Grand Rapids) ───────────────────────────────────────────
  // ArcGIS MapServer — ParcelsWithCondos layer 0, ~270K parcels
  // Service: https://gis.kentcountymi.gov/agisprod/rest/services/ParcelsWithCondos/MapServer
  kent: {
    label:      'Kent County, MI',
    arcgisUrl:  'https://gis.kentcountymi.gov/agisprod/rest/services/ParcelsWithCondos/MapServer/0/query',
    useArcGIS:  true,
    state:      'MI',
    mapRow(r) {
      const address = safeStr(r['PROPERTYADDRESS'])
      const city    = safeStr(r['PROPADDRESSCITY']) ?? 'Grand Rapids'
      // PROPADDRESSSTATE_ZIPCODE format: "MI49330     " — skip 2-char state prefix
      const zipRaw  = safeStr(r['PROPADDRESSSTATE_ZIPCODE'])
      const zip     = zipRaw ? zipRaw.trim().slice(2).trim() : null
      if (!address) return null

      // PNUM is formatted parcel number e.g. "41-01-05-200-045"
      const pin = safeStr(r['PNUM'])
      const id  = pin
        ? `kent-${pin.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, MI`, city)

      // SEVTRIBUNAL1 is State Equalized Value (50% of true cash value in MI) — multiply by 2
      const sev = safeNum(r['SEVTRIBUNAL1'])
      const estimatedValue = sev != null ? sev * 2 : null
      const ownerName = safeStr(r['OWNERNAME1'])

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: estimatedValue && estimatedValue > 0 ? Math.round(estimatedValue) : null,
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

  // ── Summit County, OH (Akron) ─────────────────────────────────────────────────
  // ArcGIS MapServer — Maps/ParcelQuery layer 0 (Parcel Information), ~295K parcels
  // Service: https://maps.summitcounty.org/arcgis/rest/services/Maps/ParcelQuery/MapServer
  summit: {
    label:      'Summit County, OH',
    arcgisUrl:  'https://maps.summitcounty.org/arcgis/rest/services/Maps/ParcelQuery/MapServer/0/query',
    useArcGIS:  true,
    state:      'OH',
    mapRow(r) {
      // OwnershipTable_SITUS is the property street address (no city in this service)
      const address = safeStr(r['OwnershipTable_SITUS'])
      const city    = 'Akron'
      if (!address) return null

      // OwnershipTable_SERIAL is the parcel identifier e.g. "PE-2-214"
      const serial = safeStr(r['OwnershipTable_SERIAL'])
      const id     = serial
        ? `summit-${serial.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, OH`, city)

      // TAXVAL = MRKTVALLND + MRKTVALIMP (total market value = land + improvements)
      const appraisedValue = safeNum(r['OwnershipTable_TAXVAL'])
      const ownerName = safeStr(r['OwnershipTable_OWNER'])

      return {
        id,
        address, city,
        zip: '',
        estimated_value: appraisedValue && appraisedValue > 0 ? Math.round(appraisedValue) : null,
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

  // ── Franklin County, OH (Columbus) ───────────────────────────────────────────
  // ArcGIS MapServer — ParcelFeatures/Parcel_Features_WebMercator layer 0, ~480K parcels
  // Service: https://gis.franklincountyohio.gov/hosting/rest/services/ParcelFeatures/Parcel_Features_WebMercator/MapServer
  franklin: {
    label:      'Franklin County, OH',
    arcgisUrl:  'https://gis.franklincountyohio.gov/hosting/rest/services/ParcelFeatures/Parcel_Features_WebMercator/MapServer/0/query',
    arcgisFields: 'PARCELID,SITEADDRESS,ZIPCD,OWNERNME1,TOTVALUEBASE',
    useArcGIS:  true,
    state:      'OH',
    mapRow(r) {
      const address = safeStr(r['SITEADDRESS'])
      if (!address) return null

      const city = 'Columbus'
      const zip  = r['ZIPCD'] != null ? String(r['ZIPCD']).padStart(5, '0') : null

      const parcelId = safeStr(r['PARCELID'])
      const id = parcelId
        ? `franklin-${parcelId.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, OH`, city)

      // TOTVALUEBASE = total assessed value base (land + improvements)
      const totalValue = safeNum(r['TOTVALUEBASE'])
      const ownerName  = safeStr(r['OWNERNME1'])

      return {
        id,
        address, city,
        zip: zip ?? '',
        estimated_value: totalValue && totalValue > 0 ? Math.round(totalValue) : null,
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

  // ── Hamilton County, OH (Cincinnati) ─────────────────────────────────────────
  // ArcGIS MapServer — HCE/Cadastral layer 0, ~420K parcels
  // Service: https://cagisonline.hamilton-co.org/arcgis/rest/services/HCE/Cadastral/MapServer
  // Note: No ZIP field in this service; city defaults to Cincinnati.
  //       FORECL_FLAG and DELQ_TAXES fields available for distress signal detection.
  hamilton: {
    label:      'Hamilton County, OH',
    arcgisUrl:  'https://cagisonline.hamilton-co.org/arcgis/rest/services/HCE/Cadastral/MapServer/0/query',
    arcgisFields: 'PARCELID,ADDRNO,ADDRST,ADDRSF,OWNNM1,MKT_TOTAL_VAL,DELQ_TAXES,FORECL_FLAG',
    useArcGIS:  true,
    state:      'OH',
    mapRow(r) {
      const num    = safeStr(r['ADDRNO'])
      const street = safeStr(r['ADDRST'])
      const suffix = safeStr(r['ADDRSF'])
      if (!num || !street) return null
      const address = [num, street, suffix].filter(Boolean).join(' ').trim()

      const city = 'Cincinnati'

      const parcelId = safeStr(r['PARCELID'])
      const id = parcelId
        ? `hamilton-${parcelId.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, OH`, city)

      // MKT_TOTAL_VAL = total market value (land + improvements)
      const mktTotal   = safeNum(r['MKT_TOTAL_VAL'])
      const ownerName  = safeStr(r['OWNNM1'])

      // Map available distress fields
      const delqTaxes  = safeNum(r['DELQ_TAXES'])
      const taxDelinquent = delqTaxes != null && delqTaxes > 0 ? true : null
      const forecl     = safeStr(r['FORECL_FLAG'])
      // FORECL_FLAG is 'Y' when a foreclosure action is active
      const inDefault  = forecl === 'Y' ? 1 : null

      return {
        id,
        address, city,
        zip: '',
        estimated_value: mktTotal && mktTotal > 0 ? Math.round(mktTotal) : null,
        price_per_sqft: null,
        owner_name: ownerName, owner_mailing_address: null, owner_state: null,
        tax_delinquent: taxDelinquent, lead_type: 'county_record',
        absentee_owner: null, vacancy_signal: null, inherited: null,
        loan_balance_estimate: null, days_in_default: inDefault, days_on_market: null,
        previous_listing_price: null, price_drop_percent: null,
        market_avg_price_per_sqft: null, rent_estimate: null, opportunity_score: null,
        agent_name: null, owner_phone: null, years_owned: null,
      }
    },
  },

  // ── Tarrant County, TX (Fort Worth) ──────────────────────────────────────────
  // ArcGIS MapServer — County-owned parcels only; full TAD parcel roll is
  // available as a ZIP download from tad.org but has no public REST API.
  // This endpoint provides county-owned/government parcels (~110 records) as a
  // placeholder until a bulk REST source becomes available.
  // Service: https://mapit.tarrantcounty.com/arcgis/rest/services/TCProperty/MapServer
  tarrant: {
    label:      'Tarrant County, TX',
    arcgisUrl:  'https://mapit.tarrantcounty.com/arcgis/rest/services/TCProperty/MapServer/0/query',
    arcgisFields: 'GEO_ID,SITUS_ADDRESS,OWNER,APPRAISED_VALUE,TAXABLE_VALUE',
    useArcGIS:  true,
    state:      'TX',
    mapRow(r) {
      const address = safeStr(r['SITUS_ADDRESS'])
      if (!address) return null

      const city = 'Fort Worth'

      const geoId = safeStr(r['GEO_ID'])
      const id = geoId
        ? `tarrant-${geoId.replace(/[^a-zA-Z0-9]/g, '')}`
        : computeId(`${address}, ${city}, TX`, city)

      const appraisedVal = safeNum(r['APPRAISED_VALUE']) ?? safeNum(r['TAXABLE_VALUE'])
      const ownerName    = safeStr(r['OWNER'])

      return {
        id,
        address, city,
        zip: '',
        estimated_value: appraisedVal && appraisedVal > 0 ? Math.round(appraisedVal) : null,
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
  const fields         = config.arcgisFields ?? '*'

  // Resolve the feature server URL — either from config or by looking up the Hub slug
  let baseUrl = config.arcgisUrl
  if (!baseUrl && config.hubSlug) {
    console.log(`\n── ${config.label} (ArcGIS REST) ${'─'.repeat(20)}`)
    if (rowLimit) console.log(`  Row limit: ${rowLimit}`)
    console.log(`  Resolving feature server URL from ArcGIS Hub slug: ${config.hubSlug}`)
    try {
      baseUrl = await resolveArcGISHubFeatureServer(config.hubSlug)
      console.log(`  Resolved: ${baseUrl}`)
    } catch (err) {
      console.error(`✗ Could not resolve Hub slug "${config.hubSlug}": ${err.message}`)
      return
    }
  } else {
    console.log(`\n── ${config.label} (ArcGIS REST) ${'─'.repeat(20)}`)
    if (rowLimit) console.log(`  Row limit: ${rowLimit}`)
    console.log(`  Endpoint: ${baseUrl}`)
  }

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
