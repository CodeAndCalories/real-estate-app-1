/**
 * POST /api/analyze/save
 *
 * Saves an analyzed deal to the saved_analyses table for pro users.
 *
 * ─────────────────────────────────────────────────────────────────
 * Run this SQL in Supabase Dashboard → SQL Editor before deploying:
 * ─────────────────────────────────────────────────────────────────
 *
 * CREATE TABLE saved_analyses (
 *   id          uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email       text         NOT NULL,
 *   address     text         NOT NULL,
 *   price       numeric,
 *   beds        integer,
 *   baths       numeric,
 *   sqft        integer,
 *   year_built  integer,
 *   score       integer      NOT NULL,
 *   confidence  text         NOT NULL,
 *   bullets     text[]       NOT NULL,
 *   notes       text,
 *   saved_at    timestamptz  DEFAULT now(),
 *   CONSTRAINT unique_user_address UNIQUE (email, address)
 * );
 *
 * CREATE INDEX idx_saved_analyses_email
 *   ON saved_analyses (email, saved_at DESC);
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  // ── 1. Verify JWT session ────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !authUser?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const email = authUser.email.toLowerCase().trim()

  // ── 2. Verify pro status ─────────────────────────────────────────────────
  const { data: proRow } = await supabase
    .from('pro_users')
    .select('plan')
    .eq('email', email)
    .maybeSingle()

  if (proRow?.plan !== 'pro') {
    return NextResponse.json({ error: 'pro_required' }, { status: 403 })
  }

  // ── 3. Parse body ────────────────────────────────────────────────────────
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  const rawAddress = typeof b.address === 'string' ? b.address : ''
  const address    = rawAddress.toLowerCase().trim()

  if (!address) {
    return NextResponse.json({ error: 'address_required' }, { status: 400 })
  }

  const price      = typeof b.price      === 'number' ? b.price      : null
  const beds       = typeof b.beds       === 'number' ? b.beds       : null
  const baths      = typeof b.baths      === 'number' ? b.baths      : null
  const sqft       = typeof b.sqft       === 'number' ? b.sqft       : null
  const yearBuilt  = typeof b.year_built === 'number' ? b.year_built : null
  const score      = typeof b.score      === 'number' ? b.score      : null
  const confidence = typeof b.confidence === 'string' ? b.confidence : null
  const bullets    = Array.isArray(b.bullets)
    ? (b.bullets as unknown[]).filter((x): x is string => typeof x === 'string')
    : []

  if (score === null || !confidence || bullets.length === 0) {
    return NextResponse.json({ error: 'missing_required_fields' }, { status: 400 })
  }

  // ── 4. Insert with ON CONFLICT DO NOTHING ────────────────────────────────
  const { data: inserted, error: insertError } = await supabase
    .from('saved_analyses')
    .insert({
      email,
      address,
      price,
      beds,
      baths,
      sqft,
      year_built: yearBuilt,
      score,
      confidence,
      bullets,
    })
    .select('id')

  if (insertError) {
    // Unique constraint violation means already saved
    if (insertError.code === '23505') {
      return NextResponse.json({ already_saved: true }, { status: 200 })
    }
    console.error('[analyze/save] Insert error:', insertError.message)
    return NextResponse.json({ error: 'database_error' }, { status: 500 })
  }

  // 0 rows inserted = conflict was silently ignored (already saved)
  if (!inserted || inserted.length === 0) {
    return NextResponse.json({ already_saved: true }, { status: 200 })
  }

  return NextResponse.json({ saved: true }, { status: 200 })
}
