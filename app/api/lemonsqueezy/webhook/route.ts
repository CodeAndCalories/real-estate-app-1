/**
 * Lemon Squeezy webhook handler
 *
 * Endpoint: POST /api/lemonsqueezy/webhook
 *
 * Configure in Lemon Squeezy dashboard:
 *   Webhook URL  → https://<your-domain>/api/lemonsqueezy/webhook
 *   Secret       → set LEMONSQUEEZY_WEBHOOK_SECRET in .env.local
 *   Events       → order_created, subscription_created, subscription_payment_success
 *
 * ⚠️  localStorage is a browser API and is NOT accessible from server-side
 *     API routes. Pro status is stored in data/pro-users.json (server-side).
 *     The client reads /api/pro-status to sync plan into localStorage on load.
 *
 * NOTE: In serverless/Vercel deployments the local filesystem is ephemeral.
 * Replace the JSON-file store with a database (Postgres, Redis, etc.) for
 * production use.
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

// ── Config ────────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''
const PRO_USERS_FILE = path.join(process.cwd(), 'data', 'pro-users.json')

/** Events that grant Pro access */
const PRO_EVENTS = new Set([
  'order_created',
  'subscription_created',
  'subscription_payment_success',
])

// ── File helpers ──────────────────────────────────────────────────────────────

type ProUserRecord = {
  email: string
  plan: 'pro'
  grantedAt: string
  event: string
}

async function readProUsers(): Promise<Record<string, ProUserRecord>> {
  try {
    const raw = await fs.readFile(PRO_USERS_FILE, 'utf-8')
    return JSON.parse(raw) as Record<string, ProUserRecord>
  } catch {
    return {}
  }
}

async function writeProUsers(users: Record<string, ProUserRecord>): Promise<void> {
  await fs.mkdir(path.dirname(PRO_USERS_FILE), { recursive: true })
  await fs.writeFile(PRO_USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

// ── Signature verification ────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    // Use timingSafeEqual to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
  } catch {
    return false
  }
}

// ── Payload extraction ────────────────────────────────────────────────────────

/**
 * Lemon Squeezy webhook payload shape (simplified):
 * {
 *   meta: { event_name: string, custom_data?: Record<string, string> }
 *   data: {
 *     type: 'orders' | 'subscriptions'
 *     attributes: { user_email: string, status: string }
 *   }
 * }
 */
function extractFields(payload: unknown): { eventName: string; email: string } {
  const p = payload as Record<string, unknown>
  const meta = (p?.meta ?? {}) as Record<string, unknown>
  const data = (p?.data ?? {}) as Record<string, unknown>
  const attrs = (data?.attributes ?? {}) as Record<string, unknown>

  const eventName = String(meta?.event_name ?? '')

  // user_email is the canonical field; fall back to email for some event types
  const rawEmail =
    String(attrs?.user_email ?? attrs?.email ?? '').toLowerCase().trim()

  return { eventName, email: rawEmail }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Read raw body text (required for signature verification before JSON.parse)
  const rawBody = await req.text()

  // ── Signature check ──────────────────────────────────────────────────────
  if (WEBHOOK_SECRET) {
    const signature = req.headers.get('x-signature') ?? ''
    if (!signature) {
      console.warn('[LemonSqueezy] Missing X-Signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }
    if (!verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.warn('[LemonSqueezy] Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else {
    console.warn('[LemonSqueezy] LEMONSQUEEZY_WEBHOOK_SECRET is not set — skipping signature check')
  }

  // ── Parse JSON ───────────────────────────────────────────────────────────
  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    console.error('[LemonSqueezy] Failed to parse webhook body')
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Extract fields ───────────────────────────────────────────────────────
  const { eventName, email } = extractFields(payload)

  console.log('[LemonSqueezy] Webhook received', eventName, email)

  // ── Ignore non-pro events ─────────────────────────────────────────────────
  if (!PRO_EVENTS.has(eventName)) {
    console.log('[LemonSqueezy] Ignoring event (not a pro-grant event):', eventName)
    return NextResponse.json({ received: true })
  }

  // ── Require email ─────────────────────────────────────────────────────────
  if (!email) {
    console.warn('[LemonSqueezy] No email found in payload for event:', eventName)
    // Still return 200 so Lemon Squeezy does not retry indefinitely
    return NextResponse.json({ received: true })
  }

  // ── Write to pro-users store ──────────────────────────────────────────────
  // NOTE: localStorage is not accessible from server-side code.
  // We write to data/pro-users.json instead. The client calls /api/pro-status
  // to sync this into localStorage under the "plan" field.
  const proUsers = await readProUsers()
  proUsers[email] = {
    email,
    plan: 'pro',
    grantedAt: new Date().toISOString(),
    event: eventName,
  }
  await writeProUsers(proUsers)

  console.log('[LemonSqueezy] Marked as pro:', email, '(event:', eventName + ')')

  return NextResponse.json({ received: true })
}
