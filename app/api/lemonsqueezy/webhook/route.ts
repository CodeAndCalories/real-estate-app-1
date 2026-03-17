/**
 * Lemon Squeezy webhook handler
 *
 * Endpoint: POST /api/lemonsqueezy/webhook
 *
 * Configure in Lemon Squeezy dashboard:
 *   Webhook URL  → https://<your-domain>/api/lemonsqueezy/webhook
 *   Secret       → set LEMONSQUEEZY_WEBHOOK_SECRET in .env.local
 *   Events       → subscription_created, subscription_payment_success,
 *                  subscription_cancelled, subscription_expired,
 *                  subscription_payment_failed
 *
 * Pro status is persisted in the Supabase `pro_users` table.
 * Columns: email (text, primary key), plan (text, default: 'free')
 *
 * TypeScript strict mode — no unknown-type errors.
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'

// ── Config ────────────────────────────────────────────────────────────────────

const WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''

/** Events that grant Pro access */
const PRO_EVENTS = new Set([
  'order_created',
  'subscription_created',
  'subscription_payment_success',
])

/** Events that revoke Pro access */
const DOWNGRADE_EVENTS = new Set([
  'subscription_cancelled',
  'subscription_expired',
  'subscription_payment_failed',
])

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = 'pro' | 'free'

// ── Signature verification ────────────────────────────────────────────────────

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))
  } catch {
    return false
  }
}

// ── Payload extraction ────────────────────────────────────────────────────────

/**
 * Lemon Squeezy webhook payload shape (simplified):
 * {
 *   meta: { event_name: string }
 *   data: {
 *     attributes: { user_email: string }
 *   }
 * }
 */
function extractFields(payload: unknown): { eventName: string; email: string } {
  const p     = payload as Record<string, unknown>
  const meta  = (p?.meta  ?? {}) as Record<string, unknown>
  const data  = (p?.data  ?? {}) as Record<string, unknown>
  const attrs = (data?.attributes ?? {}) as Record<string, unknown>

  const eventName = String(meta?.event_name ?? '')

  // user_email is the canonical field per Lemon Squeezy docs
  const rawEmail =
    String(attrs?.user_email ?? attrs?.email ?? '').toLowerCase().trim()

  return { eventName, email: rawEmail }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Read raw body text (must happen before JSON.parse for signature verification)
  const rawBody = await req.text()

  // ── Signature check ──────────────────────────────────────────────────────
  if (WEBHOOK_SECRET) {
    const signature = req.headers.get('x-signature') ?? ''
    if (!signature) {
      console.warn('[LemonSqueezy] Missing X-Signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }
    if (!verifySignature(rawBody, signature, WEBHOOK_SECRET)) {
      console.warn('[LemonSqueezy] Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
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

  // ── Determine action ─────────────────────────────────────────────────────
  const isUpgrade   = PRO_EVENTS.has(eventName)
  const isDowngrade = DOWNGRADE_EVENTS.has(eventName)

  if (!isUpgrade && !isDowngrade) {
    console.log('[LemonSqueezy] Ignoring unhandled event:', eventName)
    return NextResponse.json({ received: true })
  }

  // ── Require email ─────────────────────────────────────────────────────────
  if (!email) {
    console.warn('[LemonSqueezy] No email found in payload for event:', eventName)
    // Return 200 so Lemon Squeezy does not retry indefinitely
    return NextResponse.json({ received: true })
  }

  // ── Upsert into Supabase pro_users ────────────────────────────────────────
  const newPlan: Plan = isUpgrade ? 'pro' : 'free'

  const { error } = await supabase
    .from('pro_users')
    .upsert({ email, plan: newPlan }, { onConflict: 'email' })

  if (error) {
    console.error('[LemonSqueezy] Supabase upsert failed:', error.message)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  console.log(
    `[LemonSqueezy] ${isUpgrade ? 'Upgraded' : 'Downgraded'} user:`,
    email,
    `→ plan: ${newPlan}`,
    `(event: ${eventName})`,
  )

  return NextResponse.json({ received: true })
}
