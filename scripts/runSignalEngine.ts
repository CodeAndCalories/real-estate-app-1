/**
 * scripts/runSignalEngine.ts
 *
 * Property data pipeline: loads raw property listings, runs the signal engine,
 * and writes the output to lib/data/generated-signals.json.
 *
 * Usage:
 *   npx ts-node scripts/runSignalEngine.ts
 *   npx ts-node scripts/runSignalEngine.ts --dry-run   (print stats only)
 *
 * ─── Scheduling options ────────────────────────────────────────────────────
 *  Cron job (Linux/macOS):
 *    0 2 * * * cd /app && npx ts-node scripts/runSignalEngine.ts >> /var/log/signals.log 2>&1
 *
 *  Vercel Cron (vercel.json):
 *    { "crons": [{ "path": "/api/refresh-signals", "schedule": "0 2 * * *" }] }
 *
 *  AWS EventBridge + Lambda:
 *    Schedule: rate(1 day) → triggers Lambda that runs this script
 *
 *  GitHub Actions (.github/workflows/refresh-signals.yml):
 *    on:
 *      schedule:
 *        - cron: '0 2 * * *'
 *    jobs:
 *      refresh:
 *        runs-on: ubuntu-latest
 *        steps:
 *          - uses: actions/checkout@v4
 *          - run: npx ts-node scripts/runSignalEngine.ts
 * ───────────────────────────────────────────────────────────────────────────
 */

import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

// ts-node resolves from project root; use require for JSON to avoid
// TypeScript strict-mode issues with dynamic paths.
const propertiesPath = join(process.cwd(), 'lib', 'data', 'properties.json')
const outputPath = join(process.cwd(), 'lib', 'data', 'generated-signals.json')

const isDryRun = process.argv.includes('--dry-run')

console.log('PropertySignalHQ — Signal Engine')
console.log('==================================')
console.log(`Source:  ${propertiesPath}`)
console.log(`Output:  ${outputPath}`)
console.log(`Mode:    ${isDryRun ? 'dry-run (no write)' : 'production'}`)
console.log()

// ── Load raw properties ────────────────────────────────────────────────────
let rawProperties: unknown[]
try {
  const content = readFileSync(propertiesPath, 'utf-8')
  rawProperties = JSON.parse(content) as unknown[]
} catch (err) {
  console.error('ERROR: Could not read properties.json:', err)
  process.exit(1)
}

console.log(`Loaded ${rawProperties.length} raw properties`)

// ── Run signal engine ──────────────────────────────────────────────────────
// Dynamic require avoids circular-import issues when running outside Next.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { generateSignals } = require('../lib/signals/generateSignals') as {
  generateSignals: (p: unknown[]) => unknown[]
}

const signals = generateSignals(rawProperties)

// ── Stats ──────────────────────────────────────────────────────────────────
const scored = signals as Array<{ opportunity_score: number | null; lead_type: string; city: string }>

const avgScore =
  scored.length > 0
    ? Math.round(scored.reduce((s, p) => s + (p.opportunity_score ?? 0), 0) / scored.length)
    : 0

const hotLeads = scored.filter((p) => (p.opportunity_score ?? 0) >= 80).length
const preForeclosure = scored.filter((p) => p.lead_type === 'Pre-Foreclosure').length
const expiredListings = scored.filter((p) => p.lead_type === 'Expired Listing').length

const cityCounts: Record<string, number> = {}
for (const s of scored) {
  cityCounts[s.city] = (cityCounts[s.city] ?? 0) + 1
}

console.log(`Generated ${signals.length} signals`)
console.log()
console.log('Score distribution:')
console.log(`  Average score:    ${avgScore}`)
console.log(`  Hot leads (≥80):  ${hotLeads}`)
console.log()
console.log('Lead types:')
console.log(`  Pre-Foreclosure:    ${preForeclosure}`)
console.log(`  Expired Listings:   ${expiredListings}`)
console.log(`  Investor Opps:      ${signals.length - preForeclosure - expiredListings}`)
console.log()
console.log('Signals by city:')
for (const [city, count] of Object.entries(cityCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${city.padEnd(14)} ${count}`)
}
console.log()

// ── Write output ───────────────────────────────────────────────────────────
if (!isDryRun) {
  try {
    writeFileSync(outputPath, JSON.stringify(signals, null, 2), 'utf-8')
    console.log(`✓ Written to ${outputPath}`)
  } catch (err) {
    console.error('ERROR: Could not write generated-signals.json:', err)
    process.exit(1)
  }
} else {
  console.log('(dry-run: skipped write)')
}

console.log()
console.log('Done.')
