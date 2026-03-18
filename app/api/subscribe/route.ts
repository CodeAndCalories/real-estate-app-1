/**
 * POST /api/subscribe
 *
 * Saves an email address to the email_subscribers table.
 *
 * ─────────────────────────────────────────────────────────────────
 * Run this SQL in Supabase Dashboard → SQL Editor before deploying:
 * ─────────────────────────────────────────────────────────────────
 *
 * CREATE TABLE email_subscribers (
 *   id         uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email      text         NOT NULL UNIQUE,
 *   created_at timestamptz  DEFAULT now() NOT NULL
 * );
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let email: string
  try {
    const body = (await req.json()) as { email?: unknown }
    email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { error } = await supabase
    .from('email_subscribers')
    .insert({ email })

  if (error) {
    // Postgres unique-violation code
    if (error.code === '23505') {
      return NextResponse.json({ error: 'already_subscribed' }, { status: 409 })
    }
    console.error('[subscribe] insert error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
