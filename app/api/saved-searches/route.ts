import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function verifyUser(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return null

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user?.email) return null
  return user.email.toLowerCase().trim()
}

// ── GET — return all saved searches for logged-in user ─────────────────────

export async function GET(req: NextRequest) {
  const email = await verifyUser(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('saved_searches')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[saved-searches] GET error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ searches: data ?? [] })
}

// ── POST — save a new search for logged-in user ────────────────────────────

export async function POST(req: NextRequest) {
  const email = await verifyUser(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const city      = typeof b.city      === 'string' ? b.city.trim()      : null
  const lead_type = typeof b.lead_type === 'string' ? b.lead_type.trim() : null
  const min_score = typeof b.min_score === 'number' ? b.min_score        : 0
  const label     = typeof b.label     === 'string' ? b.label.trim()     : null

  const { data, error } = await supabaseAdmin
    .from('saved_searches')
    .insert({ user_email: email, city, lead_type, min_score, label })
    .select()
    .single()

  if (error) {
    console.error('[saved-searches] POST error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ search: data }, { status: 201 })
}

// ── DELETE — remove a saved search by id ──────────────────────────────────

export async function DELETE(req: NextRequest) {
  const email = await verifyUser(req)
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 })

  const { error } = await supabaseAdmin
    .from('saved_searches')
    .delete()
    .eq('id', id)
    .eq('user_email', email) // ensure ownership

  if (error) {
    console.error('[saved-searches] DELETE error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
