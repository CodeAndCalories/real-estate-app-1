/**
 * sendDealAlerts.ts
 *
 * Runs daily via GitHub Actions. For each saved search, finds properties
 * added/updated in the last 24h that match the filters, and emails the
 * user via Resend if any are found.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const RESEND_API_KEY = process.env.RESEND_API_KEY!
const BASE_URL = process.env.SITE_URL ?? 'https://propertysignalhq.com'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface SavedSearch {
  id: string
  user_email: string
  city: string | null
  lead_type: string | null
  min_score: number
  label: string | null
}

interface Property {
  address: string
  city: string
  lead_type: string
  opportunity_score: number | null
  estimated_value: number | null
}

async function fetchMatchingProperties(search: SavedSearch): Promise<Property[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('properties')
    .select('address, city, lead_type, opportunity_score, estimated_value')
    .gte('created_at', since)
    .gte('opportunity_score', search.min_score)
    .order('opportunity_score', { ascending: false })
    .limit(50)

  if (search.city) query = query.ilike('city', search.city)
  if (search.lead_type) query = query.eq('lead_type', search.lead_type)

  const { data, error } = await query
  if (error) {
    console.error(`[alert] query error for ${search.user_email}:`, error.message)
    return []
  }
  return (data ?? []) as Property[]
}

function buildFinderUrl(search: SavedSearch): string {
  const params = new URLSearchParams()
  if (search.city) params.set('city', search.city)
  if (search.lead_type) params.set('lead_type', search.lead_type)
  if (search.min_score > 0) params.set('min_score', String(search.min_score))
  const qs = params.toString()
  return `${BASE_URL}/finder${qs ? `?${qs}` : ''}`
}

function buildEmailHtml(search: SavedSearch, properties: Property[]): string {
  const city = search.label ?? search.city ?? 'your market'
  const finderUrl = buildFinderUrl(search)
  const top5 = properties.slice(0, 5)

  const rows = top5
    .map(
      (p) => `
    <tr style="border-bottom:1px solid #1e293b;">
      <td style="padding:12px 16px;color:#e2e8f0;font-size:14px;">${p.address}, ${p.city}</td>
      <td style="padding:12px 16px;color:#94a3b8;font-size:13px;">${p.lead_type}</td>
      <td style="padding:12px 16px;text-align:center;">
        <span style="background:#1d4ed8;color:#fff;font-weight:700;font-size:13px;padding:3px 10px;border-radius:20px;">
          ${p.opportunity_score ?? '—'}/100
        </span>
      </td>
      <td style="padding:12px 16px;color:#94a3b8;font-size:13px;text-align:right;">
        ${p.estimated_value ? `$${p.estimated_value.toLocaleString()}` : '—'}
      </td>
    </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="margin-bottom:28px;">
      <span style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        PropertySignal<span style="color:#60a5fa;">HQ</span>
      </span>
    </div>

    <!-- Headline -->
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff;line-height:1.3;">
      🔥 ${properties.length} new deal${properties.length !== 1 ? 's' : ''} found in ${city}
    </h1>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">
      ${properties.length} propert${properties.length !== 1 ? 'ies match' : 'y matches'} your saved search added in the last 24 hours.
    </p>

    <!-- Table -->
    <table style="width:100%;border-collapse:collapse;background:#0f172a;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <thead>
        <tr style="background:#1e293b;">
          <th style="padding:10px 16px;text-align:left;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Address</th>
          <th style="padding:10px 16px;text-align:left;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Type</th>
          <th style="padding:10px 16px;text-align:center;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Score</th>
          <th style="padding:10px 16px;text-align:right;color:#64748b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Est. Value</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- CTA -->
    <a href="${finderUrl}" style="display:inline-block;background:#2563eb;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:32px;">
      View All ${properties.length} Deal${properties.length !== 1 ? 's' : ''} →
    </a>

    <!-- Footer -->
    <p style="color:#334155;font-size:12px;line-height:1.6;">
      You're receiving this because you saved a search on PropertySignalHQ.<br>
      <a href="${BASE_URL}/alerts" style="color:#475569;text-decoration:underline;">Manage your alerts</a>
    </p>
  </div>
</body>
</html>`
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'PropertySignalHQ <alerts@propertysignalhq.com>',
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Resend error ${res.status}: ${text}`)
  }
}

async function logAlert(search: SavedSearch, count: number): Promise<void> {
  const { error } = await supabase.from('alert_logs').insert({
    user_email: search.user_email,
    search_id: search.id,
    properties_found: count,
  })
  if (error) console.error('[alert] log error:', error.message)
}

async function main() {
  console.log('[alerts] Starting deal alert run...')

  const { data: searches, error } = await supabase
    .from('saved_searches')
    .select('*')

  if (error) {
    console.error('[alerts] Failed to fetch saved searches:', error.message)
    process.exit(1)
  }

  if (!searches || searches.length === 0) {
    console.log('[alerts] No saved searches found. Exiting.')
    return
  }

  console.log(`[alerts] Processing ${searches.length} saved search(es)...`)

  for (const search of searches as SavedSearch[]) {
    const properties = await fetchMatchingProperties(search)

    if (properties.length === 0) {
      console.log(`[alerts] No new deals for ${search.user_email} (${search.city ?? 'all cities'})`)
      continue
    }

    const city = search.label ?? search.city ?? 'your market'
    const subject = `🔥 ${properties.length} new deal${properties.length !== 1 ? 's' : ''} found in ${city}`
    const html = buildEmailHtml(search, properties)

    try {
      await sendEmail(search.user_email, subject, html)
      console.log(`[alerts] Sent to ${search.user_email}: ${properties.length} deals in ${city}`)
      await logAlert(search, properties.length)
    } catch (err) {
      console.error(`[alerts] Failed to send to ${search.user_email}:`, err)
      await logAlert(search, 0)
    }
  }

  console.log('[alerts] Done.')
}

main()
