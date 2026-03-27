import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .gte('opportunity_score', 80)
    .order('opportunity_score', { ascending: false, nullsFirst: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const deals = (data ?? []).map(({ created_at: _, ...rest }) => rest)
  const date = new Date().toISOString().split('T')[0]

  return NextResponse.json(
    { date, deals },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    }
  )
}
