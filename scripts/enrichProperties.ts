/**
 * scripts/enrichProperties.ts
 *
 * Enriches every record in lib/data/properties.json with:
 *   owner_phone, owner_mailing_address, owner_state, years_owned,
 *   tax_delinquent, vacancy_signal, inherited
 *
 * Also appends 200 Los Angeles, CA and 200 New York, NY records.
 *
 * Safe to re-run: records that already have owner_phone are skipped.
 *
 * Usage:
 *   npx ts-node scripts/enrichProperties.ts
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const propertiesPath = join(process.cwd(), 'lib', 'data', 'properties.json')

// ── Deterministic PRNG (FNV-1a) ───────────────────────────────────────────────
// Returns a stable float in [0, 1) for a given seed + integer offset.
// Same seed + offset always produces the same value.

function fnv1a(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

function rng(seed: string, offset: number): number {
  return fnv1a(seed + '\x00' + String(offset)) / 0xffffffff
}

/** Integer in [lo, hi] inclusive */
function ri(seed: string, off: number, lo: number, hi: number): number {
  return lo + Math.floor(rng(seed, off) * (hi - lo + 1))
}

/** Float in [lo, hi) */
function rf(seed: string, off: number, lo: number, hi: number): number {
  return lo + rng(seed, off) * (hi - lo)
}

/** Boolean with given probability */
function rb(seed: string, off: number, p: number): boolean {
  return rng(seed, off) < p
}

/** Pick a random element from an array */
function rp<T>(seed: string, off: number, arr: readonly T[]): T {
  return arr[Math.floor(rng(seed, off) * arr.length)]
}

// ── Phone number generation ───────────────────────────────────────────────────

const AREA_CODES: Record<string, readonly number[]> = {
  AZ: [480, 602, 623],
  FL: [305, 727, 786, 813, 941, 954],
  TX: [214, 281, 469, 512, 713, 832, 972],
  GA: [404, 470, 678, 770],
  NV: [702, 725],
  IL: [312, 630, 773, 847, 872],
  OH: [216, 234, 330, 440],
  CA: [213, 310, 323, 408, 415, 424, 619, 818],
  NY: [212, 347, 516, 646, 718, 914, 917, 929],
  NC: [704, 828, 910, 919, 980, 984],
  TN: [423, 615, 629, 731, 865, 901],
  IN: [219, 260, 317, 463, 765, 812],
  CO: [303, 719, 720, 970],
}
const FALLBACK_AREA_CODES: readonly number[] = [214, 312, 404, 503, 614, 615, 720, 816, 901, 971]

function genPhone(state: string, seed: string): string {
  const codes = AREA_CODES[state] ?? FALLBACK_AREA_CODES
  const area = rp(seed, 10, codes)
  const mid  = String(ri(seed, 11, 200, 999)).padStart(3, '0')
  const last = String(ri(seed, 12, 1000, 9999)).padStart(4, '0')
  return `(${area}) ${mid}-${last}`
}

// ── Mailing address generation ────────────────────────────────────────────────

type MailingTemplate = { street: string; city: string; state: string; zip: string }

/** Same-state street/zip pools (for 80% in-state owners) */
const SAME_STATE_POOLS: Record<string, MailingTemplate[]> = {
  AZ: [
    { street: 'Camelback Rd',      city: 'Phoenix',    state: 'AZ', zip: '85013' },
    { street: 'McDowell Rd',        city: 'Phoenix',    state: 'AZ', zip: '85004' },
    { street: 'Scottsdale Rd',      city: 'Scottsdale', state: 'AZ', zip: '85251' },
    { street: 'Indian School Rd',   city: 'Phoenix',    state: 'AZ', zip: '85014' },
    { street: 'Chandler Blvd',      city: 'Chandler',   state: 'AZ', zip: '85225' },
  ],
  FL: [
    { street: 'Biscayne Blvd',  city: 'Miami',      state: 'FL', zip: '33101' },
    { street: 'Coral Way',       city: 'Miami',      state: 'FL', zip: '33145' },
    { street: 'Collins Ave',     city: 'Miami Beach',state: 'FL', zip: '33139' },
    { street: 'Bayshore Blvd',   city: 'Tampa',      state: 'FL', zip: '33606' },
    { street: 'Gulf Blvd',       city: 'Clearwater', state: 'FL', zip: '33767' },
  ],
  TX: [
    { street: 'Greenville Ave', city: 'Dallas',  state: 'TX', zip: '75206' },
    { street: 'Preston Rd',     city: 'Dallas',  state: 'TX', zip: '75205' },
    { street: 'Westheimer Rd',  city: 'Houston', state: 'TX', zip: '77056' },
    { street: 'South Lamar',    city: 'Austin',  state: 'TX', zip: '78704' },
    { street: 'Broadway St',    city: 'San Antonio', state: 'TX', zip: '78209' },
  ],
  GA: [
    { street: 'Peachtree Rd',       city: 'Atlanta', state: 'GA', zip: '30305' },
    { street: 'Piedmont Ave',        city: 'Atlanta', state: 'GA', zip: '30308' },
    { street: 'Ponce de Leon Ave',   city: 'Atlanta', state: 'GA', zip: '30306' },
    { street: 'Roswell Rd',          city: 'Sandy Springs', state: 'GA', zip: '30328' },
    { street: 'Buford Hwy',          city: 'Doraville', state: 'GA', zip: '30340' },
  ],
  NV: [
    { street: 'Sahara Ave',         city: 'Las Vegas', state: 'NV', zip: '89102' },
    { street: 'Flamingo Rd',         city: 'Las Vegas', state: 'NV', zip: '89103' },
    { street: 'Spring Mountain Rd',  city: 'Las Vegas', state: 'NV', zip: '89117' },
    { street: 'Tropicana Ave',       city: 'Las Vegas', state: 'NV', zip: '89119' },
    { street: 'Eastern Ave',         city: 'Henderson', state: 'NV', zip: '89011' },
  ],
  IL: [
    { street: 'Michigan Ave',  city: 'Chicago',    state: 'IL', zip: '60601' },
    { street: 'Clark St',       city: 'Chicago',    state: 'IL', zip: '60614' },
    { street: 'Dearborn St',    city: 'Chicago',    state: 'IL', zip: '60603' },
    { street: 'Lincoln Ave',    city: 'Chicago',    state: 'IL', zip: '60657' },
    { street: 'Green Bay Rd',   city: 'Evanston',   state: 'IL', zip: '60201' },
  ],
  OH: [
    { street: 'Euclid Ave',    city: 'Cleveland', state: 'OH', zip: '44114' },
    { street: 'Carnegie Ave',   city: 'Cleveland', state: 'OH', zip: '44115' },
    { street: 'Mayfield Rd',    city: 'Cleveland Hts', state: 'OH', zip: '44118' },
    { street: 'Pearl Rd',       city: 'Strongsville', state: 'OH', zip: '44136' },
    { street: 'Coventry Rd',    city: 'Cleveland Hts', state: 'OH', zip: '44118' },
  ],
  CA: [
    { street: 'Sunset Blvd',    city: 'Los Angeles',  state: 'CA', zip: '90028' },
    { street: 'Wilshire Blvd',   city: 'Beverly Hills', state: 'CA', zip: '90210' },
    { street: 'Melrose Ave',     city: 'Los Angeles',  state: 'CA', zip: '90046' },
    { street: 'Mission St',      city: 'San Francisco', state: 'CA', zip: '94112' },
    { street: 'La Jolla Blvd',   city: 'San Diego',    state: 'CA', zip: '92037' },
  ],
  NY: [
    { street: '5th Ave',         city: 'New York',    state: 'NY', zip: '10022' },
    { street: 'Park Ave',         city: 'New York',    state: 'NY', zip: '10021' },
    { street: 'Atlantic Ave',     city: 'Brooklyn',    state: 'NY', zip: '11201' },
    { street: 'Queens Blvd',      city: 'Forest Hills', state: 'NY', zip: '11375' },
    { street: 'Pelham Pkwy',      city: 'Bronx',       state: 'NY', zip: '10469' },
  ],
  NC: [
    { street: 'Providence Rd',    city: 'Charlotte',   state: 'NC', zip: '28211' },
    { street: 'South Blvd',       city: 'Charlotte',   state: 'NC', zip: '28209' },
    { street: 'Hillsborough St',  city: 'Raleigh',     state: 'NC', zip: '27603' },
    { street: 'Glenwood Ave',     city: 'Raleigh',     state: 'NC', zip: '27605' },
    { street: 'Tryon St',         city: 'Charlotte',   state: 'NC', zip: '28202' },
  ],
  TN: [
    { street: 'Broadway',         city: 'Nashville',   state: 'TN', zip: '37203' },
    { street: 'West End Ave',     city: 'Nashville',   state: 'TN', zip: '37205' },
    { street: 'Charlotte Ave',    city: 'Nashville',   state: 'TN', zip: '37209' },
    { street: 'Nolensville Pike', city: 'Nashville',   state: 'TN', zip: '37211' },
    { street: 'Gallatin Ave',     city: 'Nashville',   state: 'TN', zip: '37206' },
  ],
  IN: [
    { street: 'Meridian St',      city: 'Indianapolis', state: 'IN', zip: '46204' },
    { street: 'Washington St',    city: 'Indianapolis', state: 'IN', zip: '46204' },
    { street: 'Keystone Ave',     city: 'Indianapolis', state: 'IN', zip: '46220' },
    { street: 'College Ave',      city: 'Indianapolis', state: 'IN', zip: '46220' },
    { street: 'Broad Ripple Ave', city: 'Indianapolis', state: 'IN', zip: '46220' },
  ],
  CO: [
    { street: 'Colfax Ave',       city: 'Denver',      state: 'CO', zip: '80218' },
    { street: 'Broadway',         city: 'Denver',      state: 'CO', zip: '80203' },
    { street: 'Colorado Blvd',    city: 'Denver',      state: 'CO', zip: '80206' },
    { street: 'Federal Blvd',     city: 'Denver',      state: 'CO', zip: '80219' },
    { street: 'Speer Blvd',       city: 'Denver',      state: 'CO', zip: '80203' },
  ],
}

/** Out-of-state templates for absentee owners */
const OUT_OF_STATE: readonly MailingTemplate[] = [
  { street: 'Ocean Dr',        city: 'Miami Beach',  state: 'FL', zip: '33139' },
  { street: 'Beverly Dr',      city: 'Beverly Hills', state: 'CA', zip: '90210' },
  { street: 'Park Ave',        city: 'New York',      state: 'NY', zip: '10022' },
  { street: 'Michigan Ave',    city: 'Chicago',       state: 'IL', zip: '60601' },
  { street: 'Peachtree Rd',    city: 'Atlanta',       state: 'GA', zip: '30305' },
  { street: 'Greenville Ave',  city: 'Dallas',        state: 'TX', zip: '75206' },
  { street: 'Sunset Blvd',     city: 'Los Angeles',   state: 'CA', zip: '90028' },
  { street: 'Collins Ave',     city: 'Miami',         state: 'FL', zip: '33101' },
  { street: 'Lake Shore Dr',   city: 'Chicago',       state: 'IL', zip: '60611' },
  { street: 'Post Oak Blvd',   city: 'Houston',       state: 'TX', zip: '77056' },
  { street: 'Wacker Dr',       city: 'Chicago',       state: 'IL', zip: '60606' },
  { street: 'Main St',         city: 'Seattle',       state: 'WA', zip: '98101' },
  { street: 'Brickell Ave',    city: 'Miami',         state: 'FL', zip: '33131' },
  { street: 'Las Vegas Blvd',  city: 'Las Vegas',     state: 'NV', zip: '89101' },
  { street: 'Ocean Ave',       city: 'Santa Monica',  state: 'CA', zip: '90402' },
  { street: 'Wilshire Blvd',   city: 'Santa Monica',  state: 'CA', zip: '90401' },
  { street: 'Scottsdale Rd',   city: 'Scottsdale',    state: 'AZ', zip: '85251' },
  { street: 'Boylston St',     city: 'Boston',        state: 'MA', zip: '02116' },
  { street: 'Capitol Hill',    city: 'Seattle',       state: 'WA', zip: '98122' },
  { street: 'Peachtree St',    city: 'Atlanta',       state: 'GA', zip: '30303' },
]

function genMailingAddress(
  propertyState: string,
  propertyCity: string,
  seed: string,
): { address: string; state: string } {
  const isOutOfState = rb(seed, 20, 0.20)

  if (isOutOfState) {
    const options = OUT_OF_STATE.filter((t) => t.state !== propertyState)
    const tmpl = rp(seed, 21, options)
    const num  = ri(seed, 22, 100, 9999)
    return {
      address: `${num} ${tmpl.street}, ${tmpl.city}, ${tmpl.state} ${tmpl.zip}`,
      state: tmpl.state,
    }
  }

  const pool = SAME_STATE_POOLS[propertyState]
  if (pool && pool.length > 0) {
    const tmpl = rp(seed, 23, pool)
    const num  = ri(seed, 24, 100, 9999)
    return {
      address: `${num} ${tmpl.street}, ${tmpl.city}, ${tmpl.state} ${tmpl.zip}`,
      state: tmpl.state,
    }
  }

  // Fallback: generic same-state address
  const num = ri(seed, 25, 100, 9999)
  return {
    address: `${num} Main St, ${propertyCity}, ${propertyState} 00000`,
    state: propertyState,
  }
}

// ── Lead-type detection (mirrors generateSignals logic, no imports needed) ────

type RawProp = Record<string, unknown> & {
  id: string
  state: string
  city: string
  price: number
  sqft: number
  days_on_market: number
  price_history: number[]
}

function detectLeadType(p: RawProp): 'Pre-Foreclosure' | 'Expired Listing' | 'Investor Opportunity' {
  const hist = p.price_history
  let priceDrop = 0
  if (hist.length >= 2) {
    const prev = hist[hist.length - 2]
    const curr = hist[hist.length - 1]
    if (prev > 0 && prev > curr) priceDrop = ((prev - curr) / prev) * 100
  }
  const hasPriceDrop = priceDrop > 7
  const hasLongDOM   = p.days_on_market > 90
  const hasRelisted  = hist.length > 2
  if (hasPriceDrop && hasLongDOM) return 'Pre-Foreclosure'
  if (hasRelisted) return 'Expired Listing'
  return 'Investor Opportunity'
}

// ── Enrich a single existing record ──────────────────────────────────────────

function enrichRecord(p: RawProp): RawProp {
  // Idempotent: skip if already enriched
  if (typeof p.owner_phone === 'string') return p

  const seed     = p.id
  const leadType = detectLeadType(p)
  const isPreFC  = leadType === 'Pre-Foreclosure'
  const isDistressed = isPreFC || leadType === 'Expired Listing'

  const years_owned        = Math.max(2, Math.min(34, isDistressed
    ? ri(seed, 30, 10, 34)
    : ri(seed, 30, 2, 20)))
  const tax_delinquent     = rb(seed, 31, isPreFC ? 0.35 : 0.10)
  const vacancy_signal     = rb(seed, 32, 0.20)
  const inherited          = rb(seed, 33, 0.08)
  const owner_phone        = genPhone(p.state, seed)
  const { address: owner_mailing_address, state: owner_state } =
    genMailingAddress(p.state, p.city, seed)

  return {
    ...p,
    owner_phone,
    owner_mailing_address,
    owner_state,
    years_owned,
    tax_delinquent,
    vacancy_signal,
    inherited,
  }
}

// ── New city record generation ────────────────────────────────────────────────

const LA_STREETS: readonly string[] = [
  'Sunset Blvd', 'Wilshire Blvd', 'Melrose Ave', 'Hollywood Blvd', 'Ventura Blvd',
  'Santa Monica Blvd', 'Pico Blvd', 'Venice Blvd', 'Olympic Blvd', 'Sepulveda Blvd',
  'La Brea Ave', 'Fairfax Ave', 'Western Ave', 'Vermont Ave', 'Normandie Ave',
  'Crenshaw Blvd', 'Jefferson Blvd', 'Adams Blvd', 'Manchester Ave', 'Century Blvd',
  'Figueroa St', 'Hill St', 'Spring St', 'Main St', 'Broadway', 'Grand Ave',
  'Cahuenga Blvd', 'Highland Ave', 'Fountain Ave', 'Silverlake Blvd', 'Hyperion Ave',
  'Glendale Blvd', 'Rowena Ave', 'Fletcher Dr', 'Riverside Dr', 'Magnolia Blvd',
  'Lankershim Blvd', 'Burbank Blvd', 'Victory Blvd', 'Laurel Canyon Blvd',
]

const LA_ZIPS: readonly string[] = [
  '90001', '90002', '90004', '90005', '90006', '90007', '90008', '90011', '90012',
  '90015', '90016', '90019', '90020', '90022', '90023', '90024', '90025', '90026',
  '90027', '90028', '90029', '90031', '90032', '90034', '90035', '90036', '90037',
  '90038', '90039', '90041', '90042', '90043', '90044', '90046', '90047', '90048',
  '90049', '90056', '90057', '90059', '90062', '90063', '90064', '90065', '90066',
  '91101', '91103', '91104', '91105', '91106', '91107', '91201', '91202', '91204',
]

const NY_STREETS: readonly string[] = [
  '5th Ave', 'Park Ave', 'Lexington Ave', 'Madison Ave', '3rd Ave', '2nd Ave', '1st Ave',
  'Broadway', 'Columbus Ave', 'Amsterdam Ave', 'Riverside Dr', 'West End Ave',
  'Atlantic Ave', 'Bedford Ave', 'Flatbush Ave', 'Fulton St', 'Jamaica Ave',
  'Roosevelt Ave', 'Northern Blvd', 'Queens Blvd', 'Grand Concourse',
  'Jerome Ave', 'Boston Rd', 'White Plains Rd', 'Pelham Pkwy',
  'Eastern Pkwy', 'Ocean Ave', 'Nostrand Ave', 'Utica Ave', 'Crown St',
  'Myrtle Ave', 'Dekalb Ave', 'Gates Ave', 'Halsey St', 'Court St',
  'Henry St', 'Columbia St', 'Van Brunt St', 'Smith St', 'Clinton St',
]

const NY_ZIPS: readonly string[] = [
  '10001', '10002', '10003', '10004', '10009', '10010', '10011',
  '10012', '10013', '10014', '10016', '10017', '10018', '10019', '10021', '10022',
  '10023', '10024', '10025', '10026', '10027', '10028', '10029', '10030', '10031',
  '11201', '11203', '11205', '11206', '11207', '11208', '11209', '11210', '11211',
  '11212', '11213', '11214', '11215', '11216', '11217', '11218', '11219', '11220',
  '11354', '11355', '11356', '11357', '11358', '11362', '11364', '11366',
]

const FIRST_NAMES: readonly string[] = [
  'James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica',
  'Christopher', 'Daniel', 'Paul', 'Mark', 'Donald', 'George', 'Kenneth', 'Steven',
  'Maria', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Dorothy',
  'Wei', 'Juan', 'Carlos', 'Jose', 'Luis', 'Miguel', 'Ana', 'Rosa', 'Diana', 'Sofia',
  'Yuki', 'Hiroshi', 'Aisha', 'Omar', 'Fatima', 'Chen', 'Zhang', 'Liu', 'Min',
]

const LAST_NAMES: readonly string[] = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Kim', 'Park', 'Chen', 'Zhang', 'Wang', 'Liu', 'Li', 'Singh', 'Patel', 'Khan',
]

function isoDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 86_400_000)
  return d.toISOString().split('T')[0]
}

function generateCityRecord(
  areaPrefix: string,
  city: string,
  state: string,
  streets: readonly string[],
  zips: readonly string[],
  priceMin: number,
  priceMax: number,
  index: number,
): RawProp {
  const id   = `${areaPrefix}-${String(index + 1).padStart(4, '0')}`
  const seed = id

  const streetNum = ri(seed, 1, 100, 9999)
  const street    = rp(seed, 2, streets)
  const address   = `${streetNum} ${street}`
  const zip       = rp(seed, 3, zips)

  const beds  = ri(seed, 4, 1, 4)
  const baths = Math.max(1, Math.min(beds, ri(seed, 5, 1, 3)))
  const sqft  = ri(seed, 6, 500, 3200)

  // Lead type bucket: 0=Pre-Foreclosure (25%), 1=Expired (25%), 2/3=Investor (50%)
  const bucket = index % 4

  const basePrice = ri(seed, 7, priceMin, priceMax)

  let price_history: number[]
  let days_on_market: number

  if (bucket === 0) {
    // Pre-Foreclosure: drop >7% + DOM >90
    const orig = Math.round(basePrice * (1 + rf(seed, 8, 0.10, 0.28)))
    const mid  = Math.round(orig  * (1 - rf(seed, 9, 0.02, 0.06)))
    price_history  = [orig, mid, basePrice]
    days_on_market = ri(seed, 10, 92, 300)
  } else if (bucket === 1) {
    // Expired Listing: relisted 3+ times
    const orig   = Math.round(basePrice * (1 + rf(seed, 8, 0.06, 0.18)))
    const mid    = Math.round(orig * (1 - rf(seed, 9, 0.02, 0.05)))
    const recent = Math.round(mid  * (1 - rf(seed, 10, 0.01, 0.04)))
    price_history  = [orig, mid, recent, basePrice]
    days_on_market = ri(seed, 11, 40, 200)
  } else {
    // Investor Opportunity
    if (rb(seed, 8, 0.40)) {
      const orig = Math.round(basePrice * (1 + rf(seed, 9, 0.02, 0.09)))
      price_history = [orig, basePrice]
    } else {
      price_history = [basePrice]
    }
    days_on_market = ri(seed, 10, 10, 89)
  }

  const price        = price_history[price_history.length - 1]
  const loan_balance = Math.round(price * rf(seed, 15, 0.32, 0.72))

  const owner_name = `${rp(seed, 16, FIRST_NAMES)} ${rp(seed, 17, LAST_NAMES)}`
  const owner_phone = genPhone(state, seed)
  const { address: owner_mailing_address, state: owner_state } =
    genMailingAddress(state, city, seed)

  const isDistressed = bucket === 0 || bucket === 1
  const years_owned    = Math.max(2, Math.min(34, isDistressed
    ? ri(seed, 30, 8, 34) : ri(seed, 30, 2, 18)))
  const tax_delinquent = rb(seed, 31, bucket === 0 ? 0.35 : 0.10)
  const vacancy_signal = rb(seed, 32, 0.20)
  const inherited      = rb(seed, 33, 0.08)

  const listing_date  = isoDate(days_on_market + ri(seed, 40, 5, 30))
  const last_updated  = isoDate(ri(seed, 41, 1, 28))

  return {
    id,
    address,
    city,
    state,
    zip,
    price,
    beds,
    baths,
    sqft,
    days_on_market,
    price_history,
    listing_date,
    last_updated,
    loan_balance,
    owner_name,
    owner_phone,
    owner_mailing_address,
    owner_state,
    years_owned,
    tax_delinquent,
    vacancy_signal,
    inherited,
  } as RawProp
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('PropertySignalHQ — Property Enrichment')
console.log('========================================')
console.log(`Source: ${propertiesPath}`)
console.log()

let properties: RawProp[]
try {
  const content = readFileSync(propertiesPath, 'utf-8')
  properties = JSON.parse(content) as RawProp[]
} catch (err) {
  console.error('ERROR: Could not read properties.json:', err)
  process.exit(1)
}

console.log(`Loaded ${properties.length} existing records`)

// --- Enrich existing records --------------------------------------------------
const alreadyEnriched = properties.filter((p) => typeof p.owner_phone === 'string').length
const enriched = properties.map(enrichRecord)
console.log(`Enriched ${enriched.length - alreadyEnriched} new records (${alreadyEnriched} already had owner_phone)`)

// --- Remove any pre-existing LA / NY records then re-add clean set -----------
const existing = enriched.filter(
  (p) => !(p.id as string).startsWith('la-') && !(p.id as string).startsWith('ny-'),
)

// --- Generate 200 LA records -------------------------------------------------
const laRecords: RawProp[] = []
for (let i = 0; i < 200; i++) {
  laRecords.push(generateCityRecord('la', 'Los Angeles', 'CA', LA_STREETS, LA_ZIPS, 600_000, 1_800_000, i))
}
console.log(`Generated ${laRecords.length} Los Angeles records`)

// --- Generate 200 NY records -------------------------------------------------
const nyRecords: RawProp[] = []
for (let i = 0; i < 200; i++) {
  nyRecords.push(generateCityRecord('ny', 'New York', 'NY', NY_STREETS, NY_ZIPS, 500_000, 2_200_000, i))
}
console.log(`Generated ${nyRecords.length} New York records`)

// --- Combine -----------------------------------------------------------------
const output = [...existing, ...laRecords, ...nyRecords]
console.log(`Total records after enrichment: ${output.length}`)
console.log()

try {
  writeFileSync(propertiesPath, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`✓ Written to ${propertiesPath}`)
} catch (err) {
  console.error('ERROR: Could not write properties.json:', err)
  process.exit(1)
}

// --- Summary -----------------------------------------------------------------
const cities: Record<string, number> = {}
for (const p of output) {
  cities[p.city as string] = (cities[p.city as string] ?? 0) + 1
}
console.log()
console.log('Records by city:')
for (const [city, count] of Object.entries(cities).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${city.padEnd(16)} ${count}`)
}
console.log()
console.log('Done.')
