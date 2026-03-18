#!/usr/bin/env node
/**
 * scripts/generateProperties.js
 *
 * Generates RawProperty entries distributed across cities and writes:
 *   lib/data/properties.json        — raw property listings
 *   lib/data/generated-signals.json — processed signals (same logic as lib/signals/generateSignals.ts)
 *
 * Original 8 cities: 750 properties each (band-based signal distribution)
 *   Signal distribution targets:
 *     20% price drops (>7% below previous price)
 *     10% long days on market (>90 days)
 *      8% relisted properties (price_history.length > 2)
 *      5% below-market pricing (price/sqft < city avg * 0.85)
 *      4% hot leads (score ≥ 80) — price drop + relisted + long DOM combined
 *
 * Wave-1 cities (10): 750 properties each (balanced lead type distribution via i%3)
 * Wave-2 cities (10): 500 properties each (balanced lead type distribution via i%3)
 *   ~33% Pre-Foreclosure, ~33% Expired Listing, ~34% Investor Opportunity
 *   (no single lead type exceeds 60% per city)
 *
 * Usage: node scripts/generateProperties.js
 */
'use strict';

const { writeFileSync } = require('fs');
const { join }          = require('path');

// ─── City configuration ───────────────────────────────────────────────────────
const CITIES = [
  { name: 'Phoenix',   abbr: 'phx', state: 'AZ', zipPrefix: '850', avgPrice: 420000, priceRange: 220000, avgSqft: 2000, sqftRange: 900,  avgPriceSqft: 220 },
  { name: 'Miami',     abbr: 'mia', state: 'FL', zipPrefix: '331', avgPrice: 680000, priceRange: 420000, avgSqft: 1450, sqftRange: 650,  avgPriceSqft: 380 },
  { name: 'Dallas',    abbr: 'dal', state: 'TX', zipPrefix: '752', avgPrice: 400000, priceRange: 220000, avgSqft: 2200, sqftRange: 850,  avgPriceSqft: 180 },
  { name: 'Atlanta',   abbr: 'atl', state: 'GA', zipPrefix: '303', avgPrice: 395000, priceRange: 210000, avgSqft: 2000, sqftRange: 750,  avgPriceSqft: 190 },
  { name: 'Tampa',     abbr: 'tpa', state: 'FL', zipPrefix: '336', avgPrice: 460000, priceRange: 210000, avgSqft: 1800, sqftRange: 650,  avgPriceSqft: 250 },
  { name: 'Las Vegas', abbr: 'las', state: 'NV', zipPrefix: '891', avgPrice: 400000, priceRange: 190000, avgSqft: 1900, sqftRange: 700,  avgPriceSqft: 200 },
  { name: 'Chicago',   abbr: 'chi', state: 'IL', zipPrefix: '606', avgPrice: 375000, priceRange: 210000, avgSqft: 1750, sqftRange: 700,  avgPriceSqft: 220 },
  { name: 'Cleveland', abbr: 'cle', state: 'OH', zipPrefix: '441', avgPrice: 200000, priceRange: 130000, avgSqft: 1600, sqftRange: 650,  avgPriceSqft: 120 },
];

// ─── Wave-1 city configuration (750 properties each, balanced lead types) ────
const NEW_CITIES = [
  { name: 'Austin',       abbr: 'aus', state: 'TX', zipPrefix: '787', avgPrice: 560000, priceRange: 280000, avgSqft: 2000, sqftRange: 700,  avgPriceSqft: 280 },
  { name: 'Charlotte',    abbr: 'clt', state: 'NC', zipPrefix: '282', avgPrice: 380000, priceRange: 200000, avgSqft: 2100, sqftRange: 750,  avgPriceSqft: 185 },
  { name: 'Nashville',    abbr: 'bna', state: 'TN', zipPrefix: '372', avgPrice: 490000, priceRange: 240000, avgSqft: 1900, sqftRange: 650,  avgPriceSqft: 250 },
  { name: 'Raleigh',      abbr: 'rdu', state: 'NC', zipPrefix: '276', avgPrice: 420000, priceRange: 210000, avgSqft: 2000, sqftRange: 700,  avgPriceSqft: 210 },
  { name: 'Jacksonville', abbr: 'jax', state: 'FL', zipPrefix: '322', avgPrice: 320000, priceRange: 180000, avgSqft: 1850, sqftRange: 650,  avgPriceSqft: 165 },
  { name: 'Columbus',     abbr: 'cmh', state: 'OH', zipPrefix: '432', avgPrice: 280000, priceRange: 150000, avgSqft: 1700, sqftRange: 600,  avgPriceSqft: 160 },
  { name: 'Indianapolis', abbr: 'ind', state: 'IN', zipPrefix: '462', avgPrice: 265000, priceRange: 150000, avgSqft: 1800, sqftRange: 650,  avgPriceSqft: 145 },
  { name: 'Denver',       abbr: 'den', state: 'CO', zipPrefix: '802', avgPrice: 530000, priceRange: 250000, avgSqft: 1850, sqftRange: 650,  avgPriceSqft: 285 },
  { name: 'San Antonio',  abbr: 'sat', state: 'TX', zipPrefix: '782', avgPrice: 305000, priceRange: 170000, avgSqft: 2100, sqftRange: 750,  avgPriceSqft: 150 },
  { name: 'Houston',      abbr: 'hou', state: 'TX', zipPrefix: '770', avgPrice: 350000, priceRange: 210000, avgSqft: 2200, sqftRange: 800,  avgPriceSqft: 158 },
];

const NEW_PER_CITY = 750;

// ─── Wave-2 city configuration (500 properties each, balanced lead types) ────
const NEW_CITIES_2 = [
  { name: 'Seattle',        abbr: 'sea', state: 'WA', zipPrefix: '981', avgPrice: 750000, priceRange: 350000, avgSqft: 1600, sqftRange: 600, avgPriceSqft: 460 },
  { name: 'Portland',       abbr: 'pdx', state: 'OR', zipPrefix: '972', avgPrice: 520000, priceRange: 250000, avgSqft: 1700, sqftRange: 600, avgPriceSqft: 305 },
  { name: 'Minneapolis',    abbr: 'msp', state: 'MN', zipPrefix: '554', avgPrice: 340000, priceRange: 180000, avgSqft: 1700, sqftRange: 600, avgPriceSqft: 200 },
  { name: 'Kansas City',    abbr: 'mci', state: 'MO', zipPrefix: '641', avgPrice: 270000, priceRange: 150000, avgSqft: 1800, sqftRange: 650, avgPriceSqft: 148 },
  { name: 'Memphis',        abbr: 'mem', state: 'TN', zipPrefix: '381', avgPrice: 220000, priceRange: 130000, avgSqft: 1700, sqftRange: 600, avgPriceSqft: 130 },
  { name: 'Baltimore',      abbr: 'bwi', state: 'MD', zipPrefix: '212', avgPrice: 310000, priceRange: 160000, avgSqft: 1600, sqftRange: 600, avgPriceSqft: 195 },
  { name: 'Detroit',        abbr: 'det', state: 'MI', zipPrefix: '482', avgPrice: 170000, priceRange: 110000, avgSqft: 1500, sqftRange: 600, avgPriceSqft: 112 },
  { name: 'Pittsburgh',     abbr: 'pit', state: 'PA', zipPrefix: '152', avgPrice: 260000, priceRange: 140000, avgSqft: 1600, sqftRange: 600, avgPriceSqft: 163 },
  { name: 'Salt Lake City', abbr: 'slc', state: 'UT', zipPrefix: '841', avgPrice: 490000, priceRange: 220000, avgSqft: 1850, sqftRange: 650, avgPriceSqft: 265 },
  { name: 'New Orleans',    abbr: 'msy', state: 'LA', zipPrefix: '701', avgPrice: 290000, priceRange: 160000, avgSqft: 1600, sqftRange: 600, avgPriceSqft: 183 },
];

const NEW_PER_CITY_2 = 500;

const CITY_AVG_SQFT = {};
CITIES.forEach(c     => { CITY_AVG_SQFT[c.name.toLowerCase()] = c.avgPriceSqft; });
NEW_CITIES.forEach(c => { CITY_AVG_SQFT[c.name.toLowerCase()] = c.avgPriceSqft; });
NEW_CITIES_2.forEach(c => { CITY_AVG_SQFT[c.name.toLowerCase()] = c.avgPriceSqft; });

// ─── Street name pool ─────────────────────────────────────────────────────────
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
  'Joshua Ramirez', 'Joyce Gonzalez', 'Andrew Diaz', 'Frances Cruz', 'Kenneth Reyes',
  'Helen Morales', 'Patrick Murphy', 'Phyllis Cook', 'Timothy Rogers', 'Alice Bailey',
  'Jerry Ward', 'Lori Bell', 'Raymond Foster', 'Evelyn Butler', 'Philip Long',
  'Cheryl James', 'Harold Simmons', 'Megan Foster', 'Carl Patterson', 'Kathleen Hughes',
];

// ─── Seeded deterministic PRNG (LCG — no external deps) ──────────────────────
let seed = 20260315;
function seededRand() {
  seed = Math.imul(1664525, seed) + 1013904223 | 0;
  return (seed >>> 0) / 4294967296;
}
function rand(min, max) { return Math.floor(seededRand() * (max - min + 1)) + min; }
function pick(arr)       { return arr[Math.floor(seededRand() * arr.length)]; }

function daysAgo(n) {
  const d = new Date('2026-03-15');
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ─── Signal band layout (per city, 0-indexed within city batch) ──────────────
//
//  Band        Count  Signals
//  0 – 29        30   price drop + relisted + long DOM  → score 80  (Hot Lead)
//  30 – 59       30   price drop + relisted             → score 55
//  60 – 149      90   price drop only                   → score 30
//  150 – 194     45   long DOM only                     → score 25
//  195 – 232     38   below market only                 → score 20
//  233 – 749    517   normal                            → score 0
//
// Totals per city (750 props):
//   price drop : 30+30+90 = 150 = 20%  ✓
//   relisted   : 30+30    =  60 =  8%  ✓
//   long DOM   : 30+45    =  75 = 10%  ✓
//   below mkt  : 38       =  38 =  5%  ✓
//   hot (≥80)  : 30       =  30 =  4%

const TOTAL    = 6000;
const PER_CITY = TOTAL / CITIES.length; // 750 exactly

// ─── Generate properties ──────────────────────────────────────────────────────
const properties = [];

for (const city of CITIES) {
  const usedAddresses = new Set();

  for (let i = 0; i < PER_CITY; i++) {
    const hasPriceDrop = i <= 149;                      // bands 0-149
    const hasRelisted  = i <= 59;                       // bands 0-59
    const hasLongDOM   = i <= 29 || (i >= 150 && i <= 194); // bands 0-29 and 150-194
    const hasBelowMkt  = i >= 195 && i <= 232;          // band 195-232

    // Unique address within this city
    let address;
    do {
      address = `${rand(101, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`;
    } while (usedAddresses.has(address));
    usedAddresses.add(address);

    const zip  = `${city.zipPrefix}${rand(10, 99)}`;
    const beds = rand(2, 5);
    const baths = Math.max(1, beds - rand(0, 1));
    const sqft  = Math.max(800, rand(
      city.avgSqft - Math.floor(city.sqftRange / 2),
      city.avgSqft + Math.floor(city.sqftRange / 2)
    ));
    const basePrice = Math.max(80000, rand(
      city.avgPrice - Math.floor(city.priceRange / 2),
      city.avgPrice + Math.floor(city.priceRange / 2)
    ));

    // Days on market
    const dom = hasLongDOM ? rand(91, 210) : rand(5, 82);

    // Price history
    let priceHistory;
    if (hasPriceDrop && hasRelisted) {
      // Three entries: original → intermediate → current (current is lowest)
      const orig = Math.round(basePrice * (1 + 0.08 + seededRand() * 0.14));
      const mid  = Math.round(basePrice * (1 + 0.03 + seededRand() * 0.07));
      priceHistory = [orig, mid, basePrice];
    } else if (hasPriceDrop) {
      const prev = Math.round(basePrice * (1 + 0.08 + seededRand() * 0.14));
      priceHistory = [prev, basePrice];
    } else {
      priceHistory = [basePrice];
    }

    // Below-market: override price so price/sqft < city avg * 0.85
    let finalPrice = basePrice;
    if (hasBelowMkt) {
      finalPrice = Math.round(sqft * city.avgPriceSqft * (0.65 + seededRand() * 0.18));
      priceHistory = [finalPrice];
    }

    const id = `${city.abbr}-${String(i + 1).padStart(4, '0')}`;
    const listingDate = daysAgo(dom);
    const lastUpdated = daysAgo(rand(0, Math.min(dom - 1, 21)));

    const prop = {
      id,
      address,
      city: city.name,
      state: city.state,
      zip,
      price: finalPrice,
      beds,
      baths,
      sqft,
      days_on_market: dom,
      price_history: priceHistory,
      listing_date: listingDate,
      last_updated: lastUpdated,
    };

    if (seededRand() < 0.65) {
      prop.loan_balance = Math.round(finalPrice * (0.38 + seededRand() * 0.36));
    }
    if (seededRand() < 0.45) {
      prop.owner_name = pick(OWNER_NAMES);
    }

    properties.push(prop);
  }
}

// ─── Generate wave-1 cities (750 each, balanced i%3 lead type distribution) ──
//
//  bucket 0 (i%3===0): Pre-Foreclosure  — price drop >7% + DOM >90  (~250/750 = 33%)
//  bucket 1 (i%3===1): Expired Listing  — relisted 3+ times          (~250/750 = 33%)
//  bucket 2 (i%3===2): Investor Opp     — normal / minor price drop   (~250/750 = 33%)
//
//  No single lead type exceeds 34% — well under the 60% cap.

for (const city of NEW_CITIES) {
  const usedAddresses = new Set();

  for (let i = 0; i < NEW_PER_CITY; i++) {
    const bucket = i % 3; // 0=Pre-Foreclosure, 1=Expired Listing, 2=Investor Opportunity

    let address;
    do {
      address = `${rand(101, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`;
    } while (usedAddresses.has(address));
    usedAddresses.add(address);

    const zip   = `${city.zipPrefix}${rand(10, 99)}`;
    const beds  = rand(2, 5);
    const baths = Math.max(1, beds - rand(0, 1));
    const sqft  = Math.max(800, rand(
      city.avgSqft - Math.floor(city.sqftRange / 2),
      city.avgSqft + Math.floor(city.sqftRange / 2)
    ));
    const basePrice = Math.max(80000, rand(
      city.avgPrice - Math.floor(city.priceRange / 2),
      city.avgPrice + Math.floor(city.priceRange / 2)
    ));

    let priceHistory;
    let dom;

    if (bucket === 0) {
      // Pre-Foreclosure: price drop >7% AND DOM >90
      // prev is 9–24% above base → drop = 8–19% (always >7%)
      const prev = Math.round(basePrice * (1 + 0.09 + seededRand() * 0.15));
      priceHistory = [prev, basePrice];
      dom = rand(92, 250);
    } else if (bucket === 1) {
      // Expired Listing: 3 entries, last step drop only 1–5% (<7%) so not Pre-Foreclosure
      const mid  = Math.round(basePrice * (1 + 0.01 + seededRand() * 0.04)); // 1-5% above base
      const orig = Math.round(mid        * (1 + 0.05 + seededRand() * 0.12)); // orig highest
      priceHistory = [orig, mid, basePrice];
      dom = rand(35, 200);
    } else {
      // Investor Opportunity: normal or small single-step price drop (<7%)
      if (seededRand() < 0.35) {
        const prev = Math.round(basePrice * (1 + 0.01 + seededRand() * 0.05)); // 1–6% above
        priceHistory = [prev, basePrice];
      } else {
        priceHistory = [basePrice];
      }
      dom = rand(5, 85);
    }

    const id          = `${city.abbr}-${String(i + 1).padStart(4, '0')}`;
    const listingDate = daysAgo(dom);
    const lastUpdated = daysAgo(rand(0, Math.min(dom - 1, 21)));

    const prop = {
      id,
      address,
      city:           city.name,
      state:          city.state,
      zip,
      price:          priceHistory[priceHistory.length - 1],
      beds,
      baths,
      sqft,
      days_on_market: dom,
      price_history:  priceHistory,
      listing_date:   listingDate,
      last_updated:   lastUpdated,
    };

    if (seededRand() < 0.65) {
      prop.loan_balance = Math.round(prop.price * (0.38 + seededRand() * 0.36));
    }
    if (seededRand() < 0.45) {
      prop.owner_name = pick(OWNER_NAMES);
    }

    properties.push(prop);
  }
}

// ─── Generate wave-2 cities (500 each, balanced i%3 lead type distribution) ──
//
//  bucket 0 (i%3===0): Pre-Foreclosure  — price drop >7% + DOM >90  (~167/500 = 33%)
//  bucket 1 (i%3===1): Expired Listing  — relisted 3+ times          (~167/500 = 33%)
//  bucket 2 (i%3===2): Investor Opp     — normal / minor price drop   (~166/500 = 33%)

for (const city of NEW_CITIES_2) {
  const usedAddresses = new Set();

  for (let i = 0; i < NEW_PER_CITY_2; i++) {
    const bucket = i % 3; // 0=Pre-Foreclosure, 1=Expired Listing, 2=Investor Opportunity

    let address;
    do {
      address = `${rand(101, 9999)} ${pick(STREET_NAMES)} ${pick(STREET_TYPES)}`;
    } while (usedAddresses.has(address));
    usedAddresses.add(address);

    const zip   = `${city.zipPrefix}${rand(10, 99)}`;
    const beds  = rand(2, 5);
    const baths = Math.max(1, beds - rand(0, 1));
    const sqft  = Math.max(800, rand(
      city.avgSqft - Math.floor(city.sqftRange / 2),
      city.avgSqft + Math.floor(city.sqftRange / 2)
    ));
    const basePrice = Math.max(80000, rand(
      city.avgPrice - Math.floor(city.priceRange / 2),
      city.avgPrice + Math.floor(city.priceRange / 2)
    ));

    let priceHistory;
    let dom;

    if (bucket === 0) {
      // Pre-Foreclosure: price drop >7% AND DOM >90
      const prev = Math.round(basePrice * (1 + 0.09 + seededRand() * 0.15));
      priceHistory = [prev, basePrice];
      dom = rand(92, 250);
    } else if (bucket === 1) {
      // Expired Listing: 3 entries, last step drop only 1–5% (<7%) so not Pre-Foreclosure
      const mid  = Math.round(basePrice * (1 + 0.01 + seededRand() * 0.04));
      const orig = Math.round(mid        * (1 + 0.05 + seededRand() * 0.12));
      priceHistory = [orig, mid, basePrice];
      dom = rand(35, 200);
    } else {
      // Investor Opportunity: normal or small single-step price drop (<7%)
      if (seededRand() < 0.35) {
        const prev = Math.round(basePrice * (1 + 0.01 + seededRand() * 0.05));
        priceHistory = [prev, basePrice];
      } else {
        priceHistory = [basePrice];
      }
      dom = rand(5, 85);
    }

    const id          = `${city.abbr}-${String(i + 1).padStart(4, '0')}`;
    const listingDate = daysAgo(dom);
    const lastUpdated = daysAgo(rand(0, Math.min(dom - 1, 21)));

    const prop = {
      id,
      address,
      city:           city.name,
      state:          city.state,
      zip,
      price:          priceHistory[priceHistory.length - 1],
      beds,
      baths,
      sqft,
      days_on_market: dom,
      price_history:  priceHistory,
      listing_date:   listingDate,
      last_updated:   lastUpdated,
    };

    if (seededRand() < 0.65) {
      prop.loan_balance = Math.round(prop.price * (0.38 + seededRand() * 0.36));
    }
    if (seededRand() < 0.45) {
      prop.owner_name = pick(OWNER_NAMES);
    }

    properties.push(prop);
  }
}

// ─── Signal engine (mirrors lib/signals/generateSignals.ts exactly) ──────────
function deterministicFloat(id, min, max) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return min + ((hash % 1000) / 1000) * (max - min);
}

function generateSignals(props) {
  return props.map(p => {
    const cityKey    = p.city.toLowerCase();
    const marketAvg  = CITY_AVG_SQFT[cityKey] || 200;
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
    const hasLongDOM   = p.days_on_market > 90;
    const belowMarket  = pricePerSqft !== null && pricePerSqft < marketAvg * 0.85;
    const hasRelisted  = hist.length > 2;

    let score = 0;
    if (hasPriceDrop) score += 30;
    if (hasLongDOM)   score += 25;
    if (belowMarket)  score += 20;
    if (hasRelisted)  score += 25;
    score = Math.min(100, score);

    const loanBalance = (p.loan_balance != null)
      ? p.loan_balance
      : Math.round(p.price * deterministicFloat(p.id, 0.40, 0.72));

    const rentEstimate = Math.round(
      p.price * deterministicFloat(p.id + '-rent', 0.006, 0.011)
    );

    let lead_type = 'Investor Opportunity';
    if (hasPriceDrop && hasLongDOM) lead_type = 'Pre-Foreclosure';
    else if (hasRelisted)           lead_type = 'Expired Listing';

    const daysInDefault = p.days_on_market > 120
      ? Math.floor(p.days_on_market * deterministicFloat(p.id + '-def', 0.4, 0.6))
      : null;

    return {
      address:                   p.address,
      city:                      p.city,
      zip:                       p.zip,
      owner_name:                p.owner_name || null,
      estimated_value:           p.price,
      loan_balance_estimate:     loanBalance,
      days_in_default:           daysInDefault,
      previous_listing_price:    hist.length >= 2 ? hist[hist.length - 2] : null,
      days_on_market:            p.days_on_market,
      agent_name:                null,
      lead_type,
      price_per_sqft:            pricePerSqft,
      market_avg_price_per_sqft: marketAvg,
      price_drop_percent:        priceDrop,
      rent_estimate:             rentEstimate,
      opportunity_score:         score,
    };
  });
}

// ─── Write files ──────────────────────────────────────────────────────────────
const root           = join(__dirname, '..');
const propertiesPath = join(root, 'lib', 'data', 'properties.json');
const signalsPath    = join(root, 'lib', 'data', 'generated-signals.json');

writeFileSync(propertiesPath, JSON.stringify(properties, null, 2), 'utf-8');
console.log(`✓ Wrote ${properties.length} properties → ${propertiesPath}`);

const signals = generateSignals(properties);
writeFileSync(signalsPath, JSON.stringify(signals, null, 2), 'utf-8');
console.log(`✓ Wrote ${signals.length} signals    → ${signalsPath}`);

// ─── Stats ────────────────────────────────────────────────────────────────────
const pct = (n) => ((n / signals.length) * 100).toFixed(1) + '%';

const hot        = signals.filter(s => (s.opportunity_score || 0) >= 80).length;
const dropCount  = signals.filter(s => (s.price_drop_percent || 0) > 7).length;
const domCount   = signals.filter(s => (s.days_on_market || 0) > 90).length;
const relist     = properties.filter(p => p.price_history.length > 2).length;
const belowMkt   = signals.filter(s =>
  s.price_per_sqft !== null &&
  s.market_avg_price_per_sqft !== null &&
  s.price_per_sqft < s.market_avg_price_per_sqft * 0.85
).length;

const byCity = {};
for (const s of signals) byCity[s.city] = (byCity[s.city] || 0) + 1;

console.log('\nSignal distribution:');
console.log(`  Total signals  : ${signals.length}`);
console.log(`  Hot leads ≥80  : ${hot}  (${pct(hot)})`);
console.log(`  Price drops    : ${dropCount}  (${pct(dropCount)})`);
console.log(`  Long DOM >90d  : ${domCount}  (${pct(domCount)})`);
console.log(`  Relisted       : ${relist}  (${pct(relist)})`);
console.log(`  Below market   : ${belowMkt}  (${pct(belowMkt)})`);
console.log('\nBy city:');
for (const [city, n] of Object.entries(byCity)) {
  console.log(`  ${city.padEnd(12)} ${n}`);
}
