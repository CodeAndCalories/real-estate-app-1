#!/usr/bin/env node
/**
 * scripts/addCitiesExpansion.js
 *
 * Adds:
 *  - 400 records for each of 22 new cities
 *  - 300 more records for each of 12 existing hot markets
 *
 * APPENDS to lib/data/generated-signals.json — does NOT overwrite.
 *
 * Usage: node scripts/addCitiesExpansion.js
 *
 * NOTE: Fremont uses prefix `fmt-` (not `fre-` which is already taken by Fresno).
 */
'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// ── Seeded PRNG (new seed to avoid ID/value collisions with prior scripts) ───
let seed = 20270201;
function seededRand() {
  seed = Math.imul(1664525, seed) + 1013904223 | 0;
  return (seed >>> 0) / 4294967296;
}
function rand(min, max) { return Math.floor(seededRand() * (max - min + 1)) + min; }
function pick(arr)      { return arr[Math.floor(seededRand() * arr.length)]; }

// ── Street names & owner names ───────────────────────────────────────────────
const STREET_NAMES = [
  'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Walnut', 'Spruce', 'Willow', 'Ash',
  'Washington', 'Lincoln', 'Jefferson', 'Madison', 'Adams', 'Jackson', 'Monroe', 'Harrison',
  'Main', 'Park', 'Lake', 'Hill', 'Valley', 'Ridge', 'Forest', 'Meadow', 'River', 'Spring',
  'Sunset', 'Sunrise', 'Highland', 'Woodland', 'Lakewood', 'Greenwood', 'Fairview', 'Hillcrest',
  'Riverside', 'Brookside', 'Crestview', 'Parkway', 'Orchard', 'Garden', 'Magnolia', 'Bristol',
  'Canterbury', 'Hampton', 'Windsor', 'Colonial', 'Heritage', 'Liberty', 'Summit', 'Frontier',
];
const STREET_TYPES = ['St', 'Ave', 'Blvd', 'Dr', 'Rd', 'Ln', 'Way', 'Ct', 'Pl', 'Cir', 'Ter', 'Pkwy'];

const OWNER_NAMES = [
  'James Wilson', 'Maria Rodriguez', 'Robert Thompson', 'Linda Martinez', 'David Johnson',
  'Patricia Davis', 'Michael Anderson', 'Barbara Taylor', 'John Jackson', 'Susan White',
  'William Harris', 'Karen Martin', 'Richard Clark', 'Nancy Lewis', 'Thomas Robinson',
  'Betty Walker', 'Charles Hall', 'Dorothy Young', 'Daniel Allen', 'Sandra King',
  'Paul Wright', 'Ashley Scott', 'Mark Green', 'Emily Baker', 'Donald Adams',
  'Donna Nelson', 'Steven Hill', 'Carol Rivera', 'Kenneth Campbell', 'Ruth Mitchell',
  'George Carter', 'Sharon Perez', 'Edward Roberts', 'Michelle Turner', 'Brian Phillips',
  'Amanda Evans', 'Kevin Collins', 'Melissa Stewart', 'Jason Sanchez', 'Deborah Morris',
];

// ── 22 new cities ─────────────────────────────────────────────────────────────
// avgPrice  = (minPrice + maxPrice) / 2
// priceRange = maxPrice - minPrice
// avgPriceSqft = rough market price/sqft
const NEW_CITIES = [
  { name: 'Fort Lauderdale', state: 'FL', abbr: 'fll', zipStart: 33301, zipEnd: 33306, avgPrice:  600000, priceRange: 440000, avgPriceSqft: 300, areaCode: '954' },
  { name: 'Chattanooga',     state: 'TN', abbr: 'cha', zipStart: 37401, zipEnd: 37406, avgPrice:  350000, priceRange: 260000, avgPriceSqft: 175, areaCode: '423' },
  { name: 'Huntsville',      state: 'AL', abbr: 'hsv', zipStart: 35801, zipEnd: 35806, avgPrice:  380000, priceRange: 280000, avgPriceSqft: 190, areaCode: '256' },
  { name: 'Dayton',          state: 'OH', abbr: 'day', zipStart: 45401, zipEnd: 45406, avgPrice:  200000, priceRange: 160000, avgPriceSqft: 125, areaCode: '937' },
  { name: 'Shreveport',      state: 'LA', abbr: 'shv', zipStart: 71101, zipEnd: 71106, avgPrice:  200000, priceRange: 160000, avgPriceSqft: 125, areaCode: '318' },
  { name: 'Augusta',         state: 'GA', abbr: 'aug', zipStart: 30901, zipEnd: 30906, avgPrice:  260000, priceRange: 200000, avgPriceSqft: 163, areaCode: '706' },
  { name: 'Modesto',         state: 'CA', abbr: 'mod', zipStart: 95351, zipEnd: 95356, avgPrice:  480000, priceRange: 280000, avgPriceSqft: 267, areaCode: '209' },
  { name: 'Fontana',         state: 'CA', abbr: 'fon', zipStart: 92335, zipEnd: 92340, avgPrice:  650000, priceRange: 340000, avgPriceSqft: 325, areaCode: '909' },
  { name: 'Moreno Valley',   state: 'CA', abbr: 'mrv', zipStart: 92551, zipEnd: 92556, avgPrice:  600000, priceRange: 320000, avgPriceSqft: 300, areaCode: '951' },
  { name: 'Glendale',        state: 'AZ', abbr: 'gla', zipStart: 85301, zipEnd: 85306, avgPrice:  480000, priceRange: 280000, avgPriceSqft: 240, areaCode: '623' },
  { name: 'Hialeah',         state: 'FL', abbr: 'hia', zipStart: 33010, zipEnd: 33015, avgPrice:  480000, priceRange: 280000, avgPriceSqft: 267, areaCode: '305' },
  { name: 'Garland',         state: 'TX', abbr: 'gar', zipStart: 75040, zipEnd: 75045, avgPrice:  400000, priceRange: 240000, avgPriceSqft: 210, areaCode: '972' },
  { name: 'Lubbock',         state: 'TX', abbr: 'lub', zipStart: 79401, zipEnd: 79406, avgPrice:  280000, priceRange: 200000, avgPriceSqft: 156, areaCode: '806' },
  { name: 'Laredo',          state: 'TX', abbr: 'lrd', zipStart: 78040, zipEnd: 78045, avgPrice:  270000, priceRange: 180000, avgPriceSqft: 150, areaCode: '956' },
  { name: 'Winston-Salem',   state: 'NC', abbr: 'wsm', zipStart: 27101, zipEnd: 27106, avgPrice:  310000, priceRange: 220000, avgPriceSqft: 172, areaCode: '336' },
  { name: 'Durham',          state: 'NC', abbr: 'dur', zipStart: 27701, zipEnd: 27706, avgPrice:  470000, priceRange: 300000, avgPriceSqft: 261, areaCode: '919' },
  { name: 'Madison',         state: 'WI', abbr: 'mad', zipStart: 53701, zipEnd: 53706, avgPrice:  450000, priceRange: 260000, avgPriceSqft: 250, areaCode: '608' },
  { name: 'Yonkers',         state: 'NY', abbr: 'yon', zipStart: 10701, zipEnd: 10706, avgPrice:  680000, priceRange: 400000, avgPriceSqft: 400, areaCode: '914' },
  // NOTE: Fremont uses `fmt-` prefix — `fre-` is taken by Fresno
  { name: 'Fremont',         state: 'CA', abbr: 'fmt', zipStart: 94536, zipEnd: 94541, avgPrice: 1140000, priceRange: 520000, avgPriceSqft: 633, areaCode: '510' },
  { name: 'Jersey City',     state: 'NJ', abbr: 'jcy', zipStart:  7301, zipEnd:  7306, avgPrice:  700000, priceRange: 440000, avgPriceSqft: 500, areaCode: '201' },
  { name: 'Chesapeake',      state: 'VA', abbr: 'che', zipStart: 23320, zipEnd: 23325, avgPrice:  450000, priceRange: 260000, avgPriceSqft: 225, areaCode: '757' },
  { name: 'Norfolk',         state: 'VA', abbr: 'nfk', zipStart: 23501, zipEnd: 23506, avgPrice:  360000, priceRange: 240000, avgPriceSqft: 200, areaCode: '757' },
];

// ── 12 hot markets — 300 more records each ────────────────────────────────────
// Expansion IDs use `{abbr}3-{NNNN}` to avoid collision with existing records
// (some hot markets already have `{abbr}2-` records, all have earlier hash-based IDs)
const HOT_MARKETS = [
  { name: 'Miami',     state: 'FL', abbr: 'mia3', zipStart: 33101, zipEnd: 33156, avgPrice:  680000, priceRange: 500000, avgPriceSqft: 350, areaCode: '305' },
  { name: 'Dallas',    state: 'TX', abbr: 'dal3', zipStart: 75201, zipEnd: 75270, avgPrice:  550000, priceRange: 400000, avgPriceSqft: 280, areaCode: '214' },
  { name: 'Phoenix',   state: 'AZ', abbr: 'phx3', zipStart: 85001, zipEnd: 85098, avgPrice:  500000, priceRange: 400000, avgPriceSqft: 270, areaCode: '602' },
  { name: 'Atlanta',   state: 'GA', abbr: 'atl3', zipStart: 30301, zipEnd: 30380, avgPrice:  520000, priceRange: 380000, avgPriceSqft: 280, areaCode: '404' },
  { name: 'Austin',    state: 'TX', abbr: 'aus3', zipStart: 78701, zipEnd: 78799, avgPrice:  680000, priceRange: 500000, avgPriceSqft: 340, areaCode: '512' },
  { name: 'Charlotte', state: 'NC', abbr: 'clt3', zipStart: 28201, zipEnd: 28299, avgPrice:  480000, priceRange: 360000, avgPriceSqft: 253, areaCode: '704' },
  { name: 'Nashville', state: 'TN', abbr: 'bna3', zipStart: 37201, zipEnd: 37250, avgPrice:  580000, priceRange: 420000, avgPriceSqft: 305, areaCode: '615' },
  { name: 'Denver',    state: 'CO', abbr: 'den3', zipStart: 80201, zipEnd: 80299, avgPrice:  620000, priceRange: 460000, avgPriceSqft: 330, areaCode: '720' },
  { name: 'Seattle',   state: 'WA', abbr: 'sea3', zipStart: 98101, zipEnd: 98199, avgPrice:  900000, priceRange: 600000, avgPriceSqft: 500, areaCode: '206' },
  { name: 'Houston',   state: 'TX', abbr: 'hou3', zipStart: 77001, zipEnd: 77099, avgPrice:  420000, priceRange: 340000, avgPriceSqft: 210, areaCode: '713' },
  { name: 'Tampa',     state: 'FL', abbr: 'tpa3', zipStart: 33601, zipEnd: 33680, avgPrice:  520000, priceRange: 380000, avgPriceSqft: 280, areaCode: '813' },
  { name: 'Raleigh',   state: 'NC', abbr: 'rdu3', zipStart: 27601, zipEnd: 27699, avgPrice:  550000, priceRange: 380000, avgPriceSqft: 290, areaCode: '919' },
];

// ── Signal engine (identical logic to addMoreCities.js) ───────────────────────
function deterministicFloat(id, min, max) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return min + ((hash % 1000) / 1000) * (max - min);
}

function generateSignal(p, marketAvg, cityState, areaCode) {
  const pricePerSqft = p.sqft > 0 ? Math.round(p.price / p.sqft) : null;
  const hist = p.price_history;

  let priceDrop = null;
  if (hist.length >= 2) {
    const prev = hist[hist.length - 2];
    const curr = hist[hist.length - 1];
    if (prev > 0 && prev > curr) {
      priceDrop = Math.round(((prev - curr) / prev) * 100);
    }
  }

  const hasPriceDrop  = priceDrop !== null && priceDrop > 7;
  const hasLongDOM    = p.days_on_market > 90;
  const belowMarket   = pricePerSqft !== null && pricePerSqft < marketAvg * 0.85;
  const hasRelisted   = hist.length > 2;

  const loanBalance = p.loan_balance != null
    ? p.loan_balance
    : Math.round(p.price * deterministicFloat(p.id, 0.40, 0.72));

  const equityPct      = p.price > 0 ? (p.price - loanBalance) / p.price : 0;
  const isAbsenteeOwner = p.owner_state != null && p.owner_state !== cityState;

  let score = 0;
  if (hasPriceDrop)     score += 30;
  if (hasLongDOM)       score += 25;
  if (belowMarket)      score += 20;
  if (hasRelisted)      score += 25;
  if (isAbsenteeOwner)  score += 15;
  if (equityPct > 0.60) score += 10;
  if ((p.years_owned || 0) > 15) score += 10;
  if (p.tax_delinquent) score += 20;
  if (p.vacancy_signal) score += 15;
  if (p.inherited)      score += 10;
  score = Math.min(100, score);

  const rentEstimate  = Math.round(p.price * deterministicFloat(p.id + '-rent', 0.006, 0.011));
  const daysInDefault = p.days_on_market > 120
    ? Math.floor(p.days_on_market * deterministicFloat(p.id + '-def', 0.4, 0.6))
    : null;

  let lead_type = 'Investor Opportunity';
  if (hasPriceDrop && hasLongDOM) lead_type = 'Pre-Foreclosure';
  else if (hasRelisted)           lead_type = 'Expired Listing';

  const ownerMailingState = seededRand() < 0.2
    ? pick(['CA', 'TX', 'FL', 'NY', 'IL'])
    : cityState;

  return {
    id:                       p.id,
    address:                  p.address,
    city:                     p.city,
    zip:                      p.zip,
    owner_name:               p.owner_name || null,
    estimated_value:          p.price,
    loan_balance_estimate:    loanBalance,
    days_in_default:          daysInDefault,
    previous_listing_price:   hist.length >= 2 ? hist[hist.length - 2] : null,
    days_on_market:           p.days_on_market,
    agent_name:               null,
    lead_type,
    price_per_sqft:           pricePerSqft,
    market_avg_price_per_sqft: marketAvg,
    price_drop_percent:       priceDrop,
    rent_estimate:            rentEstimate,
    opportunity_score:        score,
    owner_phone:              p.owner_name ? `(${areaCode}) ${rand(200, 999)}-${rand(1000, 9999)}` : null,
    owner_mailing_address:    p.owner_name
      ? `${rand(100, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}, ${p.city}, ${cityState} ${p.zip}`
      : null,
    owner_state:              p.owner_name ? ownerMailingState : null,
    years_owned:              p.owner_name ? rand(1, 35) : null,
    tax_delinquent:           seededRand() < 0.08,
    vacancy_signal:           seededRand() < 0.12,
    inherited:                seededRand() < 0.06,
    absentee_owner:           false,
  };
}

function generateProps(city, count, idOffset = 0) {
  const props = [];
  const usedAddresses = new Set();

  for (let i = 0; i < count; i++) {
    let address;
    do {
      address = `${rand(101, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`;
    } while (usedAddresses.has(address));
    usedAddresses.add(address);

    const zip     = String(rand(city.zipStart, city.zipEnd)).padStart(5, '0');
    const sqft    = rand(900, 2800);
    const basePrice = Math.max(80000, rand(
      city.avgPrice - Math.floor(city.priceRange / 2),
      city.avgPrice + Math.floor(city.priceRange / 2),
    ));

    const bucket = i % 3;
    let priceHistory, dom;

    if (bucket === 0) {
      const prev = Math.round(basePrice * (1 + 0.09 + seededRand() * 0.15));
      priceHistory = [prev, basePrice];
      dom = rand(92, 250);
    } else if (bucket === 1) {
      const mid  = Math.round(basePrice * (1 + 0.01 + seededRand() * 0.04));
      const orig = Math.round(mid * (1 + 0.05 + seededRand() * 0.12));
      priceHistory = [orig, mid, basePrice];
      dom = rand(35, 200);
    } else {
      if (seededRand() < 0.35) {
        const prev = Math.round(basePrice * (1 + 0.01 + seededRand() * 0.05));
        priceHistory = [prev, basePrice];
      } else {
        priceHistory = [basePrice];
      }
      dom = rand(5, 85);
    }

    const id = `${city.abbr}-${String(idOffset + i + 1).padStart(4, '0')}`;

    const prop = {
      id,
      address,
      city:          city.name,
      zip,
      price:         priceHistory[priceHistory.length - 1],
      sqft,
      days_on_market: dom,
      price_history: priceHistory,
      owner_name:    seededRand() < 0.45 ? pick(OWNER_NAMES) : null,
      loan_balance:  seededRand() < 0.65
        ? Math.round(basePrice * (0.38 + seededRand() * 0.36))
        : undefined,
      years_owned:   null,
      tax_delinquent: seededRand() < 0.08,
      vacancy_signal: seededRand() < 0.12,
      inherited:     seededRand() < 0.06,
    };

    const signal = generateSignal(prop, city.avgPriceSqft, city.state, city.areaCode);
    props.push(signal);
  }
  return props;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const signalsPath = join(__dirname, '..', 'lib', 'data', 'generated-signals.json');
const existing    = JSON.parse(readFileSync(signalsPath, 'utf-8'));
console.log(`Existing signals: ${existing.length.toLocaleString()}`);

const newSignals = [];

// ── Phase 1: 22 new cities × 400 records ─────────────────────────────────────
console.log('\n── Phase 1: New cities (400 each) ──────────────────────────────');
for (const city of NEW_CITIES) {
  const batch = generateProps(city, 400);
  newSignals.push(...batch);
  console.log(`  ${city.name.padEnd(20)} ${city.state}  +${batch.length}`);
}

// ── Phase 2: Hot market expansion × 300 records each ─────────────────────────
console.log('\n── Phase 2: Hot market expansion (300 each) ────────────────────');
for (const city of HOT_MARKETS) {
  const batch = generateProps(city, 300);
  newSignals.push(...batch);
  console.log(`  ${city.name.padEnd(20)} ${city.state}  +${batch.length}`);
}

// ── Write combined file ───────────────────────────────────────────────────────
console.log(`\nNew signals generated: ${newSignals.length.toLocaleString()}`);
const combined = [...existing, ...newSignals];
writeFileSync(signalsPath, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`Total signals written: ${combined.length.toLocaleString()}`);

// ── Final city breakdown ──────────────────────────────────────────────────────
const byCity = {};
for (const s of combined) byCity[s.city] = (byCity[s.city] || 0) + 1;
const totalCities = Object.keys(byCity).length;
console.log(`\nTotal cities: ${totalCities}`);

console.log('\nNew cities added (Phase 1):');
for (const city of NEW_CITIES) {
  console.log(`  ${city.name.padEnd(20)} ${city.state}  ${(byCity[city.name] || 0).toLocaleString()} records`);
}

console.log('\nHot market totals after expansion (Phase 2):');
// Map abbr names back to canonical city names
for (const city of HOT_MARKETS) {
  console.log(`  ${city.name.padEnd(20)} ${city.state}  ${(byCity[city.name] || 0).toLocaleString()} records`);
}
