#!/usr/bin/env node
/**
 * scripts/addDistressedProperties.js
 *
 * Adds 300 distressed-market records per city for 10 high-investor-activity markets.
 * APPENDS to lib/data/generated-signals.json — does NOT overwrite.
 *
 * Distressed profile (vs normal):
 *   tax_delinquent : 50%  (normal ~8%)
 *   vacancy_signal : 40%  (normal ~12%)
 *   inherited      : 20%  (normal ~6%)
 *   days_on_market : 90–365
 *   price drops    : 15–40%
 *   lead_type      : 60% Pre-Foreclosure / 30% Expired Listing / 10% Investor Opportunity
 *
 * Total new records: 10 × 300 = 3,000
 * Expected total:    85,000 → 88,000
 *
 * Usage: node scripts/addDistressedProperties.js
 */
'use strict';

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

// ── Seeded PRNG (new seed to avoid collisions with all prior scripts) ─────────
let seed = 20270401;
function seededRand() {
  seed = Math.imul(1664525, seed) + 1013904223 | 0;
  return (seed >>> 0) / 4294967296;
}
function rand(min, max) { return Math.floor(seededRand() * (max - min + 1)) + min; }
function pick(arr)      { return arr[Math.floor(seededRand() * arr.length)]; }

// ── Street names & owner names ────────────────────────────────────────────────
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

// ── City definitions ──────────────────────────────────────────────────────────
// minPrice / maxPrice reflect the distressed price range requested.
// abbr     = ID prefix for this distressed batch (distinct from any prior batch prefix).
// zipStart/zipEnd cover the lower-density ZIP sub-range for each market.
const DISTRESSED_CITIES = [
  // Cities with hash-based legacy IDs — use new distressed prefix
  { name: 'Cleveland',    state: 'OH', abbr: 'cld',  zipStart: 44101, zipEnd: 44106, minPrice:  30000, maxPrice: 120000, avgPriceSqft:  63, areaCode: '216' },
  { name: 'Detroit',      state: 'MI', abbr: 'dtd',  zipStart: 48201, zipEnd: 48206, minPrice:  20000, maxPrice: 100000, avgPriceSqft:  50, areaCode: '313' },
  { name: 'Baltimore',    state: 'MD', abbr: 'bld',  zipStart: 21201, zipEnd: 21206, minPrice:  60000, maxPrice: 160000, avgPriceSqft:  83, areaCode: '410' },
  { name: 'Memphis',      state: 'TN', abbr: 'mmd',  zipStart: 38101, zipEnd: 38106, minPrice:  50000, maxPrice: 150000, avgPriceSqft:  75, areaCode: '901' },
  // Cities with prefixed IDs — use "2" suffix batch
  { name: 'St Louis',     state: 'MO', abbr: 'stl2', zipStart: 63101, zipEnd: 63106, minPrice:  40000, maxPrice: 130000, avgPriceSqft:  72, areaCode: '314' },
  { name: 'Birmingham',   state: 'AL', abbr: 'bhm2', zipStart: 35201, zipEnd: 35206, minPrice:  50000, maxPrice: 140000, avgPriceSqft:  75, areaCode: '205' },
  { name: 'Jackson',      state: 'MS', abbr: 'jac2', zipStart: 39201, zipEnd: 39206, minPrice:  30000, maxPrice: 100000, avgPriceSqft:  56, areaCode: '601' },
  { name: 'Youngstown',   state: 'OH', abbr: 'yng2', zipStart: 44501, zipEnd: 44506, minPrice:  30000, maxPrice:  90000, avgPriceSqft:  50, areaCode: '330' },
  { name: 'Flint',        state: 'MI', abbr: 'flt2', zipStart: 48501, zipEnd: 48506, minPrice:  20000, maxPrice:  80000, avgPriceSqft:  44, areaCode: '810' },
  // New city
  { name: 'Gary',         state: 'IN', abbr: 'gar',  zipStart: 46401, zipEnd: 46406, minPrice:  20000, maxPrice:  80000, avgPriceSqft:  44, areaCode: '219' },
];

// ── Deterministic float helper (same as prior scripts) ────────────────────────
function deterministicFloat(id, min, max) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return min + ((hash % 1000) / 1000) * (max - min);
}

// ── Weighted lead_type picker: 60% Pre-Foreclosure, 30% Expired, 10% Investor ─
function pickLeadType() {
  const r = seededRand();
  if (r < 0.60) return 'Pre-Foreclosure';
  if (r < 0.90) return 'Expired Listing';
  return 'Investor Opportunity';
}

// ── Distressed signal builder ─────────────────────────────────────────────────
function generateDistressedSignal(p, marketAvg, cityState, areaCode) {
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

  // Distressed flags — elevated rates
  const tax_delinquent = seededRand() < 0.50;   // 50%
  const vacancy_signal = seededRand() < 0.40;   // 40%
  const inherited      = seededRand() < 0.20;   // 20%

  const hasPriceDrop  = priceDrop !== null && priceDrop > 7;
  const hasLongDOM    = p.days_on_market > 90;   // always true for distressed batch
  const belowMarket   = pricePerSqft !== null && pricePerSqft < marketAvg * 0.85;
  const hasRelisted   = hist.length > 2;

  const loanBalance = p.loan_balance != null
    ? p.loan_balance
    : Math.round(p.price * deterministicFloat(p.id, 0.40, 0.72));

  const equityPct      = p.price > 0 ? (p.price - loanBalance) / p.price : 0;
  const ownerMailingState = seededRand() < 0.25
    ? pick(['CA', 'TX', 'FL', 'NY', 'IL'])
    : cityState;
  const isAbsenteeOwner = ownerMailingState !== cityState;

  let score = 0;
  if (hasPriceDrop)     score += 30;
  if (hasLongDOM)       score += 25;
  if (belowMarket)      score += 20;
  if (hasRelisted)      score += 25;
  if (isAbsenteeOwner)  score += 15;
  if (equityPct > 0.60) score += 10;
  if ((p.years_owned || 0) > 15) score += 10;
  if (tax_delinquent)   score += 20;
  if (vacancy_signal)   score += 15;
  if (inherited)        score += 10;
  score = Math.min(100, score);

  const rentEstimate  = Math.round(p.price * deterministicFloat(p.id + '-rent', 0.009, 0.016));
  const daysInDefault = Math.floor(p.days_on_market * deterministicFloat(p.id + '-def', 0.5, 0.8));

  // Weighted lead_type override (not derived from flags)
  const lead_type = pickLeadType();

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
    years_owned:              p.owner_name ? rand(1, 40) : null,
    tax_delinquent,
    vacancy_signal,
    inherited,
    absentee_owner:           isAbsenteeOwner,
  };
}

// ── Property generator ────────────────────────────────────────────────────────
function generateDistressedProps(city, count) {
  const avgPrice   = Math.round((city.minPrice + city.maxPrice) / 2);
  const priceRange = city.maxPrice - city.minPrice;
  const props = [];
  const usedAddresses = new Set();

  for (let i = 0; i < count; i++) {
    let address;
    do {
      address = `${rand(101, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`;
    } while (usedAddresses.has(address));
    usedAddresses.add(address);

    const zip       = String(rand(city.zipStart, city.zipEnd)).padStart(5, '0');
    const sqft      = rand(700, 2000);
    const basePrice = Math.max(city.minPrice, rand(
      avgPrice - Math.floor(priceRange / 2),
      avgPrice + Math.floor(priceRange / 2),
    ));

    // All records have long DOM (distressed requirement)
    const dom = rand(90, 365);

    // Price history with bigger drops (15–40%)
    const bucket = i % 3;
    let priceHistory;

    if (bucket === 0) {
      // Single prior listing with 15–40% drop
      const dropPct = 0.15 + seededRand() * 0.25;
      const prev    = Math.round(basePrice / (1 - dropPct));
      priceHistory  = [prev, basePrice];
    } else if (bucket === 1) {
      // Two prior listings — cascading drops
      const drop1 = 0.10 + seededRand() * 0.15;
      const drop2 = 0.10 + seededRand() * 0.15;
      const mid   = Math.round(basePrice / (1 - drop1));
      const orig  = Math.round(mid / (1 - drop2));
      priceHistory = [orig, mid, basePrice];
    } else {
      // Single step drop
      const dropPct = 0.15 + seededRand() * 0.20;
      const prev    = Math.round(basePrice / (1 - dropPct));
      priceHistory  = [prev, basePrice];
    }

    const id = `${city.abbr}-${String(i + 1).padStart(4, '0')}`;

    const prop = {
      id,
      address,
      city:           city.name,
      zip,
      price:          basePrice,
      sqft,
      days_on_market: dom,
      price_history:  priceHistory,
      // Higher owner data rate for distressed — more skip-trace value
      owner_name:     seededRand() < 0.55 ? pick(OWNER_NAMES) : null,
      loan_balance:   seededRand() < 0.50
        ? Math.round(basePrice * (0.10 + seededRand() * 0.40))
        : undefined,
      years_owned:    null,
    };

    const signal = generateDistressedSignal(prop, city.avgPriceSqft, city.state, city.areaCode);
    props.push(signal);
  }
  return props;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const signalsPath = join(__dirname, '..', 'lib', 'data', 'generated-signals.json');
const existing    = JSON.parse(readFileSync(signalsPath, 'utf-8'));
console.log(`Existing signals: ${existing.length.toLocaleString()}`);

const newSignals = [];

console.log('\n── Generating 300 distressed records per city ───────────────────────');
for (const city of DISTRESSED_CITIES) {
  const batch = generateDistressedProps(city, 300);
  newSignals.push(...batch);
  console.log(`  ${city.name.padEnd(20)} ${city.state}  $${(city.minPrice/1000).toFixed(0)}k–$${(city.maxPrice/1000).toFixed(0)}k  +${batch.length}`);
}

console.log(`\nNew distressed signals generated: ${newSignals.length.toLocaleString()}`);

// ── Append & write ────────────────────────────────────────────────────────────
const combined = [...existing, ...newSignals];
writeFileSync(signalsPath, JSON.stringify(combined, null, 2), 'utf-8');
console.log(`Total signals written: ${combined.length.toLocaleString()}`);

// ── Verification stats ────────────────────────────────────────────────────────
const byCity = {};
for (const s of combined) byCity[s.city] = (byCity[s.city] || 0) + 1;

// Stats on the new batch only
let taxCount = 0, vacCount = 0, inhCount = 0;
let ltPre = 0, ltExp = 0, ltInv = 0;
let totalDrop = 0, dropCount = 0;

for (const s of newSignals) {
  if (s.tax_delinquent) taxCount++;
  if (s.vacancy_signal) vacCount++;
  if (s.inherited)      inhCount++;
  if (s.lead_type === 'Pre-Foreclosure')     ltPre++;
  if (s.lead_type === 'Expired Listing')     ltExp++;
  if (s.lead_type === 'Investor Opportunity') ltInv++;
  if (s.price_drop_percent !== null) { totalDrop += s.price_drop_percent; dropCount++; }
}

const n = newSignals.length;

console.log('\n── Distressed batch stats ───────────────────────────────────────────');
console.log(`  tax_delinquent:    ${taxCount} / ${n}  (${(taxCount/n*100).toFixed(1)}%)`);
console.log(`  vacancy_signal:    ${vacCount} / ${n}  (${(vacCount/n*100).toFixed(1)}%)`);
console.log(`  inherited:         ${inhCount} / ${n}  (${(inhCount/n*100).toFixed(1)}%)`);
console.log(`  Pre-Foreclosure:   ${ltPre}  (${(ltPre/n*100).toFixed(1)}%)`);
console.log(`  Expired Listing:   ${ltExp}  (${(ltExp/n*100).toFixed(1)}%)`);
console.log(`  Investor Opp:      ${ltInv}  (${(ltInv/n*100).toFixed(1)}%)`);
console.log(`  Avg price drop:    ${dropCount > 0 ? (totalDrop/dropCount).toFixed(1) : 'N/A'}%`);

console.log('\n── Per-city totals (all records) ────────────────────────────────────');
for (const city of DISTRESSED_CITIES) {
  console.log(`  ${city.name.padEnd(20)} ${city.state}  ${(byCity[city.name] || 0).toLocaleString()} total records`);
}

console.log('\n── Summary ──────────────────────────────────────────────────────────');
console.log(`  Cities updated/added: ${DISTRESSED_CITIES.length}`);
console.log(`  New distressed records: ${newSignals.length.toLocaleString()}`);
console.log(`  Grand total:            ${combined.length.toLocaleString()}`);
console.log(`  Unique cities:          ${Object.keys(byCity).length}`);
