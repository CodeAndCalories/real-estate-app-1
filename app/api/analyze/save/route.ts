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
 * PATCH /api/analyze/save  — update tag and/or notes on a saved deal
 * ─────────────────────────────────────────────────────────────────
 *
 * Run this in Supabase SQL Editor before deploying:
 *   ALTER TABLE saved_analyses
 *   ADD COLUMN IF NOT EXISTS tag text
 *   CHECK (tag IN ('hot', 'follow-up', 'cold', null));
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ── Shared JWT verifier ───────────────────────────────────────────────────────

async function verifySession(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return null
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user?.email) return null
  return user.email.toLowerCase().trim()
}

// ── PATCH — update tag and/or notes ──────────────────────────────────────────

const VALID_TAGS = ['hot', 'follow-up', 'cold'] as const
type TagValue = typeof VALID_TAGS[number]

export async function PATCH(req: NextRequest) {
  const email = await verifySession(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const b  = body as Record<string, unknown>
  const id = typeof b.id === 'string' ? b.id.trim() : null
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 })

  const patch: Record<string, unknown> = {}

  if ('tag' in b) {
    const t = b.tag
    if (t === null) {
      patch.tag = null
    } else if (typeof t === 'string' && (VALID_TAGS as readonly string[]).includes(t)) {
      patch.tag = t as TagValue
    } else {
      return NextResponse.json({ error: 'invalid_tag' }, { status: 400 })
    }
  }

  if ('notes' in b) {
    patch.notes = typeof b.notes === 'string' ? b.notes : null
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'no_fields' }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from('saved_analyses')
    .update(patch)
    .eq('id', id)
    .eq('email', email)   // scoped to owner

  if (updateError) {
    console.error('[analyze/save PATCH]', updateError.message)
    return NextResponse.json({ error: 'database_error' }, { status: 500 })
  }

  return NextResponse.json({ updated: true })
}

// ── POST — save a new deal ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Verify JWT session ────────────────────────────────────────────────
  const email = await verifySession(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

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
