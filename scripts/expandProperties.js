#!/usr/bin/env node
/**
 * scripts/expandProperties.js
 *
 * Generates additional property signals and APPENDS them to generated-signals.json.
 * Does NOT overwrite existing records.
 *
 * Wave 3: 200 new records per existing 30 cities = 6,000
 * Wave 4: 5 brand new cities × 500 = 2,500
 * Total new: 8,500
 *
 * Usage: node scripts/expandProperties.js
 */
'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// ── Seeded PRNG (different seed from original to avoid collisions) ──────────
let seed = 20260328;
function seededRand() {
  seed = Math.imul(1664525, seed) + 1013904223 | 0;
  return (seed >>> 0) / 4294967296;
}
function rand(min, max) { return Math.floor(seededRand() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(seededRand() * arr.length)]; }

function daysAgo(n) {
  const d = new Date('2026-03-28');
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ── Street names & owner names ──────────────────────────────────────────────
const STREET_NAMES = [
  'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Walnut', 'Spruce', 'Willow', 'Ash',
  'Washington', 'Lincoln', 'Jefferson', 'Madison', 'Adams', 'Jackson', 'Monroe', 'Harrison',
  'Main', 'Park', 'Lake', 'Hill', 'Valley', 'Ridge', 'Forest', 'Meadow', 'River', 'Spring',
  'Sunset', 'Sunrise', 'Highland', 'Woodland', 'Lakewood', 'Greenwood', 'Fairview', 'Hillcrest',
  'Riverside', 'Brookside', 'Crestview', 'Parkway', 'Orchard', 'Garden', 'Magnolia', 'Palm',
  'Coral', 'Cactus', 'Desert', 'Prairie', 'Mission', 'Canyon', 'Summit', 'Frontier',
  'Bristol', 'Canterbury', 'Hampton', 'Windsor', 'Colonial', 'Heritage', 'Liberty', 'Victory',
  'Peach', 'Bayou', 'Lakeview', 'Clearwater', 'Creekside', 'Stonegate', 'Foxwood', 'Pinecrest',
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
  'Jeffrey Rogers', 'Stephanie Reed', 'Ryan Cook', 'Rebecca Bailey', 'Jacob Morgan',
  'Laura Bell', 'Gary Murphy', 'Sarah Ward', 'Anthony Torres', 'Christine Flores',
];

const AREA_CODES = {
  'Phoenix': '602', 'Miami': '305', 'Dallas': '214', 'Atlanta': '404',
  'Chicago': '312', 'Cleveland': '216', 'Los Angeles': '213', 'New York': '212',
  'Tampa': '813', 'Nashville': '615', 'Jacksonville': '904', 'Denver': '303',
  'Houston': '713', 'San Antonio': '210', 'Austin': '512', 'Charlotte': '704',
  'Raleigh': '919', 'Columbus': '614', 'Indianapolis': '317', 'Seattle': '206',
  'Portland': '503', 'Minneapolis': '612', 'Kansas City': '816', 'Memphis': '901',
  'Baltimore': '410', 'Detroit': '313', 'Pittsburgh': '412', 'Salt Lake City': '801',
  'Las Vegas': '702', 'New Orleans': '504',
  'Orlando': '407', 'Sacramento': '916', 'Richmond': '804', 'Oklahoma City': '405', 'Cincinnati': '513',
};

const STATE_MAP = {
  'Phoenix': 'AZ', 'Miami': 'FL', 'Dallas': 'TX', 'Atlanta': 'GA',
  'Chicago': 'IL', 'Cleveland': 'OH', 'Los Angeles': 'CA', 'New York': 'NY',
  'Tampa': 'FL', 'Nashville': 'TN', 'Jacksonville': 'FL', 'Denver': 'CO',
  'Houston': 'TX', 'San Antonio': 'TX', 'Austin': 'TX', 'Charlotte': 'NC',
  'Raleigh': 'NC', 'Columbus': 'OH', 'Indianapolis': 'IN', 'Seattle': 'WA',
  'Portland': 'OR', 'Minneapolis': 'MN', 'Kansas City': 'MO', 'Memphis': 'TN',
  'Baltimore': 'MD', 'Detroit': 'MI', 'Pittsburgh': 'PA', 'Salt Lake City': 'UT',
  'Las Vegas': 'NV', 'New Orleans': 'LA',
  'Orlando': 'FL', 'Sacramento': 'CA', 'Richmond': 'VA', 'Oklahoma City': 'OK', 'Cincinnati': 'OH',
};

// ── Existing 30 cities — 200 more each ──────────────────────────────────────
const EXISTING_CITIES = [
  { name: 'Phoenix',        abbr: 'phx', zipPrefix: '850', avgPrice: 420000, priceRange: 220000, avgPriceSqft: 220 },
  { name: 'Miami',          abbr: 'mia', zipPrefix: '331', avgPrice: 680000, priceRange: 420000, avgPriceSqft: 380 },
  { name: 'Dallas',         abbr: 'dal', zipPrefix: '752', avgPrice: 400000, priceRange: 220000, avgPriceSqft: 180 },
  { name: 'Atlanta',        abbr: 'atl', zipPrefix: '303', avgPrice: 395000, priceRange: 210000, avgPriceSqft: 190 },
  { name: 'Tampa',          abbr: 'tpa', zipPrefix: '336', avgPrice: 460000, priceRange: 210000, avgPriceSqft: 250 },
  { name: 'Las Vegas',      abbr: 'las', zipPrefix: '891', avgPrice: 400000, priceRange: 190000, avgPriceSqft: 200 },
  { name: 'Chicago',        abbr: 'chi', zipPrefix: '606', avgPrice: 375000, priceRange: 210000, avgPriceSqft: 220 },
  { name: 'Cleveland',      abbr: 'cle', zipPrefix: '441', avgPrice: 200000, priceRange: 130000, avgPriceSqft: 120 },
  { name: 'Austin',         abbr: 'aus', zipPrefix: '787', avgPrice: 560000, priceRange: 280000, avgPriceSqft: 280 },
  { name: 'Charlotte',      abbr: 'clt', zipPrefix: '282', avgPrice: 380000, priceRange: 200000, avgPriceSqft: 185 },
  { name: 'Nashville',      abbr: 'bna', zipPrefix: '372', avgPrice: 490000, priceRange: 240000, avgPriceSqft: 250 },
  { name: 'Raleigh',        abbr: 'rdu', zipPrefix: '276', avgPrice: 420000, priceRange: 210000, avgPriceSqft: 210 },
  { name: 'Jacksonville',   abbr: 'jax', zipPrefix: '322', avgPrice: 320000, priceRange: 180000, avgPriceSqft: 165 },
  { name: 'Columbus',       abbr: 'cmh', zipPrefix: '432', avgPrice: 280000, priceRange: 150000, avgPriceSqft: 160 },
  { name: 'Indianapolis',   abbr: 'ind', zipPrefix: '462', avgPrice: 265000, priceRange: 150000, avgPriceSqft: 145 },
  { name: 'Denver',         abbr: 'den', zipPrefix: '802', avgPrice: 530000, priceRange: 250000, avgPriceSqft: 285 },
  { name: 'San Antonio',    abbr: 'sat', zipPrefix: '782', avgPrice: 305000, priceRange: 170000, avgPriceSqft: 150 },
  { name: 'Houston',        abbr: 'hou', zipPrefix: '770', avgPrice: 350000, priceRange: 210000, avgPriceSqft: 158 },
  { name: 'Los Angeles',    abbr: 'lax', zipPrefix: '900', avgPrice: 880000, priceRange: 450000, avgPriceSqft: 550 },
  { name: 'New York',       abbr: 'nyc', zipPrefix: '100', avgPrice: 950000, priceRange: 500000, avgPriceSqft: 750 },
  { name: 'Seattle',        abbr: 'sea', zipPrefix: '981', avgPrice: 750000, priceRange: 350000, avgPriceSqft: 460 },
  { name: 'Portland',       abbr: 'pdx', zipPrefix: '972', avgPrice: 520000, priceRange: 250000, avgPriceSqft: 305 },
  { name: 'Minneapolis',    abbr: 'msp', zipPrefix: '554', avgPrice: 340000, priceRange: 180000, avgPriceSqft: 200 },
  { name: 'Kansas City',    abbr: 'mci', zipPrefix: '641', avgPrice: 270000, priceRange: 150000, avgPriceSqft: 148 },
  { name: 'Memphis',        abbr: 'mem', zipPrefix: '381', avgPrice: 220000, priceRange: 130000, avgPriceSqft: 130 },
  { name: 'Baltimore',      abbr: 'bwi', zipPrefix: '212', avgPrice: 310000, priceRange: 160000, avgPriceSqft: 195 },
  { name: 'Detroit',        abbr: 'det', zipPrefix: '482', avgPrice: 170000, priceRange: 110000, avgPriceSqft: 112 },
  { name: 'Pittsburgh',     abbr: 'pit', zipPrefix: '152', avgPrice: 260000, priceRange: 140000, avgPriceSqft: 163 },
  { name: 'Salt Lake City', abbr: 'slc', zipPrefix: '841', avgPrice: 490000, priceRange: 220000, avgPriceSqft: 265 },
  { name: 'New Orleans',    abbr: 'msy', zipPrefix: '701', avgPrice: 290000, priceRange: 160000, avgPriceSqft: 183 },
];

// ── 5 new cities — 500 each ──────────────────────────────────────────────
const NEW_CITIES = [
  { name: 'Orlando',        abbr: 'orl', zipStart: 32801, zipEnd: 32806, avgPrice: 370000, priceRange: 300000, avgPriceSqft: 210 },
  { name: 'Sacramento',     abbr: 'sac', zipStart: 95814, zipEnd: 95819, avgPrice: 565000, priceRange: 370000, avgPriceSqft: 320 },
  { name: 'Richmond',       abbr: 'ric', zipStart: 23219, zipEnd: 23224, avgPrice: 430000, priceRange: 300000, avgPriceSqft: 230 },
  { name: 'Oklahoma City',  abbr: 'okc', zipStart: 73101, zipEnd: 73106, avgPrice: 270000, priceRange: 220000, avgPriceSqft: 140 },
  { name: 'Cincinnati',     abbr: 'cin', zipStart: 45201, zipEnd: 45206, avgPrice: 300000, priceRange: 240000, avgPriceSqft: 155 },
];

// ── Signal engine (mirrors generateProperties.js) ──────────────────────────
function deterministicFloat(id, min, max) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return min + ((hash % 1000) / 1000) * (max - min);
}

function generateSignal(p, marketAvg) {
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

  const hasPriceDrop = priceDrop !== null && priceDrop > 7;
  const hasLongDOM = p.days_on_market > 90;
  const belowMarket = pricePerSqft !== null && pricePerSqft < marketAvg * 0.85;
  const hasRelisted = hist.length > 2;

  const loanBalance = p.loan_balance != null
    ? p.loan_balance
    : Math.round(p.price * deterministicFloat(p.id, 0.40, 0.72));

  const equityPct = p.price > 0 ? (p.price - loanBalance) / p.price : 0;
  const isAbsenteeOwner = p.owner_state != null && p.owner_state !== STATE_MAP[p.city];

  let score = 0;
  if (hasPriceDrop)   score += 30;
  if (hasLongDOM)     score += 25;
  if (belowMarket)    score += 20;
  if (hasRelisted)    score += 25;
  if (isAbsenteeOwner) score += 15;
  if (equityPct > 0.60) score += 10;
  if ((p.years_owned || 0) > 15) score += 10;
  if (p.tax_delinquent) score += 20;
  if (p.vacancy_signal) score += 15;
  if (p.inherited) score += 10;
  score = Math.min(100, score);

  const rentEstimate = Math.round(p.price * deterministicFloat(p.id + '-rent', 0.006, 0.011));
  const daysInDefault = p.days_on_market > 120
    ? Math.floor(p.days_on_market * deterministicFloat(p.id + '-def', 0.4, 0.6))
    : null;

  let lead_type = 'Investor Opportunity';
  if (hasPriceDrop && hasLongDOM) lead_type = 'Pre-Foreclosure';
  else if (hasRelisted) lead_type = 'Expired Listing';

  const areaCode = AREA_CODES[p.city] || '555';

  return {
    address: p.address,
    city: p.city,
    zip: p.zip,
    owner_name: p.owner_name || null,
    estimated_value: p.price,
    loan_balance_estimate: loanBalance,
    days_in_default: daysInDefault,
    previous_listing_price: hist.length >= 2 ? hist[hist.length - 2] : null,
    days_on_market: p.days_on_market,
    agent_name: null,
    lead_type,
    price_per_sqft: pricePerSqft,
    market_avg_price_per_sqft: marketAvg,
    price_drop_percent: priceDrop,
    rent_estimate: rentEstimate,
    opportunity_score: score,
    owner_phone: p.owner_name ? `(${areaCode}) ${rand(200, 999)}-${rand(1000, 9999)}` : null,
    owner_mailing_address: p.owner_name ? `${rand(100, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}, ${p.city}, ${STATE_MAP[p.city]} ${p.zip}` : null,
    owner_state: p.owner_name ? (seededRand() < 0.2 ? pick(['CA', 'TX', 'FL', 'NY', 'IL']) : STATE_MAP[p.city]) : null,
    years_owned: p.owner_name ? rand(1, 35) : null,
    tax_delinquent: seededRand() < 0.08,
    vacancy_signal: seededRand() < 0.12,
    inherited: seededRand() < 0.06,
    absentee_owner: false,
  };
}

function generateProps(city, count, idPrefix, idStartOffset) {
  const props = [];
  const usedAddresses = new Set();

  for (let i = 0; i < count; i++) {
    const bucket = i % 3;

    let address;
    do {
      address = `${rand(101, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`;
    } while (usedAddresses.has(address));
    usedAddresses.add(address);

    const zip = city.zipStart
      ? String(rand(city.zipStart, city.zipEnd))
      : `${city.zipPrefix}${rand(10, 99)}`;

    const sqft = rand(900, 2800);
    const basePrice = Math.max(80000, rand(
      city.avgPrice - Math.floor(city.priceRange / 2),
      city.avgPrice + Math.floor(city.priceRange / 2)
    ));

    let priceHistory, dom;

    if (bucket === 0) {
      const prev = Math.round(basePrice * (1 + 0.09 + seededRand() * 0.15));
      priceHistory = [prev, basePrice];
      dom = rand(92, 250);
    } else if (bucket === 1) {
      const mid = Math.round(basePrice * (1 + 0.01 + seededRand() * 0.04));
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

    const id = `${idPrefix}-${String(idStartOffset + i + 1).padStart(4, '0')}`;

    const prop = {
      id,
      address,
      city: city.name,
      zip,
      price: priceHistory[priceHistory.length - 1],
      sqft,
      days_on_market: dom,
      price_history: priceHistory,
      owner_name: seededRand() < 0.45 ? pick(OWNER_NAMES) : null,
      loan_balance: seededRand() < 0.65 ? Math.round(basePrice * (0.38 + seededRand() * 0.36)) : undefined,
      owner_state: null,
      years_owned: null,
      tax_delinquent: false,
      vacancy_signal: false,
      inherited: false,
    };

    const signal = generateSignal(prop, city.avgPriceSqft);
    props.push(signal);
  }
  return props;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const signalsPath = join(__dirname, '..', 'lib', 'data', 'generated-signals.json');
const existing = JSON.parse(readFileSync(signalsPath, 'utf-8'));
console.log(`Existing signals: ${existing.length}`);

const newSignals = [];

// Wave 3: 200 per existing city
for (const city of EXISTING_CITIES) {
  const batch = generateProps(city, 200, `${city.abbr}x`, 800);
  newSignals.push(...batch);
  console.log(`  ${city.name}: +200 (total batch: ${batch.length})`);
}

// Wave 4: 500 per new city
for (const city of NEW_CITIES) {
  const batch = generateProps(city, 500, city.abbr, 0);
  newSignals.push(...batch);
  console.log(`  ${city.name}: +500 (total batch: ${batch.length})`);
}

console.log(`\nNew signals generated: ${newSignals.length}`);

const combined = [...existing, ...newSignals];
writeFileSync(signalsPath, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`Total signals written: ${combined.length}`);

// Stats
const byCity = {};
for (const s of combined) byCity[s.city] = (byCity[s.city] || 0) + 1;
console.log('\nBy city:');
for (const [city, n] of Object.entries(byCity).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${city.padEnd(16)} ${n}`);
}
