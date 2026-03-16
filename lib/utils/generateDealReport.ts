import type { Signal } from '@/lib/data/getSignals'

function fmt(v: number | null | undefined, prefix = ''): string {
  if (v == null) return '—'
  return prefix + v.toLocaleString()
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'Hot Lead'
  if (score >= 60) return 'Strong Opportunity'
  if (score >= 40) return 'Moderate'
  return 'Low Priority'
}

/**
 * Opens a print-ready HTML page in a new tab with the deal report.
 * Uses window.print() — works in all browsers without dependencies.
 */
export function generateDealReport(signal: Signal, priceHistory: number[] = []) {
  const score = signal.opportunity_score ?? 0
  const equity =
    signal.estimated_value > 0 && signal.loan_balance_estimate != null
      ? signal.estimated_value - signal.loan_balance_estimate
      : null
  const rentPct =
    signal.rent_estimate != null && signal.estimated_value > 0
      ? ((signal.rent_estimate / signal.estimated_value) * 100).toFixed(2) + '%'
      : null

  const historyRows = priceHistory.length > 0
    ? priceHistory
        .map(
          (p, i) =>
            `<tr><td>Entry #${i + 1}</td><td>${i < priceHistory.length - 1 ? '<s>' : ''}$${p.toLocaleString()}${i < priceHistory.length - 1 ? '</s>' : ''}</td></tr>`
        )
        .join('')
    : '<tr><td colspan="2" style="color:#aaa">No price history available</td></tr>'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Deal Report — ${signal.address}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 32px; }
  h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
  .subtitle { color: #555; margin-bottom: 24px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; border: 1px solid; margin-right: 6px; }
  .badge-green { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
  .badge-yellow { background: #fefce8; color: #854d0e; border-color: #fef08a; }
  .badge-red { background: #fff1f2; color: #9f1239; border-color: #fecdd3; }
  .badge-type { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
  .score-box { display: inline-flex; flex-direction: column; align-items: center; padding: 12px 20px; border-radius: 12px; border: 2px solid; margin-bottom: 20px; }
  .score-num { font-size: 36px; font-weight: 900; line-height: 1; }
  .score-lbl { font-size: 11px; font-weight: 600; margin-top: 4px; opacity: 0.8; }
  section { margin-bottom: 24px; }
  section h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #888; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; }
  table td, table th { padding: 6px 10px; text-align: left; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
  table tr:last-child td { border-bottom: none; }
  table td:first-child { color: #6b7280; width: 50%; }
  table td:last-child { font-weight: 600; }
  ul { padding-left: 16px; }
  ul li { margin-bottom: 5px; color: #1e40af; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #aaa; font-size: 11px; }
  @media print { body { padding: 20px; } button { display: none !important; } }
</style>
</head>
<body>
<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:8px">
  <div>
    <h1>${signal.address}</h1>
    <p class="subtitle">${signal.city}, ${signal.zip} &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    <span class="badge badge-type">${signal.lead_type}</span>
  </div>
  <div class="score-box ${score >= 80 ? 'badge-green' : score >= 60 ? 'badge-yellow' : 'badge-red'}">
    <span class="score-num">${score}</span>
    <span class="score-lbl">${scoreLabel(score)}</span>
  </div>
</div>

<button onclick="window.print()" style="margin-bottom:24px;padding:8px 20px;background:#2563eb;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer">
  🖨 Print / Save as PDF
</button>

<section>
  <h2>Property Details</h2>
  <table>
    <tr><td>Estimated Value</td><td>${fmt(signal.estimated_value, '$')}</td></tr>
    <tr><td>Estimated Equity</td><td style="color:${equity != null && equity > 0 ? '#16a34a' : equity != null && equity < 0 ? '#dc2626' : '#111'}">${equity != null ? fmt(equity, '$') : '—'}</td></tr>
    <tr><td>Loan Balance</td><td>${fmt(signal.loan_balance_estimate, '$')}</td></tr>
    <tr><td>Rent Estimate</td><td>${signal.rent_estimate != null ? fmt(signal.rent_estimate, '$') + '/mo' : '—'}</td></tr>
    <tr><td>Rent Yield</td><td>${rentPct ?? '—'}</td></tr>
    <tr><td>Days on Market</td><td>${signal.days_on_market != null ? signal.days_on_market + ' days' : '—'}</td></tr>
    <tr><td>Days in Default</td><td>${signal.days_in_default != null ? signal.days_in_default + ' days' : '—'}</td></tr>
    <tr><td>Price Drop</td><td>${signal.price_drop_percent != null ? signal.price_drop_percent + '%' : '—'}</td></tr>
    <tr><td>Price / sqft</td><td>${fmt(signal.price_per_sqft, '$')}</td></tr>
    <tr><td>Market Avg / sqft</td><td>${fmt(signal.market_avg_price_per_sqft, '$')}</td></tr>
    <tr><td>Lead Type</td><td>${signal.lead_type}</td></tr>
  </table>
</section>

<section>
  <h2>Price History</h2>
  <table>${historyRows}</table>
</section>

<section>
  <h2>Owner Information</h2>
  <table>
    <tr><td>Owner Name</td><td>${signal.owner_name ?? '—'}</td></tr>
    <tr><td>Mailing Address</td><td style="color:#aaa;font-style:italic">Not available</td></tr>
    <tr><td>Ownership Length</td><td style="color:#aaa;font-style:italic">Not available</td></tr>
  </table>
</section>

<div class="footer">
  Generated by PropertySignalHQ &nbsp;·&nbsp; Signal ID: ${signal.id ?? '—'} &nbsp;·&nbsp; ${new Date().toISOString()}
</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
