#!/usr/bin/env node
/**
 * scripts/addMissingStates.js
 *
 * Generates 300 property signals per city for the 26 missing US states
 * and APPENDS them to generated-signals.json. Does NOT overwrite existing records.
 *
 * Usage: node scripts/addMissingStates.js
 */
'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// ── Seeded PRNG (different seed from prior scripts to avoid ID collisions) ───
let seed = 20261115;
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

// ── 26 new cities — one per missing state ────────────────────────────────────
// avgPrice = (minPrice + maxPrice) / 2
// priceRange = maxPrice - minPrice
const NEW_CITIES = [
  { name: 'Birmingham',   state: 'AL', abbr: 'bhm', zipStart: 35201, zipEnd: 35206, avgPrice: 265000, priceRange: 230000, avgPriceSqft: 130, areaCode: '205' },
  { name: 'Anchorage',    state: 'AK', abbr: 'anc', zipStart: 99501, zipEnd: 99506, avgPrice: 430000, priceRange: 300000, avgPriceSqft: 250, areaCode: '907' },
  { name: 'Little Rock',  state: 'AR', abbr: 'ltr', zipStart: 72201, zipEnd: 72206, avgPrice: 240000, priceRange: 200000, avgPriceSqft: 120, areaCode: '501' },
  { name: 'Hartford',     state: 'CT', abbr: 'hrt', zipStart:  6101, zipEnd:  6106, avgPrice: 370000, priceRange: 300000, avgPriceSqft: 200, areaCode: '860' },
  { name: 'Wilmington',   state: 'DE', abbr: 'wlm', zipStart: 19801, zipEnd: 19806, avgPrice: 360000, priceRange: 240000, avgPriceSqft: 210, areaCode: '302' },
  { name: 'Honolulu',     state: 'HI', abbr: 'hnl', zipStart: 96801, zipEnd: 96806, avgPrice: 890000, priceRange: 620000, avgPriceSqft: 550, areaCode: '808' },
  { name: 'Boise',        state: 'ID', abbr: 'boi', zipStart: 83701, zipEnd: 83706, avgPrice: 510000, priceRange: 340000, avgPriceSqft: 280, areaCode: '208' },
  { name: 'Des Moines',   state: 'IA', abbr: 'dsm', zipStart: 50301, zipEnd: 50306, avgPrice: 270000, priceRange: 220000, avgPriceSqft: 145, areaCode: '515' },
  { name: 'Wichita',      state: 'KS', abbr: 'ict', zipStart: 67201, zipEnd: 67206, avgPrice: 230000, priceRange: 180000, avgPriceSqft: 120, areaCode: '316' },
  { name: 'Louisville',   state: 'KY', abbr: 'lou', zipStart: 40201, zipEnd: 40206, avgPrice: 300000, priceRange: 240000, avgPriceSqft: 155, areaCode: '502' },
  { name: 'Portland',     state: 'ME', abbr: 'ptm', zipStart:  4101, zipEnd:  4106, avgPrice: 470000, priceRange: 300000, avgPriceSqft: 270, areaCode: '207' },
  { name: 'Boston',       state: 'MA', abbr: 'bos', zipStart:  2101, zipEnd:  2106, avgPrice: 840000, priceRange: 520000, avgPriceSqft: 580, areaCode: '617' },
  { name: 'Jackson',      state: 'MS', abbr: 'jac', zipStart: 39201, zipEnd: 39206, avgPrice: 200000, priceRange: 160000, avgPriceSqft: 110, areaCode: '601' },
  { name: 'Billings',     state: 'MT', abbr: 'bil', zipStart: 59101, zipEnd: 59106, avgPrice: 400000, priceRange: 240000, avgPriceSqft: 210, areaCode: '406' },
  { name: 'Omaha',        state: 'NE', abbr: 'oma', zipStart: 68101, zipEnd: 68106, avgPrice: 300000, priceRange: 240000, avgPriceSqft: 155, areaCode: '402' },
  { name: 'Manchester',   state: 'NH', abbr: 'man', zipStart:  3101, zipEnd:  3106, avgPrice: 450000, priceRange: 260000, avgPriceSqft: 260, areaCode: '603' },
  { name: 'Newark',       state: 'NJ', abbr: 'nwk', zipStart:  7101, zipEnd:  7106, avgPrice: 550000, priceRange: 340000, avgPriceSqft: 340, areaCode: '973' },
  { name: 'Albuquerque',  state: 'NM', abbr: 'abq', zipStart: 87101, zipEnd: 87106, avgPrice: 350000, priceRange: 260000, avgPriceSqft: 175, areaCode: '505' },
  { name: 'Fargo',        state: 'ND', abbr: 'far', zipStart: 58101, zipEnd: 58106, avgPrice: 320000, priceRange: 200000, avgPriceSqft: 160, areaCode: '701' },
  { name: 'Providence',   state: 'RI', abbr: 'pvd', zipStart:  2901, zipEnd:  2906, avgPrice: 450000, priceRange: 260000, avgPriceSqft: 270, areaCode: '401' },
  { name: 'Columbia',     state: 'SC', abbr: 'col', zipStart: 29201, zipEnd: 29206, avgPrice: 300000, priceRange: 240000, avgPriceSqft: 155, areaCode: '803' },
  { name: 'Sioux Falls',  state: 'SD', abbr: 'sux', zipStart: 57101, zipEnd: 57106, avgPrice: 350000, priceRange: 220000, avgPriceSqft: 170, areaCode: '605' },
  { name: 'Burlington',   state: 'VT', abbr: 'bvt', zipStart:  5401, zipEnd:  5406, avgPrice: 530000, priceRange: 300000, avgPriceSqft: 290, areaCode: '802' },
  { name: 'Charleston',   state: 'WV', abbr: 'crw', zipStart: 25301, zipEnd: 25306, avgPrice: 200000, priceRange: 160000, avgPriceSqft: 105, areaCode: '304' },
  { name: 'Milwaukee',    state: 'WI', abbr: 'mke', zipStart: 53201, zipEnd: 53206, avgPrice: 290000, priceRange: 220000, avgPriceSqft: 150, areaCode: '414' },
  { name: 'Cheyenne',     state: 'WY', abbr: 'cye', zipStart: 82001, zipEnd: 82006, avgPrice: 380000, priceRange: 200000, avgPriceSqft: 195, areaCode: '307' },
];

// ── Signal engine (mirrors expandProperties.js) ──────────────────────────────
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

// ── Main ─────────────────────────────────────────────────────────────────────
const signalsPath = join(__dirname, '..', 'lib', 'data', 'generated-signals.json');
const existing = JSON.parse(readFileSync(signalsPath, 'utf-8'));
console.log(`Existing signals: ${existing.length}`);

const newSignals = [];

for (const city of NEW_CITIES) {
  const batch = generateProps(city, 300);
  newSignals.push(...batch);
  console.log(`  ${city.name}, ${city.state}: +${batch.length}`);
}

console.log(`\nNew signals generated: ${newSignals.length}`);

const combined = [...existing, ...newSignals];
writeFileSync(signalsPath, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`Total signals written: ${combined.length}`);

// Stats by city
const byCity = {};
for (const s of combined) byCity[s.city] = (byCity[s.city] || 0) + 1;
console.log('\nNew cities added:');
for (const city of NEW_CITIES) {
  console.log(`  ${city.name.padEnd(16)} ${city.state}  ${byCity[city.name] || 0}`);
}
