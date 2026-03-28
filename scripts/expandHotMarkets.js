#!/usr/bin/env node
/**
 * scripts/expandHotMarkets.js
 *
 * Adds 500 records to each of 10 high-demand cities.
 * APPENDS to generated-signals.json — does NOT overwrite.
 *
 * Usage: node scripts/expandHotMarkets.js
 */
'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// ── Seeded PRNG (different seed from all prior scripts) ──────────────────────
let seed = 20261201;
function seededRand() {
  seed = Math.imul(1664525, seed) + 1013904223 | 0;
  return (seed >>> 0) / 4294967296;
}
function rand(min, max) { return Math.floor(seededRand() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(seededRand() * arr.length)]; }

// ── Street names & owner names ───────────────────────────────────────────────
const STREET_NAMES = [
  'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Walnut', 'Spruce', 'Willow', 'Ash',
  'Washington', 'Lincoln', 'Jefferson', 'Madison', 'Adams', 'Jackson', 'Monroe', 'Harrison',
  'Main', 'Park', 'Lake', 'Hill', 'Valley', 'Ridge', 'Forest', 'Meadow', 'River', 'Spring',
  'Sunset', 'Sunrise', 'Highland', 'Woodland', 'Lakewood', 'Greenwood', 'Fairview', 'Hillcrest',
  'Riverside', 'Brookside', 'Crestview', 'Parkway', 'Orchard', 'Garden', 'Magnolia', 'Palm',
  'Coral', 'Cactus', 'Desert', 'Prairie', 'Mission', 'Canyon', 'Summit', 'Frontier',
  'Bristol', 'Canterbury', 'Hampton', 'Windsor', 'Colonial', 'Heritage', 'Liberty', 'Victory',
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

// ── 10 hot-market city configs ────────────────────────────────────────────────
const HOT_CITIES = [
  { name: 'Phoenix',   state: 'AZ', abbr: 'phx2', zipStart: 85001, zipEnd: 85099, avgPrice: 420000, priceRange: 220000, avgPriceSqft: 220, areaCode: '602' },
  { name: 'Miami',     state: 'FL', abbr: 'mia2', zipStart: 33101, zipEnd: 33196, avgPrice: 680000, priceRange: 420000, avgPriceSqft: 380, areaCode: '305' },
  { name: 'Dallas',    state: 'TX', abbr: 'dal2', zipStart: 75201, zipEnd: 75270, avgPrice: 400000, priceRange: 220000, avgPriceSqft: 180, areaCode: '214' },
  { name: 'Atlanta',   state: 'GA', abbr: 'atl2', zipStart: 30301, zipEnd: 30380, avgPrice: 395000, priceRange: 210000, avgPriceSqft: 190, areaCode: '404' },
  { name: 'Austin',    state: 'TX', abbr: 'aus2', zipStart: 78701, zipEnd: 78799, avgPrice: 560000, priceRange: 280000, avgPriceSqft: 280, areaCode: '512' },
  { name: 'Charlotte', state: 'NC', abbr: 'clt2', zipStart: 28201, zipEnd: 28280, avgPrice: 380000, priceRange: 200000, avgPriceSqft: 185, areaCode: '704' },
  { name: 'Nashville', state: 'TN', abbr: 'bna2', zipStart: 37201, zipEnd: 37250, avgPrice: 490000, priceRange: 240000, avgPriceSqft: 250, areaCode: '615' },
  { name: 'Denver',    state: 'CO', abbr: 'den2', zipStart: 80201, zipEnd: 80299, avgPrice: 530000, priceRange: 250000, avgPriceSqft: 285, areaCode: '303' },
  { name: 'Tampa',     state: 'FL', abbr: 'tpa2', zipStart: 33601, zipEnd: 33690, avgPrice: 460000, priceRange: 210000, avgPriceSqft: 250, areaCode: '813' },
  { name: 'Raleigh',   state: 'NC', abbr: 'rdu2', zipStart: 27601, zipEnd: 27699, avgPrice: 420000, priceRange: 210000, avgPriceSqft: 210, areaCode: '919' },
];

// ── Signal engine ─────────────────────────────────────────────────────────────
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

  const hasPriceDrop = priceDrop !== null && priceDrop > 7;
  const hasLongDOM = p.days_on_market > 90;
  const belowMarket = pricePerSqft !== null && pricePerSqft < marketAvg * 0.85;
  const hasRelisted = hist.length > 2;

  const loanBalance = p.loan_balance != null
    ? p.loan_balance
    : Math.round(p.price * deterministicFloat(p.id, 0.40, 0.72));

  const equityPct = p.price > 0 ? (p.price - loanBalance) / p.price : 0;
  const isAbsenteeOwner = seededRand() < 0.2;

  let score = 0;
  if (hasPriceDrop)    score += 30;
  if (hasLongDOM)      score += 25;
  if (belowMarket)     score += 20;
  if (hasRelisted)     score += 25;
  if (isAbsenteeOwner) score += 15;
  if (equityPct > 0.60) score += 10;
  if ((p.years_owned || 0) > 15) score += 10;
  if (p.tax_delinquent) score += 20;
  if (p.vacancy_signal) score += 15;
  if (p.inherited)     score += 10;
  score = Math.min(100, score);

  const rentEstimate = Math.round(p.price * deterministicFloat(p.id + '-rent', 0.006, 0.011));
  const daysInDefault = p.days_on_market > 120
    ? Math.floor(p.days_on_market * deterministicFloat(p.id + '-def', 0.4, 0.6))
    : null;

  let lead_type = 'Investor Opportunity';
  if (hasPriceDrop && hasLongDOM) lead_type = 'Pre-Foreclosure';
  else if (hasRelisted) lead_type = 'Expired Listing';

  const ownerMailingState = isAbsenteeOwner
    ? pick(['CA', 'TX', 'FL', 'NY', 'IL'])
    : cityState;

  return {
    id: p.id,
    address: p.address,
    city: p.city,
    zip: String(p.zip).padStart(5, '0'),
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
    owner_mailing_address: p.owner_name
      ? `${rand(100, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}, ${p.city}, ${cityState} ${String(p.zip).padStart(5, '0')}`
      : null,
    owner_state: p.owner_name ? ownerMailingState : null,
    years_owned: p.owner_name ? rand(1, 35) : null,
    tax_delinquent: seededRand() < 0.08,
    vacancy_signal: seededRand() < 0.12,
    inherited: seededRand() < 0.06,
    absentee_owner: isAbsenteeOwner,
  };
}

function generateProps(city, count) {
  const props = [];
  const usedAddresses = new Set();

  for (let i = 0; i < count; i++) {
    const bucket = i % 3;

    let address;
    do {
      address = `${rand(101, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`;
    } while (usedAddresses.has(address));
    usedAddresses.add(address);

    const zip = rand(city.zipStart, city.zipEnd);
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

    const id = `${city.abbr}-${String(i + 1).padStart(4, '0')}`;

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
      loan_balance: seededRand() < 0.65
        ? Math.round(basePrice * (0.38 + seededRand() * 0.36))
        : undefined,
      years_owned: null,
      tax_delinquent: seededRand() < 0.08,
      vacancy_signal: seededRand() < 0.12,
      inherited: seededRand() < 0.06,
    };

    props.push(generateSignal(prop, city.avgPriceSqft, city.state, city.areaCode));
  }
  return props;
}

// ── Main ─────────────────────────────────────────────────────────────────────
const signalsPath = join(__dirname, '..', 'lib', 'data', 'generated-signals.json');
const existing = JSON.parse(readFileSync(signalsPath, 'utf-8'));
console.log(`Existing signals: ${existing.length}`);

const newSignals = [];

for (const city of HOT_CITIES) {
  const batch = generateProps(city, 500);
  newSignals.push(...batch);
  console.log(`  ${city.name}, ${city.state}: +${batch.length}`);
}

console.log(`\nNew signals generated: ${newSignals.length}`);

const combined = [...existing, ...newSignals];
writeFileSync(signalsPath, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`Total signals written: ${combined.length}`);

// Per-city counts for the 10 targets
const targets = new Set(HOT_CITIES.map(c => c.name));
const byCity = {};
for (const s of combined) if (targets.has(s.city)) byCity[s.city] = (byCity[s.city] || 0) + 1;
console.log('\nFinal counts for expanded cities:');
for (const [city, n] of Object.entries(byCity).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${city.padEnd(16)} ${n}`);
}
