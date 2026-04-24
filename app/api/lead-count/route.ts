import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { count, error } = await supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json({ count: 0 }, { status: 500 })
  }

  return NextResponse.json(
    { count: count ?? 0 },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } }
  )
}
