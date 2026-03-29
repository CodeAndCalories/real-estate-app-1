import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-admin'

const resend     = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'axigamingclips@gmail.com'
const FROM_EMAIL  = 'noreply@propertysignalhq.com'
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://propertysignalhq.com'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PropertyRow {
  address:           string | null
  lead_type:         string | null
  opportunity_score: number | null
  estimated_value:   number | null
  days_on_market:    number | null
}

interface MarketRow {
  metro_name:        string
  median_home_value: number | null
  typical_rent:      number | null
  market_temp_index: number | null
}

interface ReportData {
  city:           string
  date:           string
  recipientEmail: string
  totalCount:     number
  avgScore:       number | null
  properties:     PropertyRow[]
  market:         MarketRow | null
  isPro:          boolean
}

// ── HTML report builder ───────────────────────────────────────────────────────

function buildHtmlReport(data: ReportData): string {
  const { city, date, recipientEmail, totalCount, avgScore, properties, market, isPro } = data

  const tempLabel = (t: number | null) => {
    if (t == null) return '—'
    if (t >= 70)   return 'Hot 🔥'
    if (t >= 40)   return 'Warm 🌡'
    return 'Cool ❄'
  }

  const fmtUSD = (n: number | null) =>
    n != null ? `$${Math.round(n).toLocaleString()}` : '—'

  const medianStr = market?.median_home_value != null
    ? `$${Math.round(market.median_home_value / 1000)}K`
    : '—'
  const rentStr   = market?.typical_rent != null
    ? `$${Math.round(market.typical_rent).toLocaleString()}/mo`
    : '—'
  const tempStr   = tempLabel(market?.market_temp_index ?? null)

  const scoreClass = (s: number | null) => {
    if (s == null) return ''
    if (s >= 70)   return 'score-high'
    if (s >= 40)   return 'score-med'
    return 'score-low'
  }

  const tableRows = properties.length > 0
    ? properties.map(p => {
        const addr  = (p.address  ?? '—').replace(/</g, '&lt;')
        const lt    = (p.lead_type ?? '—').replace(/_/g, ' ')
        const sc    = p.opportunity_score ?? null
        const val   = fmtUSD(p.estimated_value)
        const dom   = p.days_on_market != null ? `${p.days_on_market}d` : '—'
        return `<tr>
          <td>${addr}</td>
          <td>${lt}</td>
          <td><span class="badge ${scoreClass(sc)}">${sc ?? '—'}</span></td>
          <td>${val}</td>
          <td>${dom}</td>
        </tr>`
      }).join('\n')
    : `<tr><td colspan="5" class="empty">No scored properties found for this city yet.</td></tr>`

  const year = new Date().getFullYear()

  const footerHtml = isPro
    ? `<div class="footer">
        <p><strong>Access your full dashboard</strong></p>
        <p><a href="${SITE_URL}/finder">${SITE_URL}/finder</a></p>
        <p class="fine">© ${year} PropertySignalHQ · Data updated daily · Generated for ${recipientEmail}</p>
      </div>`
    : `<div class="footer">
        <p><strong>Upgrade to Pro for owner contact info and unlimited access</strong></p>
        <p><a href="${SITE_URL}/pricing">${SITE_URL}/pricing</a> &nbsp;·&nbsp; Full access from $39/month</p>
        <p class="fine">© ${year} PropertySignalHQ · Data updated daily · Generated for ${recipientEmail}</p>
      </div>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PropertySignalHQ — ${city} Market Report</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif;
      background: #020617;
      color: #e2e8f0;
      padding: 32px 24px 80px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page { max-width: 860px; margin: 0 auto; }

    /* ── Header ── */
    .header {
      background: #0f172a;
      border: 1px solid #1e293b;
      color: white;
      padding: 24px 28px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo { font-size: 20px; font-weight: 800; color: #f8fafc; }
    .logo em { color: #60a5fa; font-style: normal; }
    .logo-sub { font-size: 12px; color: #475569; margin-top: 3px; }
    .header-right { text-align: right; }
    .header-right h2 { font-size: 17px; font-weight: 700; color: #f8fafc; }
    .header-right p { font-size: 12px; color: #64748b; margin-top: 3px; }

    /* ── Section title ── */
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .07em;
      color: #475569;
      margin: 0 0 10px;
    }

    /* ── Stats grid ── */
    .stats { margin-bottom: 20px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 8px;
    }
    .stat-card {
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px 8px;
      text-align: center;
    }
    .stat-label { font-size: 10px; color: #64748b; margin-bottom: 5px; }
    .stat-value { font-size: 17px; font-weight: 800; color: #f1f5f9; }

    /* ── Table ── */
    .table-section { margin-bottom: 20px; }
    .disclaimer { font-size: 11px; color: #475569; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #1e293b; }
    thead th {
      padding: 9px 11px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      letter-spacing: .04em;
    }
    tbody tr:nth-child(odd)  { background: #0a0f1e; }
    tbody tr:nth-child(even) { background: #0f172a; }
    tbody td {
      padding: 8px 11px;
      font-size: 12px;
      color: #94a3b8;
      border-bottom: 1px solid #1e293b;
    }
    td.empty {
      text-align: center;
      color: #475569;
      padding: 24px;
    }

    /* ── Score badges ── */
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
      padding: 2px 6px;
      background: #1e293b;
      color: #94a3b8;
    }
    .score-high { background: #14532d; color: #86efac; }
    .score-med  { background: #713f12; color: #fde68a; }
    .score-low  { background: #7f1d1d; color: #fca5a5; }

    /* ── Footer ── */
    .footer {
      background: #0f172a;
      border: 1px solid #1e293b;
      color: #64748b;
      padding: 18px 24px;
      border-radius: 10px;
      text-align: center;
      font-size: 12px;
      line-height: 1.6;
    }
    .footer strong { color: #e2e8f0; }
    .footer a { color: #60a5fa; text-decoration: none; }
    .footer .fine { font-size: 10px; color: #334155; margin-top: 8px; }

    /* ── Print toolbar (hidden on print) ── */
    .toolbar {
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      gap: 8px;
      z-index: 100;
    }
    .btn {
      padding: 11px 20px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary {
      background: #2563eb;
      color: #fff;
      box-shadow: 0 4px 14px rgba(37,99,235,.35);
    }
    .btn-secondary {
      background: #1e293b;
      color: #94a3b8;
    }

    @media print {
      body { padding: 0; }
      .toolbar { display: none; }
    }
  </style>
</head>
<body>
<div class="page">

  <div class="header">
    <div>
      <div class="logo">PropertySignal<em>HQ</em></div>
      <div class="logo-sub">Market Intelligence Report</div>
    </div>
    <div class="header-right">
      <h2>${city} Market Report</h2>
      <p>Generated ${date}</p>
      <p>propertysignalhq.com</p>
    </div>
  </div>

  <div class="stats">
    <p class="section-title">Market Overview</p>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Signals</div>
        <div class="stat-value">${totalCount.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Score</div>
        <div class="stat-value">${avgScore != null ? `${avgScore}/100` : '—'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Market Temp</div>
        <div class="stat-value">${tempStr}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Median Value</div>
        <div class="stat-value">${medianStr}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Typical Rent</div>
        <div class="stat-value">${rentStr}</div>
      </div>
    </div>
  </div>

  <div class="table-section">
    <p class="section-title">Top 10 Opportunities</p>
    <p class="disclaimer">Owner contact info (phone, mailing address) available on Pro plan — upgrade at propertysignalhq.com/pricing</p>
    <table>
      <thead>
        <tr>
          <th>Address</th>
          <th>Lead Type</th>
          <th>Score</th>
          <th>Est. Value</th>
          <th>Days on Market</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>

  ${footerHtml}

</div>
<div class="toolbar">
  <button class="btn btn-primary" onclick="window.print()">🖨&nbsp; Print / Save as PDF</button>
</div>
</body>
</html>`
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Parse + validate ─────────────────────────────────────────────────────
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, city, isPro } = (body as Record<string, unknown>)
  if (typeof email !== 'string' || !email.trim() ||
      typeof city  !== 'string' || !city.trim()) {
    return NextResponse.json({ error: 'email and city are required' }, { status: 400 })
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const cleanCity  = city.trim()
  const cleanEmail = email.trim().toLowerCase()
  const proUser    = isPro === true

  try {
    // ── Save subscriber ────────────────────────────────────────────────────
    const subResult = await supabaseAdmin
      .from('email_subscribers')
      .upsert({ email: cleanEmail }, { onConflict: 'email' })
    if (subResult.error) {
      console.error('[market-report] email_subscribers upsert error:', subResult.error)
    }

    // ── Top 10 properties ─────────────────────────────────────────────────
    const propResult = await supabaseAdmin
      .from('properties')
      .select('address, lead_type, opportunity_score, estimated_value, days_on_market')
      .ilike('city', cleanCity)
      .not('opportunity_score', 'is', null)
      .order('opportunity_score', { ascending: false })
      .limit(10)
    if (propResult.error) {
      console.error('[market-report] properties query error:', propResult.error)
    }

    // ── City stats ────────────────────────────────────────────────────────
    const statsResult = await supabaseAdmin
      .from('properties')
      .select('opportunity_score', { count: 'exact', head: false })
      .ilike('city', cleanCity)
      .not('opportunity_score', 'is', null)
    if (statsResult.error) {
      console.error('[market-report] stats query error:', statsResult.error)
    }

    const totalCount = statsResult.count ?? 0
    const scoredRows = statsResult.data ?? []
    const avgScore   = scoredRows.length > 0
      ? Math.round(
          scoredRows.reduce((s, r) => s + (r.opportunity_score as number), 0) / scoredRows.length,
        )
      : null

    // ── Zillow market data ─────────────────────────────────────────────────
    const marketResult = await supabaseAdmin
      .from('zillow_market_data')
      .select('metro_name, median_home_value, typical_rent, market_temp_index')
      .ilike('metro_name', `%${cleanCity}%`)
      .limit(1)
    if (marketResult.error) {
      console.error('[market-report] zillow_market_data query error:', marketResult.error)
    }

    const market = (marketResult.data as MarketRow[] | null)?.[0] ?? null

    // ── Build HTML report ──────────────────────────────────────────────────
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    const html = buildHtmlReport({
      city:           cleanCity,
      date,
      recipientEmail: cleanEmail,
      totalCount,
      avgScore,
      properties:     (propResult.data as PropertyRow[] | null) ?? [],
      market,
      isPro:          proUser,
    })

    // ── Send emails (non-blocking) ────────────────────────────────────────
    Promise.allSettled([
      resend.emails.send({
        from:    FROM_EMAIL,
        to:      cleanEmail,
        subject: `Your ${cleanCity} Market Report is Ready 🏠`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#020617;color:#e2e8f0;padding:32px;border-radius:12px">
            <h1 style="color:#fff;font-size:22px;margin-bottom:8px">
              Your <span style="color:#60a5fa">${cleanCity}</span> Market Report is Ready
            </h1>
            <p style="color:#94a3b8;margin-bottom:20px">
              Your HTML report was opened in a new tab. Press <strong style="color:#e2e8f0">Ctrl+P → Save as PDF</strong>
              to save a copy.
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr style="background:#1e293b">
                <td style="padding:8px 12px;color:#94a3b8;font-size:13px">City</td>
                <td style="padding:8px 12px;color:#fff;font-weight:600;text-align:right">${cleanCity}</td>
              </tr>
              <tr style="background:#0f172a">
                <td style="padding:8px 12px;color:#94a3b8;font-size:13px">Total signals</td>
                <td style="padding:8px 12px;color:#fff;font-weight:600;text-align:right">${totalCount.toLocaleString()}</td>
              </tr>
              <tr style="background:#1e293b">
                <td style="padding:8px 12px;color:#94a3b8;font-size:13px">Avg opportunity score</td>
                <td style="padding:8px 12px;color:#fff;font-weight:600;text-align:right">${avgScore != null ? `${avgScore}/100` : '—'}</td>
              </tr>
            </table>
            <p style="color:#94a3b8;font-size:13px;margin-bottom:18px">
              Upgrade to Pro to unlock owner phone numbers, mailing addresses, and unlimited signals.
            </p>
            <a href="${SITE_URL}/pricing"
               style="display:inline-block;background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              Upgrade to Pro →
            </a>
            <p style="color:#475569;font-size:11px;margin-top:28px">
              Generate another report at <a href="${SITE_URL}/market-report" style="color:#60a5fa">${SITE_URL}/market-report</a>
            </p>
          </div>`,
      }),
      resend.emails.send({
        from:    FROM_EMAIL,
        to:      ADMIN_EMAIL,
        subject: `📄 Market Report — ${cleanCity}`,
        text:    `Email: ${cleanEmail}\nCity: ${cleanCity}\nDate: ${date}\nSignals: ${totalCount}`,
      }),
    ]).catch(() => {/* non-critical */})

    // ── Return HTML ────────────────────────────────────────────────────────
    return new NextResponse(html, {
      status:  200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })

  } catch (err) {
    const e = err as Error
    console.error('[market-report] Unhandled error:', e.message, e.stack)
    return NextResponse.json(
      { error: 'Failed to generate report.', detail: e.message },
      { status: 500 },
    )
  }
}
