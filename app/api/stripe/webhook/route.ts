/**
 * Stripe webhook handler
 *
 * Endpoint: POST /api/stripe/webhook
 *
 * Configure in Stripe dashboard:
 *   Webhook URL → https://<your-domain>/api/stripe/webhook
 *   Secret      → set STRIPE_WEBHOOK_SECRET in .env.local
 *   Events      → customer.subscription.created, customer.subscription.updated,
 *                 customer.subscription.deleted, invoice.payment_succeeded,
 *                 invoice.payment_failed
 *
 * Pro status is persisted in the Supabase `pro_users` table.
 * Columns: email (text, primary key), plan (text, default: 'free')
 *
 * TypeScript strict mode — no unknown-type errors.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

// ── Stripe client ─────────────────────────────────────────────────────────────

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-02-25.clover',
})

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? ''

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = 'pro' | 'free'

// ── Email extraction ──────────────────────────────────────────────────────────

async function getEmailFromEvent(event: Stripe.Event): Promise<string | null> {
  const obj = event.data.object

  // Subscription events — look up customer email via API
  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const sub = obj as Stripe.Subscription
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

    // 1. Try retrieving the customer with the invoice expanded for extra email fallback
    try {
      const customer = await stripe.customers.retrieve(customerId, {
        expand: ['latest_invoice'],
      })

      if (!customer.deleted) {
        const email = (customer as Stripe.Customer).email?.toLowerCase().trim() ?? null
        if (email) return email
      }
    } catch {
      // Customer API call failed — continue to fallbacks
    }

    // 2. Customer is deleted or email missing — check subscription metadata
    const metaEmail = (sub.metadata?.email as string | undefined)?.toLowerCase().trim()
    if (metaEmail) return metaEmail

    // 3. Last resort: check latest_invoice customer_email via API
    if (typeof sub.latest_invoice === 'string' && sub.latest_invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(sub.latest_invoice)
        const invoiceEmail = invoice.customer_email?.toLowerCase().trim()
        if (invoiceEmail) return invoiceEmail
      } catch {
        // Invoice retrieval failed — fall through to warning
      }
    }

    // 4. All fallbacks exhausted
    if (event.type === 'customer.subscription.deleted') {
      console.warn(
        `[Stripe] WARNING: Could not downgrade user - customer deleted before webhook fired. Customer ID: ${customerId}`
      )
    }

    return null
  }

  // Invoice events — email is on the invoice object directly
  if (
    event.type === 'invoice.payment_succeeded' ||
    event.type === 'invoice.payment_failed'
  ) {
    const invoice = obj as Stripe.Invoice
    return invoice.customer_email?.toLowerCase().trim() ?? null
  }

  return null
}

// ── Upsert helper ─────────────────────────────────────────────────────────────

async function upsertPlan(email: string, plan: Plan) {
  const { error } = await supabase
    .from('pro_users')
    .upsert({ email, plan }, { onConflict: 'email' })

  if (error) {
    console.error('[Stripe] Supabase upsert failed:', error.message)
    throw error
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  // ── Verify signature ──────────────────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.warn('[Stripe] Invalid webhook signature:', message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log('[Stripe] Webhook received:', event.type)

  // ── Determine plan ────────────────────────────────────────────────────────
  let plan: Plan | null = null

  switch (event.type) {
    case 'customer.subscription.created':
      plan = 'pro'
      break

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      plan = sub.status === 'active' ? 'pro' : null
      break
    }

    case 'invoice.payment_succeeded':
      plan = 'pro'
      break

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed':
      plan = 'free'
      break

    default:
      console.log('[Stripe] Ignoring unhandled event:', event.type)
      return NextResponse.json({ received: true })
  }

  if (plan === null) {
    console.log('[Stripe] No plan change for event:', event.type)
    return NextResponse.json({ received: true })
  }

  // ── Extract email ─────────────────────────────────────────────────────────
  const email = await getEmailFromEvent(event)

  if (!email) {
    console.warn('[Stripe] No email found for event:', event.type)
    return NextResponse.json({ received: true })
  }

  // ── Upsert into Supabase ──────────────────────────────────────────────────
  try {
    await upsertPlan(email, plan)
    console.log(`[Stripe] ${plan === 'pro' ? 'Upgraded' : 'Downgraded'} user: ${email} → ${plan}`)
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
