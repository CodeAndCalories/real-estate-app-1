import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('zillow_market_data')
    .select('*')
    .order('metro_name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { markets: data ?? [] },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
