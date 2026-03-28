#!/usr/bin/env node
/**
 * scripts/addMoreCities.js
 *
 * Generates 400 property signals per city for 25 new cities
 * and APPENDS them to generated-signals.json. Does NOT overwrite existing records.
 *
 * Usage: node scripts/addMoreCities.js
 */
'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// ── Seeded PRNG (different seed from prior scripts to avoid ID collisions) ───
let seed = 20270101;
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

// ── 25 new cities ─────────────────────────────────────────────────────────────
// avgPrice = (minPrice + maxPrice) / 2
// priceRange = maxPrice - minPrice
const NEW_CITIES = [
  { name: 'Tucson',          state: 'AZ', abbr: 'tuc', zipStart: 85701, zipEnd: 85706, avgPrice: 300000, priceRange: 240000, avgPriceSqft: 167, areaCode: '520' },
  { name: 'Fresno',          state: 'CA', abbr: 'fre', zipStart: 93701, zipEnd: 93706, avgPrice: 400000, priceRange: 240000, avgPriceSqft: 222, areaCode: '559' },
  { name: 'Allentown',       state: 'PA', abbr: 'alt', zipStart: 18101, zipEnd: 18106, avgPrice: 350000, priceRange: 260000, avgPriceSqft: 219, areaCode: '610' },
  { name: 'Bakersfield',     state: 'CA', abbr: 'bak', zipStart: 93301, zipEnd: 93306, avgPrice: 400000, priceRange: 240000, avgPriceSqft: 222, areaCode: '661' },
  { name: 'Stockton',        state: 'CA', abbr: 'stk', zipStart: 95201, zipEnd: 95206, avgPrice: 450000, priceRange: 260000, avgPriceSqft: 250, areaCode: '209' },
  { name: 'Knoxville',       state: 'TN', abbr: 'knx', zipStart: 37901, zipEnd: 37906, avgPrice: 380000, priceRange: 280000, avgPriceSqft: 224, areaCode: '865' },
  { name: 'Greensboro',      state: 'NC', abbr: 'gso', zipStart: 27401, zipEnd: 27406, avgPrice: 320000, priceRange: 240000, avgPriceSqft: 188, areaCode: '336' },
  { name: 'Akron',           state: 'OH', abbr: 'akr', zipStart: 44301, zipEnd: 44306, avgPrice: 200000, priceRange: 160000, avgPriceSqft: 133, areaCode: '330' },
  { name: 'Baton Rouge',     state: 'LA', abbr: 'btn', zipStart: 70801, zipEnd: 70806, avgPrice: 300000, priceRange: 240000, avgPriceSqft: 176, areaCode: '225' },
  { name: 'El Paso',         state: 'TX', abbr: 'elp', zipStart: 79901, zipEnd: 79906, avgPrice: 260000, priceRange: 200000, avgPriceSqft: 153, areaCode: '915' },
  { name: 'Tulsa',           state: 'OK', abbr: 'tul', zipStart: 74101, zipEnd: 74106, avgPrice: 260000, priceRange: 200000, avgPriceSqft: 153, areaCode: '918' },
  { name: 'Spokane',         state: 'WA', abbr: 'spk', zipStart: 99201, zipEnd: 99206, avgPrice: 400000, priceRange: 240000, avgPriceSqft: 222, areaCode: '509' },
  { name: 'Tacoma',          state: 'WA', abbr: 'tac', zipStart: 98401, zipEnd: 98406, avgPrice: 530000, priceRange: 300000, avgPriceSqft: 294, areaCode: '253' },
  { name: 'Lexington',       state: 'KY', abbr: 'lex', zipStart: 40501, zipEnd: 40506, avgPrice: 350000, priceRange: 260000, avgPriceSqft: 206, areaCode: '859' },
  { name: 'Riverside',       state: 'CA', abbr: 'riv', zipStart: 92501, zipEnd: 92506, avgPrice: 600000, priceRange: 360000, avgPriceSqft: 333, areaCode: '951' },
  { name: 'Corpus Christi',  state: 'TX', abbr: 'crp', zipStart: 78401, zipEnd: 78406, avgPrice: 280000, priceRange: 200000, avgPriceSqft: 165, areaCode: '361' },
  { name: 'St Louis',        state: 'MO', abbr: 'stl', zipStart: 63101, zipEnd: 63106, avgPrice: 270000, priceRange: 220000, avgPriceSqft: 169, areaCode: '314' },
  { name: 'Fort Worth',      state: 'TX', abbr: 'ftw', zipStart: 76101, zipEnd: 76106, avgPrice: 400000, priceRange: 240000, avgPriceSqft: 210, areaCode: '817' },
  { name: 'Aurora',          state: 'CO', abbr: 'aur', zipStart: 80010, zipEnd: 80015, avgPrice: 530000, priceRange: 300000, avgPriceSqft: 279, areaCode: '303' },
  { name: 'Anaheim',         state: 'CA', abbr: 'anh', zipStart: 92801, zipEnd: 92806, avgPrice: 890000, priceRange: 420000, avgPriceSqft: 556, areaCode: '714' },
  { name: 'Santa Ana',       state: 'CA', abbr: 'sna', zipStart: 92701, zipEnd: 92706, avgPrice: 890000, priceRange: 420000, avgPriceSqft: 556, areaCode: '714' },
  { name: 'Chandler',        state: 'AZ', abbr: 'chn', zipStart: 85224, zipEnd: 85229, avgPrice: 550000, priceRange: 340000, avgPriceSqft: 289, areaCode: '480' },
  { name: 'Henderson',       state: 'NV', abbr: 'hnd', zipStart: 89002, zipEnd: 89007, avgPrice: 530000, priceRange: 300000, avgPriceSqft: 279, areaCode: '702' },
  { name: 'Scottsdale',      state: 'AZ', abbr: 'sct', zipStart: 85250, zipEnd: 85255, avgPrice: 890000, priceRange: 620000, avgPriceSqft: 445, areaCode: '480' },
  { name: 'Plano',           state: 'TX', abbr: 'pln', zipStart: 75023, zipEnd: 75026, avgPrice: 600000, priceRange: 360000, avgPriceSqft: 300, areaCode: '972' },
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

  const rentEstimate = Math.round(p.price * deterministicFloat(p.id + '-rent', 0.006, 0.011));
  const daysInDefault = p.days_on_market > 120
    ? Math.floor(p.days_on_market * deterministicFloat(p.id + '-def', 0.4, 0.6))
    : null;

  let lead_type = 'Investor Opportunity';
  if (hasPriceDrop && hasLongDOM) lead_type = 'Pre-Foreclosure';
  else if (hasRelisted) lead_type = 'Expired Listing';

  const ownerMailingState = seededRand() < 0.2
    ? pick(['CA', 'TX', 'FL', 'NY', 'IL'])
    : cityState;

  return {
    id: p.id,
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
    owner_mailing_address: p.owner_name
      ? `${rand(100, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}, ${p.city}, ${cityState} ${p.zip}`
      : null,
    owner_state: p.owner_name ? ownerMailingState : null,
    years_owned: p.owner_name ? rand(1, 35) : null,
    tax_delinquent: seededRand() < 0.08,
    vacancy_signal: seededRand() < 0.12,
    inherited: seededRand() < 0.06,
    absentee_owner: false,
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

    const zip = String(rand(city.zipStart, city.zipEnd)).padStart(5, '0');
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

    const signal = generateSignal(prop, city.avgPriceSqft, city.state, city.areaCode);
    props.push(signal);
  }
  return props;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const signalsPath = join(__dirname, '..', 'lib', 'data', 'generated-signals.json');
const existing = JSON.parse(readFileSync(signalsPath, 'utf-8'));
console.log(`Existing signals: ${existing.length}`);

const newSignals = [];

for (const city of NEW_CITIES) {
  const batch = generateProps(city, 400);
  newSignals.push(...batch);
  console.log(`  ${city.name.padEnd(18)} ${city.state}  +${batch.length}`);
}

console.log(`\nNew signals generated: ${newSignals.length}`);

const combined = [...existing, ...newSignals];
writeFileSync(signalsPath, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`Total signals written: ${combined.length}`);

// Final city breakdown
const byCity = {};
for (const s of combined) byCity[s.city] = (byCity[s.city] || 0) + 1;
const totalCities = Object.keys(byCity).length;
console.log(`\nTotal cities: ${totalCities}`);
console.log('\nNew cities added:');
for (const city of NEW_CITIES) {
  console.log(`  ${city.name.padEnd(18)} ${city.state}  ${byCity[city.name] || 0} records`);
}
