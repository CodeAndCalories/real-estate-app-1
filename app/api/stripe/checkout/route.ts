/**
 * POST /api/stripe/checkout
 *
 * Creates a Stripe Checkout Session with a 30-day free trial.
 * Body: { email: string }
 * Returns: { url: string }
 *
 * Requires env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_PRICE_ID       — recurring price ID from your Stripe Dashboard (price_xxx)
 *   NEXT_PUBLIC_SITE_URL  — e.g. https://www.propertysignalhq.com
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2026-02-25.clover',
})

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email } = (body as Record<string, unknown>)

  if (typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 })
  }

  const priceId = process.env.STRIPE_PRICE_ID
  if (!priceId) {
    console.error('[checkout] STRIPE_PRICE_ID env var is not set')
    return NextResponse.json({ error: 'Checkout not configured' }, { status: 500 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.propertysignalhq.com'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email.toLowerCase().trim(),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          source: 'propertysignalhq',
        },
      },
      success_url: `${siteUrl}/finder?checkout=success`,
      cancel_url:  `${siteUrl}/pricing`,
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[checkout] Stripe error:', message)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
