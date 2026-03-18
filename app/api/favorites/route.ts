/**
 * /api/favorites
 *
 * GET  — return all favorites for the authenticated user
 * POST — toggle a favorite (insert if new, delete if exists)
 *
 * ─────────────────────────────────────────────────────────────────
 * Run this SQL in Supabase Dashboard → SQL Editor before deploying:
 * ─────────────────────────────────────────────────────────────────
 *
 * CREATE TABLE favorites (
 *   id           uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email        text         NOT NULL,
 *   property_id  text         NOT NULL,
 *   address      text         NOT NULL,
 *   city         text         NOT NULL,
 *   score        integer,
 *   signal_type  text,
 *   created_at   timestamptz  DEFAULT now(),
 *   CONSTRAINT unique_user_property UNIQUE (email, property_id)
 * );
 *
 * CREATE INDEX idx_favorites_email
 *   ON favorites (email, created_at DESC);
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ── Auth helpers ───────────────────────────────────────────────────────────────

async function verifyUser(req: NextRequest): Promise<string | null> {
  const auth  = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user?.email) return null
  return user.email.toLowerCase().trim()
}

async function verifyPro(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('pro_users')
    .select('plan')
    .eq('email', email)
    .maybeSingle()
  return data?.plan === 'pro'
}

// ── GET ────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const email = await verifyUser(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[favorites] GET error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ favorites: data ?? [] })
}

// ── POST ───────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const email = await verifyUser(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const isPro = await verifyPro(email)
  if (!isPro) return NextResponse.json({ error: 'pro_required' }, { status: 403 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const b          = body as Record<string, unknown>
  const propertyId = typeof b.property_id === 'string' ? b.property_id          : ''
  const address    = typeof b.address     === 'string' ? b.address               : ''
  const city       = typeof b.city        === 'string' ? b.city                  : ''
  const score      = typeof b.score       === 'number' ? b.score                 : null
  const signalType = typeof b.signal_type === 'string' ? b.signal_type           : null

  if (!propertyId || !address || !city) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('email', email)
    .eq('property_id', propertyId)
    .maybeSingle()

  if (existing) {
    // Already exists → remove it
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('email', email)
      .eq('property_id', propertyId)

    if (deleteError) {
      console.error('[favorites] DELETE error:', deleteError.message)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }
    return NextResponse.json({ favorited: false })
  }

  // Does not exist → insert it
  const { error: insertError } = await supabase
    .from('favorites')
    .insert({ email, property_id: propertyId, address, city, score, signal_type: signalType })

  if (insertError) {
    // Race condition — unique constraint fired
    if (insertError.code === '23505') {
      return NextResponse.json({ favorited: true })
    }
    console.error('[favorites] INSERT error:', insertError.message)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ favorited: true })
}
