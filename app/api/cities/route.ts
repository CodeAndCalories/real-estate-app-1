import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  // Fetch all city values — override Supabase's default 1000-row limit
  const { data: allRows, error } = await supabaseAdmin
    .from('properties')
    .select('city')
    .limit(100000)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
