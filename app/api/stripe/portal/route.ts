/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Customer Portal session for the authenticated user.
 * Body: { email: string }
 * Returns: { url: string }
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

  try {
    // Find the Stripe customer by email
    const customers = await stripe.customers.list({
      email: email.toLowerCase().trim(),
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'No Stripe customer found for this email.' },
        { status: 404 }
      )
    }

    const customerId = customers.data[0].id

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: 'https://www.propertysignalhq.com/finder',
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[portal] Stripe error:', message)
    return NextResponse.json({ error: 'Failed to create portal session.' }, { status: 500 })
  }
}
