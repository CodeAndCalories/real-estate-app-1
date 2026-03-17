/**
 * GET /api/pro-status?email=user@example.com
 *
 * Lets the client check whether an email has been granted Pro access by a
 * Lemon Squeezy webhook. The client calls this after login to sync the
 * `plan: "pro"` field into its own localStorage (pshq-users / pshq-session).
 *
 * Response:
 *   { isPro: boolean }
 *
 * TypeScript strict mode — no unknown-type errors.
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim() ?? ''

  if (!email) {
    return NextResponse.json({ isPro: false })
  }

  const { data, error } = await supabase
    .from('pro_users')
    .select('plan')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('[pro-status] Supabase query failed:', error.message)
    return NextResponse.json({ isPro: false })
  }

  return NextResponse.json({ isPro: data?.plan === 'pro' })
}
