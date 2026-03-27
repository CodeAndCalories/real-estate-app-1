import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data, error } = await supabaseAdmin.rpc('get_city_counts')

  // Fallback: if the RPC doesn't exist, query manually
  if (error) {
    const { data: allRows, error: fallbackError } = await supabaseAdmin
      .from('properties')
      .select('city')

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    }

    const counts: Record<string, number> = {}
    for (const row of allRows ?? []) {
      const city = row.city
      if (city) counts[city] = (counts[city] ?? 0) + 1
    }

    const cities = Object.entries(counts)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)

    const total = cities.reduce((sum, c) => sum + c.count, 0)

    return NextResponse.json(
      { total, cities },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    )
  }

  const cities = (data as { city: string; count: number }[])
    .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
  const total = cities.reduce((sum: number, c: { count: number }) => sum + c.count, 0)

  return NextResponse.json(
    { total, cities },
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  )
}
