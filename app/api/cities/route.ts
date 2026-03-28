import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  // Use raw SQL to get accurate counts via GROUP BY — avoids Supabase row limits
  const { data, error } = await supabaseAdmin
    .rpc('get_city_counts')
    .select('*')

  // Fallback: raw query if RPC doesn't exist
  if (error) {
    const { data: rawData, error: rawError } = await supabaseAdmin
      .from('properties')
      .select('city.count()', { count: 'exact', head: false } as never)

    // Second fallback: paginated fetch
    if (rawError) {
      const all: { city: string }[] = []
      let from = 0
      const batchSize = 5000

      while (true) {
        const { data: batch, error: batchErr } = await supabaseAdmin
          .from('properties')
          .select('city')
          .range(from, from + batchSize - 1)

        if (batchErr) {
          return NextResponse.json({ error: batchErr.message }, { status: 500 })
        }

        if (!batch || batch.length === 0) break
        all.push(...batch)
        if (batch.length < batchSize) break
        from += batchSize
      }

      const counts: Record<string, number> = {}
      for (const row of all) {
        if (row.city) counts[row.city] = (counts[row.city] ?? 0) + 1
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

    // If the aggregate query worked
    const results = rawData as unknown as { city: string; count: number }[]
    const cities = results
      .filter((r) => r.city)
      .sort((a, b) => b.count - a.count)
    const total = cities.reduce((sum, c) => sum + c.count, 0)

    return NextResponse.json(
      { total, cities },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    )
  }

  const cities = (data as { city: string; count: number }[])
    .sort((a, b) => b.count - a.count)
  const total = cities.reduce((sum, c) => sum + c.count, 0)

  return NextResponse.json(
    { total, cities },
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  )
}
