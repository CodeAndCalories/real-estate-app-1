import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { Resend } from 'resend'
import { supabaseAdmin } from '@/lib/supabase-admin'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'axigamingclips@gmail.com'
const FROM_EMAIL  = 'noreply@propertysignalhq.com'

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
  city:       string
  date:       string
  totalCount: number
  avgScore:   number | null
  properties: PropertyRow[]
  market:     MarketRow | null
}

// ── PDF builder ───────────────────────────────────────────────────────────────

function buildPdf(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: 'LETTER' })
    const chunks: Buffer[] = []
    doc.on('data',  (c: Buffer) => chunks.push(c))
    doc.on('end',   ()         => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W      = 612   // letter width  (points)
    const H      = 792   // letter height (points)
    const M      = 48    // body margin
    const NAVY   = '#0f172a'
    const SLATE  = '#1e293b'
    const LIGHT  = '#f1f5f9'
    const MUTED  = '#94a3b8'
    const BODY   = '#334155'
    const WHITE  = '#ffffff'
    const BLUE   = '#60a5fa'
    const STRIPE = '#f8fafc'

    // ── Header band ──────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 88).fill(NAVY)

    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(22)
       .text('PropertySignal', M, 26, { continued: true })
    doc.fillColor(BLUE).text('HQ')

    doc.fillColor(MUTED).font('Helvetica').fontSize(10)
       .text(
         `${data.city} Market Report  ·  Generated ${data.date}`,
         M, 54, { width: W - M * 2 },
       )

    // ── Market Overview ───────────────────────────────────────────────────────
    let y = 108

    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(13)
       .text('Market Overview', M, y)
    y += 22

    const tempLabel = (t: number | null) => {
      if (t == null) return '—'
      if (t >= 70)   return 'Hot 🔥'
      if (t >= 40)   return 'Warm'
      return 'Cool'
    }

    const stats = [
      {
        label: 'Total Signals',
        value: data.totalCount > 0 ? data.totalCount.toLocaleString() : '—',
      },
      {
        label: 'Avg Score',
        value: data.avgScore != null ? `${data.avgScore}/100` : '—',
      },
      {
        label: 'Market Temp',
        value: tempLabel(data.market?.market_temp_index ?? null),
      },
      {
        label: 'Median Value',
        value: data.market?.median_home_value != null
          ? `$${Math.round(data.market.median_home_value / 1000)}K`
          : '—',
      },
      {
        label: 'Typical Rent',
        value: data.market?.typical_rent != null
          ? `$${data.market.typical_rent.toLocaleString()}/mo`
          : '—',
      },
    ]

    const gap  = 8
    const boxW = (W - M * 2 - gap * (stats.length - 1)) / stats.length
    const boxH = 56

    stats.forEach((stat, i) => {
      const bx = M + i * (boxW + gap)
      doc.roundedRect(bx, y, boxW, boxH, 4).fill(LIGHT)
      doc.fillColor('#64748b').font('Helvetica').fontSize(7.5)
         .text(stat.label, bx + 4, y + 9, { width: boxW - 8, align: 'center' })
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(14)
         .text(stat.value, bx + 4, y + 24, { width: boxW - 8, align: 'center' })
    })

    y += boxH + 24

    // ── Top 10 table ─────────────────────────────────────────────────────────
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(13)
       .text('Top 10 Opportunities', M, y)
    y += 18

    // Disclaimer line
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(8)
       .text('Owner contact info available on Pro plan — upgrade at propertysignalhq.com/pricing', M, y)
    y += 14

    const cols = [
      { label: 'Address',     x: M,            w: 210 },
      { label: 'Lead Type',   x: M + 214,      w: 90  },
      { label: 'Score',       x: M + 308,      w: 46  },
      { label: 'Est. Value',  x: M + 358,      w: 84  },
      { label: 'Days on Mkt', x: M + 446,      w: 70  },
    ]

    // Header row
    doc.rect(M, y, W - M * 2, 20).fill(SLATE)
    cols.forEach(col => {
      doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(8)
         .text(col.label, col.x + 4, y + 6, { width: col.w - 8 })
    })
    y += 20

    // Data rows
    const rowH = 20
    const rows = data.properties.length > 0 ? data.properties : []

    rows.forEach((prop, i) => {
      doc.rect(M, y, W - M * 2, rowH).fill(i % 2 === 0 ? STRIPE : LIGHT)

      const addr = (prop.address ?? '—').length > 38
        ? (prop.address ?? '').slice(0, 35) + '…'
        : (prop.address ?? '—')
      const lt   = (prop.lead_type ?? '—').replace(/_/g, ' ')
      const sc   = prop.opportunity_score != null ? String(prop.opportunity_score) : '—'
      const val  = prop.estimated_value   != null
        ? `$${Number(prop.estimated_value).toLocaleString()}`
        : '—'
      const dom  = prop.days_on_market    != null ? `${prop.days_on_market}d` : '—'

      const cells = [addr, lt, sc, val, dom]
      cols.forEach((col, ci) => {
        doc.fillColor(BODY).font('Helvetica').fontSize(8)
           .text(cells[ci], col.x + 4, y + 6, { width: col.w - 8 })
      })
      y += rowH
    })

    if (rows.length === 0) {
      doc.rect(M, y, W - M * 2, 40).fill(STRIPE)
      doc.fillColor(MUTED).font('Helvetica').fontSize(10)
         .text('No scored properties found for this city yet.', M, y + 14, {
           width: W - M * 2, align: 'center',
         })
      y += 40
    }

    // ── Footer band ───────────────────────────────────────────────────────────
    const footerY = H - 56
    doc.rect(0, footerY, W, 56).fill(NAVY)

    doc.fillColor(WHITE).font('Helvetica-Bold').fontSize(9)
       .text(
         'Upgrade to Pro for owner contact info and unlimited access',
         M, footerY + 10,
         { width: W - M * 2, align: 'center' },
       )
    doc.fillColor(BLUE).font('Helvetica').fontSize(9)
       .text(
         'propertysignalhq.com/pricing',
         M, footerY + 24,
         { width: W - M * 2, align: 'center' },
       )
    doc.fillColor('#475569').font('Helvetica').fontSize(7.5)
       .text(
         `© ${new Date().getFullYear()} PropertySignalHQ · Data updated daily`,
         M, footerY + 40,
         { width: W - M * 2, align: 'center' },
       )

    doc.end()
  })
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Parse + validate body ────────────────────────────────────────────────
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, city } = (body as Record<string, string>)
  if (!email?.trim() || !city?.trim()) {
    return NextResponse.json(
      { error: 'email and city are required' },
      { status: 400 },
    )
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const cleanCity  = city.trim()
  const cleanEmail = email.trim().toLowerCase()

  try {

  // ── Save subscriber ──────────────────────────────────────────────────────
  const subResult = await supabaseAdmin
    .from('email_subscribers')
    .upsert({ email: cleanEmail }, { onConflict: 'email' })
  if (subResult.error) {
    console.error('[market-report] email_subscribers upsert error:', subResult.error)
  }

  // ── Fetch top 10 properties ──────────────────────────────────────────────
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
  const properties = propResult.data

  // ── City-level stats ─────────────────────────────────────────────────────
  const statsResult = await supabaseAdmin
    .from('properties')
    .select('opportunity_score', { count: 'exact', head: false })
    .ilike('city', cleanCity)
    .not('opportunity_score', 'is', null)
  if (statsResult.error) {
    console.error('[market-report] stats query error:', statsResult.error)
  }
  const totalCount = statsResult.count
  const scoredRows = statsResult.data

  const avgScore =
    scoredRows && scoredRows.length > 0
      ? Math.round(
          scoredRows.reduce((s, r) => s + (r.opportunity_score as number), 0) /
          scoredRows.length,
        )
      : null

  // ── Zillow market data ───────────────────────────────────────────────────
  const marketResult = await supabaseAdmin
    .from('zillow_market_data')
    .select('metro_name, median_home_value, typical_rent, market_temp_index')
    .ilike('metro_name', `%${cleanCity}%`)
    .limit(1)
  if (marketResult.error) {
    console.error('[market-report] zillow_market_data query error:', marketResult.error)
  }
  const market = (marketResult.data as MarketRow[] | null)?.[0] ?? null

  // ── DEBUG: return JSON so we can verify all queries work ─────────────────
  // TODO: remove this block once confirmed working, restore PDF response below
  return NextResponse.json({
    _debug:          true,
    city:            cleanCity,
    totalCount:      totalCount ?? 0,
    avgScore,
    propertiesCount: properties?.length ?? 0,
    propertiesSample: (properties ?? []).slice(0, 2),
    market,
    subscriberError: subResult.error?.message ?? null,
    propertiesError: propResult.error?.message ?? null,
    statsError:      statsResult.error?.message ?? null,
    marketError:     marketResult.error?.message ?? null,
  })

  // ── Build PDF ────────────────────────────────────────────────────────────
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const pdfBuffer = await buildPdf({
    city:       cleanCity,
    date,
    totalCount: totalCount ?? 0,
    avgScore,
    properties: (properties as PropertyRow[] | null) ?? [],
    market,
  })

  // ── Send emails (non-blocking — don't fail the response on email error) ──
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://propertysignalhq.com'}/market-report`

  try {
    await Promise.allSettled([
      // Email to the requester
      resend.emails.send({
        from:    FROM_EMAIL,
        to:      cleanEmail,
        subject: `Your ${cleanCity} Market Report is Ready 🏠`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#020617;color:#e2e8f0;padding:32px;border-radius:12px">
            <h1 style="color:#ffffff;font-size:22px;margin-bottom:8px">
              Your <span style="color:#60a5fa">${cleanCity}</span> Market Report is Ready
            </h1>
            <p style="color:#94a3b8;margin-bottom:24px">
              Your PDF was downloaded to your browser. Here's a quick summary:
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr style="background:#1e293b">
                <td style="padding:8px 12px;color:#94a3b8;font-size:13px">Total signals</td>
                <td style="padding:8px 12px;color:#ffffff;font-weight:600;text-align:right">${(totalCount ?? 0).toLocaleString()}</td>
              </tr>
              <tr style="background:#0f172a">
                <td style="padding:8px 12px;color:#94a3b8;font-size:13px">Average score</td>
                <td style="padding:8px 12px;color:#ffffff;font-weight:600;text-align:right">${avgScore != null ? `${avgScore}/100` : '—'}</td>
              </tr>
              ${market?.median_home_value != null ? `
              <tr style="background:#1e293b">
                <td style="padding:8px 12px;color:#94a3b8;font-size:13px">Median home value</td>
                <td style="padding:8px 12px;color:#ffffff;font-weight:600;text-align:right">$${Math.round((market?.median_home_value ?? 0) / 1000)}K</td>
              </tr>` : ''}
            </table>
            <p style="color:#94a3b8;font-size:13px;margin-bottom:20px">
              Want owner contact details, phone numbers, and mailing addresses?
            </p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://propertysignalhq.com'}/pricing"
               style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
              Upgrade to Pro →
            </a>
            <p style="color:#475569;font-size:11px;margin-top:28px">
              Need a fresh report? <a href="${reportUrl}" style="color:#60a5fa">Generate another here</a>.
            </p>
          </div>
        `,
      }),

      // Admin notification
      resend.emails.send({
        from:    FROM_EMAIL,
        to:      ADMIN_EMAIL,
        subject: `📄 Market Report Request — ${cleanCity}`,
        text:    `Email: ${cleanEmail}\nCity: ${cleanCity}\nDate: ${date}\nTotal signals: ${totalCount ?? 0}`,
      }),
    ])
  } catch {
    // Email errors must not prevent PDF delivery
  }

  // ── Return PDF ───────────────────────────────────────────────────────────
  const filename = `${cleanCity.replace(/\s+/g, '-').toLowerCase()}-market-report.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status:  200,
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control':       'no-store',
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
