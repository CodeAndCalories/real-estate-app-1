/**
 * POST /api/deal-alerts
 *
 * Saves a deal alert preference for a logged-in user.
 *
 * ─────────────────────────────────────────────────────────────────
 * Run this SQL in Supabase Dashboard → SQL Editor before deploying:
 * ─────────────────────────────────────────────────────────────────
 *
 * CREATE TABLE deal_alert_preferences (
 *   id               uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email            text         NOT NULL,
 *   city_preference  text,
 *   score_threshold  integer      DEFAULT 70,
 *   created_at       timestamptz  DEFAULT now(),
 *   CONSTRAINT unique_alert_email UNIQUE (email)
 * );
 *
 * ALTER TABLE deal_alert_preferences DISABLE ROW LEVEL SECURITY;
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  let email: string
  let city_preference: string

  try {
    const body = (await req.json()) as { email?: unknown; city_preference?: unknown }
    email           = typeof body.email           === 'string' ? body.email.trim().toLowerCase() : ''
    city_preference = typeof body.city_preference === 'string' ? body.city_preference.trim()     : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const { error } = await supabase
    .from('deal_alert_preferences')
    .insert({ email, city_preference, score_threshold: 70 })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'already_subscribed' }, { status: 409 })
    }
    console.error('[deal-alerts] insert error:', error)
    return NextResponse.json({ error: 'Failed to save alert' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
