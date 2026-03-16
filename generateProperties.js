// generateProperties.js
// Run with: node generateProperties.js
// Writes 600 mock property records to lib/data/properties.json

const fs = require('fs')
const path = require('path')

// ─── Name pools ──────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'James','Maria','Robert','Linda','Michael','Barbara','William','Patricia',
  'David','Jennifer','Richard','Susan','Joseph','Jessica','Thomas','Sarah',
  'Charles','Karen','Christopher','Lisa','Daniel','Nancy','Matthew','Betty',
  'Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Dorothy',
  'Paul','Kimberly','Andrew','Emily','Kenneth','Donna','Joshua','Michelle',
  'Kevin','Carol','Brian','Amanda','George','Melissa','Edward','Deborah',
  'Ronald','Stephanie','Timothy','Rebecca','Jason','Sharon','Jeffrey','Laura',
  'Ryan','Cynthia','Gary','Kathleen','Jacob','Amy','Nicholas','Angela',
  'Eric','Shirley','Stephen','Anna','Jonathan','Brenda','Larry','Pamela',
]

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
  'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson',
  'Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson',
  'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker',
  'Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell',
  'Carter','Roberts','Turner','Phillips','Evans','Parker','Collins','Edwards',
  'Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz',
  'Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos',
  'Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Patel','Myers',
]

const AGENT_NAMES = [
  'Sarah Mitchell','Tom Rodriguez','Lisa Chen','David Park','Jennifer Walsh',
  'Mike Torres','Amanda Foster','Carlos Rivera','Rachel Kim','James O\'Brien',
  'Priya Patel','Brandon Lee','Cynthia Reyes','Mark Thompson','Nicole Sanchez',
  'Kevin Williams','Diana Cruz','Robert Hayes','Melissa Johnson','Derek Nguyen',
  'Stacy Anderson','Luis Morales','Karen Scott','Paul Martinez','Angela Davis',
]

// ─── City configs ─────────────────────────────────────────────────────────────
const CITY_CONFIG = {
  Miami: {
    zips: ['33101','33125','33127','33128','33130','33132','33135','33138',
           '33142','33145','33147','33150','33155','33160','33165','33174',
           '33176','33180','33183','33186'],
    streets: ['NW 7th Ave','SW 8th St','Brickell Ave','Collins Ave','Ocean Dr',
              'Coral Way','Bird Rd','Flagler St','LeJeune Rd','Miracle Mile',
              'Douglas Rd','Kendall Dr','Calle Ocho','Biscayne Blvd','Bayshore Dr'],
    valueMin: 280000, valueMax: 1800000,
    ppsqftMin: 180, ppsqftMax: 650,
    rentMin: 1800, rentMax: 8500,
  },
  'Los Angeles': {
    zips: ['90001','90004','90006','90011','90015','90018','90026','90027',
           '90028','90031','90035','90038','90042','90046','90057','90063',
           '90065','90068','90210','90291'],
    streets: ['Wilshire Blvd','Sunset Blvd','Hollywood Blvd','Figueroa St',
              'Venice Blvd','La Brea Ave','Melrose Ave','Western Ave',
              'Vermont Ave','Sepulveda Blvd','Pico Blvd','Olympic Blvd',
              'Santa Monica Blvd','Beverly Dr','Cahuenga Blvd','Rose Ave'],
    valueMin: 550000, valueMax: 3200000,
    ppsqftMin: 350, ppsqftMax: 1100,
    rentMin: 2800, rentMax: 14000,
  },
  'New York': {
    zips: ['10001','10009','10025','10027','10031','10035','10037','10039',
           '10040','11201','11203','11205','11207','11211','11213','11216',
           '11221','11226','11233','11238'],
    streets: ['Broadway','Amsterdam Ave','Flatbush Ave','Atlantic Ave',
              'Bedford Ave','Nostrand Ave','Fulton St','Grand Concourse',
              'Jerome Ave','St Nicholas Ave','Lenox Ave','Malcolm X Blvd',
              'Edgecombe Ave','Pitkin Ave','Utica Ave','Eastern Pkwy',
              'Classon Ave','Dekalb Ave','Myrtle Ave'],
    valueMin: 650000, valueMax: 2800000,
    ppsqftMin: 400, ppsqftMax: 1200,
    rentMin: 3200, rentMax: 15000,
  },
  Dallas: {
    zips: ['75201','75203','75204','75206','75207','75208','75210','75211',
           '75214','75215','75216','75217','75218','75224','75226','75227',
           '75228','75232','75237','75241'],
    streets: ['Elm St','Commerce St','Main St','Ross Ave','Mockingbird Ln',
              'Greenville Ave','Henderson Ave','Bryan St','Swiss Ave',
              'Gaston Ave','Buckner Blvd','Ferguson Rd','Garland Rd',
              'Abrams Rd','Lakewood Blvd','Hampton Rd','Singleton Blvd'],
    valueMin: 160000, valueMax: 850000,
    ppsqftMin: 90, ppsqftMax: 380,
    rentMin: 1100, rentMax: 4500,
  },
  Atlanta: {
    zips: ['30301','30303','30306','30307','30308','30309','30310','30311',
           '30312','30314','30315','30316','30317','30318','30319','30324',
           '30327','30331','30337','30344'],
    streets: ['Peachtree St','MLK Jr Dr','Auburn Ave','Moreland Ave',
              'Ponce de Leon Ave','Decatur St','Boulevard','Memorial Dr',
              'Ralph McGill Blvd','Edgewood Ave','Simpson St','Cascade Ave',
              'Campbellton Rd','Glenwood Ave','Flat Shoals Rd','Bankhead Hwy'],
    valueMin: 175000, valueMax: 950000,
    ppsqftMin: 95, ppsqftMax: 420,
    rentMin: 1200, rentMax: 5200,
  },
  Chicago: {
    zips: ['60601','60606','60608','60609','60612','60614','60616','60617',
           '60618','60619','60620','60621','60623','60624','60625','60628',
           '60629','60632','60636','60637'],
    streets: ['Michigan Ave','State St','Clark St','Halsted St','Kedzie Ave',
              'Western Ave','Pulaski Rd','Cicero Ave','Milwaukee Ave',
              'North Ave','Division St','Chicago Ave','Grand Ave',
              'Armitage Ave','Fullerton Ave','Belmont Ave','Elston Ave'],
    valueMin: 145000, valueMax: 980000,
    ppsqftMin: 80, ppsqftMax: 450,
    rentMin: 1000, rentMax: 5500,
  },
  Phoenix: {
    zips: ['85001','85003','85006','85007','85008','85009','85013','85014',
           '85015','85017','85019','85021','85022','85031','85033','85035',
           '85040','85041','85042','85043'],
    streets: ['Central Ave','7th Ave','7th St','McDowell Rd','Thomas Rd',
              'Indian School Rd','Camelback Rd','Glendale Ave','Dunlap Ave',
              'Northern Ave','Bethany Home Rd','Bell Rd','Cave Creek Rd',
              '19th Ave','35th Ave','51st Ave','Buckeye Rd','Van Buren St'],
    valueMin: 185000, valueMax: 820000,
    ppsqftMin: 100, ppsqftMax: 360,
    rentMin: 1200, rentMax: 4200,
  },
  Cleveland: {
    zips: ['44101','44102','44103','44104','44105','44106','44107','44108',
           '44109','44110','44111','44112','44113','44114','44115','44119',
           '44120','44121','44125','44128'],
    streets: ['Euclid Ave','Carnegie Ave','Superior Ave','St Clair Ave',
              'Lorain Ave','Detroit Ave','West 25th St','West 117th St',
              'Pearl Rd','Ridge Rd','Broadview Rd','Denison Ave','Clark Ave',
              'Fulton Rd','Memphis Ave','Snow Rd','Brookpark Rd','State Rd'],
    valueMin: 55000, valueMax: 390000,
    ppsqftMin: 35, ppsqftMax: 160,
    rentMin: 650, rentMax: 2200,
  },
}

const CITIES = Object.keys(CITY_CONFIG)
const LEAD_TYPES = ['Pre-Foreclosure', 'Expired Listing', 'Investor Opportunity']

// ─── Utilities ────────────────────────────────────────────────────────────────
let _seed = 42
function seededRand() {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff
  return ((_seed >>> 0) / 0xffffffff)
}

function rand(min, max) {
  return seededRand() * (max - min) + min
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1))
}

function pick(arr) {
  return arr[Math.floor(seededRand() * arr.length)]
}

function maybe(probability) {
  return seededRand() < probability
}

function round2(n) {
  return Math.round(n * 100) / 100
}

function ownerName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
}

// ─── Property builder ─────────────────────────────────────────────────────────
const usedAddresses = new Set()

function makeAddress(streets) {
  let addr
  let attempts = 0
  do {
    addr = `${randInt(100, 9899)} ${pick(streets)}`
    attempts++
  } while (usedAddresses.has(addr) && attempts < 20)
  usedAddresses.add(addr)
  return addr
}

function buildProperty(city, leadType) {
  const cfg = CITY_CONFIG[city]
  const address = makeAddress(cfg.streets)
  const zip = pick(cfg.zips)
  const estimatedValue = Math.round(rand(cfg.valueMin, cfg.valueMax) / 1000) * 1000
  const ppsqft = round2(rand(cfg.ppsqftMin, cfg.ppsqftMax))
  const marketAvgPpsqft = round2(ppsqft * rand(1.05, 1.25))

  let owner_name = null
  let loan_balance_estimate = null
  let days_in_default = null
  let previous_listing_price = null
  let days_on_market = null
  let agent_name = null
  let price_drop_percent = null
  let rent_estimate = null

  if (leadType === 'Pre-Foreclosure') {
    owner_name = ownerName()
    days_in_default = randInt(30, 270)
    loan_balance_estimate = Math.round(estimatedValue * rand(0.55, 0.90) / 1000) * 1000
    // Cross-type signals for higher scores
    if (maybe(0.30)) price_drop_percent = round2(rand(5, 22))
    if (maybe(0.35)) rent_estimate = Math.round(rand(cfg.rentMin, cfg.rentMax) / 50) * 50
    if (maybe(0.25)) days_on_market = randInt(91, 210)
    if (maybe(0.20)) previous_listing_price = Math.round(estimatedValue * rand(1.05, 1.20) / 1000) * 1000
  } else if (leadType === 'Expired Listing') {
    days_on_market = randInt(91, 365)
    price_drop_percent = round2(rand(3, 25))
    previous_listing_price = Math.round(estimatedValue * rand(1.05, 1.25) / 1000) * 1000
    agent_name = pick(AGENT_NAMES)
    if (maybe(0.70)) owner_name = ownerName()
    // Cross-type signals
    if (maybe(0.30)) loan_balance_estimate = Math.round(estimatedValue * rand(0.45, 0.75) / 1000) * 1000
    if (maybe(0.20)) days_in_default = randInt(30, 180)
    if (maybe(0.40)) rent_estimate = Math.round(rand(cfg.rentMin, cfg.rentMax) / 50) * 50
  } else {
    // Investor Opportunity
    rent_estimate = Math.round(rand(cfg.rentMin, cfg.rentMax) / 50) * 50
    if (maybe(0.80)) {
      const ltvFactor = maybe(0.55) ? rand(0.40, 0.58) : rand(0.60, 0.85)
      loan_balance_estimate = Math.round(estimatedValue * ltvFactor / 1000) * 1000
    }
    if (maybe(0.40)) price_drop_percent = round2(rand(5, 20))
    if (maybe(0.35)) days_on_market = randInt(91, 300)
    if (maybe(0.15)) days_in_default = randInt(30, 150)
    if (maybe(0.80)) owner_name = ownerName()
    if (maybe(0.50)) agent_name = pick(AGENT_NAMES)
    if (maybe(0.40)) previous_listing_price = Math.round(estimatedValue * rand(1.04, 1.18) / 1000) * 1000
  }

  return {
    address,
    city,
    zip,
    owner_name,
    estimated_value: estimatedValue,
    loan_balance_estimate,
    days_in_default,
    previous_listing_price,
    days_on_market,
    agent_name,
    lead_type: leadType,
    price_per_sqft: ppsqft,
    market_avg_price_per_sqft: marketAvgPpsqft,
    price_drop_percent,
    rent_estimate,
    opportunity_score: null,
  }
}

// ─── Generate dataset ─────────────────────────────────────────────────────────
const TOTAL = 600
const PER_CITY = Math.floor(TOTAL / CITIES.length) // 75
// Per city: 25 of each lead type
const PER_TYPE = Math.floor(PER_CITY / LEAD_TYPES.length) // 25

const properties = []

for (const city of CITIES) {
  for (const leadType of LEAD_TYPES) {
    for (let i = 0; i < PER_TYPE; i++) {
      properties.push(buildProperty(city, leadType))
    }
  }
}

// Fill remainder to hit exactly TOTAL
let i = 0
while (properties.length < TOTAL) {
  properties.push(buildProperty(CITIES[i % CITIES.length], LEAD_TYPES[i % LEAD_TYPES.length]))
  i++
}

// Shuffle so cities/types are interleaved
for (let j = properties.length - 1; j > 0; j--) {
  const k = Math.floor(seededRand() * (j + 1))
  ;[properties[j], properties[k]] = [properties[k], properties[j]]
}

// ─── Write output ─────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, 'lib', 'data', 'properties.json')
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(properties, null, 2), 'utf8')

console.log(`✅ Generated ${properties.length} properties across ${CITIES.length} cities`)
console.log(`📁 Written to: ${outPath}`)

const counts = {}
for (const p of properties) {
  counts[p.city] = (counts[p.city] || 0) + 1
}
for (const [city, count] of Object.entries(counts)) {
  console.log(`   ${city}: ${count}`)
}
