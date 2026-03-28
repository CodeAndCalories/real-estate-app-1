import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin.rpc('get_city_counts')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const cities = (data as { city: string; count: number }[]).filter((r) => r.city)
  const total = cities.reduce((sum, c) => sum + c.count, 0)

  return NextResponse.json(
    { total, cities },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
  )
}
