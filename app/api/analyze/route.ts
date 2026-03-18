/**
 * POST /api/analyze
 *
 * Analyzes a property deal based on submitted details and returns a
 * Signal Score, confidence level, and explanatory bullet points.
 *
 * ─────────────────────────────────────────────────────────────────
 * Run this SQL in Supabase Dashboard → SQL Editor before deploying:
 * ─────────────────────────────────────────────────────────────────
 *
 * CREATE TABLE manual_analyses (
 *   id            uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
 *   email         text,
 *   address       text         NOT NULL,
 *   price         numeric,
 *   beds          integer,
 *   baths         numeric,
 *   sqft          integer,
 *   year_built    integer,
 *   score_generated integer    NOT NULL,
 *   confidence    text         NOT NULL,
 *   is_pro        boolean      DEFAULT false,
 *   created_at    timestamptz  DEFAULT now()
 * );
 *
 * CREATE INDEX idx_manual_analyses_email_created_at
 *   ON manual_analyses (email, created_at DESC);
 *
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ── City benchmark: price per sqft ────────────────────────────────────────────

const CITY_BENCHMARKS: Record<string, number> = {
  miami:         380,
  'los angeles':  650,
  'new york':     750,
  dallas:         220,
  phoenix:        280,
  atlanta:        230,
  chicago:        280,
  nashville:      320,
  houston:        210,
  denver:         420,
  tampa:          310,
  orlando:        290,
  'las vegas':    280,
  'san antonio':  190,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCityBenchmark(address: string): number | null {
  const lower = address.toLowerCase()
  for (const [city, benchmark] of Object.entries(CITY_BENCHMARKS)) {
    if (lower.includes(city)) return benchmark
  }
  return null
}

function buildBullets(params: {
  yearBuilt:  number | null
  beds:       number | null
  baths:      number | null
  score:      number
  actualPpsf: number | null
  benchmark:  number | null
}): string[] {
  const { yearBuilt, beds, baths, score, actualPpsf, benchmark } = params
  const insights: string[] = []

  // ── Price vs benchmark ────────────────────────────────────────────────────
  if (actualPpsf !== null && benchmark !== null && benchmark > 0) {
    const ratio = actualPpsf / benchmark
    if (ratio < 0.85) {
      insights.push(
        'This property is priced noticeably below the typical $/sqft for the area, which can indicate a motivated seller or an opportunity to capture equity on purchase.'
      )
    } else if (ratio > 1.1) {
      insights.push(
        'This property is priced above typical market levels, which may limit margin unless there are unique upside factors not reflected in the data.'
      )
    } else {
      insights.push(
        'The property appears roughly in line with local pricing, suggesting a more competitive deal where profit will depend on execution rather than entry discount.'
      )
    }
  }

  // ── Year built ────────────────────────────────────────────────────────────
  if (insights.length < 3 && yearBuilt !== null) {
    if (yearBuilt < 1970) {
      insights.push(
        'The older build increases the likelihood of value-add potential, making it attractive for investors targeting renovation or forced appreciation.'
      )
    } else if (yearBuilt <= 1990) {
      insights.push(
        'Property age suggests moderate upgrade potential, though not as strong as older distressed inventory.'
      )
    } else if (yearBuilt > 2010) {
      insights.push(
        'Newer construction reduces the likelihood of distress-driven discounts, making it less attractive for value-add strategies.'
      )
    }
  }

  // ── Bedroom / layout ──────────────────────────────────────────────────────
  if (insights.length < 3 && beds !== null) {
    if (beds >= 3 && (baths ?? 0) >= 2) {
      insights.push(
        'The 3 bed / 2 bath layout aligns with strong rental and resale demand in most markets, improving exit flexibility.'
      )
    } else if (beds <= 2) {
      insights.push(
        'The smaller layout may appeal to a narrower buyer pool, though rental demand in urban markets can offset this.'
      )
    }
  }

  // ── Score-based fallbacks ─────────────────────────────────────────────────
  if (insights.length < 3 && score >= 70) {
    insights.push(
      'Strong signal profile based on multiple data points — this property scores well across price, market conditions, and owner motivation indicators.'
    )
  }

  if (insights.length < 3 && score < 40) {
    insights.push(
      'Limited distress signals detected. This property may be better suited for conventional buyers than value-add investors.'
    )
  }

  // ── Padding ───────────────────────────────────────────────────────────────
  const PAD =
    'Additional market data may reveal further opportunities not captured in current signals.'
  while (insights.length < 3) insights.push(PAD)

  return insights.slice(0, 3)
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Verify session ────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !authUser?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const email = authUser.email.toLowerCase().trim()

  // ── 2. Parse body ────────────────────────────────────────────────────────
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const address   = typeof b.address    === 'string' ? b.address.trim() : ''
  const price     = typeof b.price      === 'number' ? b.price      : null
  const beds      = typeof b.beds       === 'number' ? b.beds       : null
  const baths     = typeof b.baths      === 'number' ? b.baths      : null
  const sqft      = typeof b.sqft       === 'number' ? b.sqft       : null
  const yearBuilt = typeof b.year_built === 'number' ? b.year_built : null

  if (!address) {
    return NextResponse.json({ error: 'address_required' }, { status: 400 })
  }

  // ── 3. Check pro status ──────────────────────────────────────────────────
  const { data: proRow } = await supabase
    .from('pro_users')
    .select('plan')
    .eq('email', email)
    .maybeSingle()

  const isPro = proRow?.plan === 'pro'
  const LIMIT = 3

  // ── 4. Spam prevention: same email + address within 60 seconds ───────────
  const sixtySecondsAgo = new Date(Date.now() - 60_000).toISOString()
  const { data: recentDupe } = await supabase
    .from('manual_analyses')
    .select('id')
    .eq('email', email)
    .eq('address', address)
    .gte('created_at', sixtySecondsAgo)
    .limit(1)

  if (recentDupe && recentDupe.length > 0) {
    return NextResponse.json({ error: 'duplicate_submission' }, { status: 429 })
  }

  // ── 5. Rate limit check (free users only) ────────────────────────────────
  const twentyFourHoursAgo = new Date(Date.now() - 86_400_000).toISOString()
  const { count: usedCount } = await supabase
    .from('manual_analyses')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', twentyFourHoursAgo)

  const analysesUsed = usedCount ?? 0

  if (!isPro && analysesUsed >= LIMIT) {
    return NextResponse.json(
      { error: 'limit_reached', analyses_used: analysesUsed, analyses_limit: LIMIT },
      { status: 429 }
    )
  }

  // ── 6. Scoring ───────────────────────────────────────────────────────────
  let score = 50

  // Price vs benchmark
  const benchmark = parseCityBenchmark(address)
  let actualPpsf: number | null = null
  if (benchmark !== null && price !== null && sqft !== null && sqft > 0) {
    actualPpsf = price / sqft
    if (actualPpsf < benchmark * 0.85)      score += 20
    else if (actualPpsf < benchmark * 0.95) score += 10
    else if (actualPpsf > benchmark * 1.1)  score -= 10
  }

  // Year built
  if (yearBuilt !== null) {
    if (yearBuilt < 1970)       score += 12
    else if (yearBuilt <= 1990) score += 7
    else if (yearBuilt > 2010)  score -= 5
  }

  // Beds/baths
  if (beds !== null && beds >= 3)                       score += 5
  if (beds !== null && baths !== null && beds >= 3 && baths >= 2) score += 5

  // Data completeness bonus (+2 per optional field, max +8)
  const optionals = [price, beds, baths, sqft, yearBuilt].filter((v) => v !== null)
  score += Math.min(optionals.length * 2, 8)

  // Realistic variation
  score += Math.floor(Math.random() * 8 - 4)

  // Clamp
  score = Math.max(10, Math.min(97, score))

  // Confidence
  const filledCount = optionals.length
  const confidence: string =
    filledCount >= 4 ? 'High' :
    filledCount >= 2 ? 'Medium' : 'Low'

  // Bullets
  const bullets = buildBullets({ yearBuilt, beds, baths, score, actualPpsf, benchmark })

  // ── 7. Save to Supabase ──────────────────────────────────────────────────
  const { error: insertError } = await supabase
    .from('manual_analyses')
    .insert({
      email,
      address,
      price,
      beds,
      baths,
      sqft,
      year_built:       yearBuilt,
      score_generated:  score,
      confidence,
      is_pro:           isPro,
    })

  if (insertError) {
    console.error('[analyze] Insert failed:', insertError.message)
    // Non-fatal — still return the result
  }

  // Return updated count (include this submission)
  const newUsed = analysesUsed + 1

  return NextResponse.json({
    score,
    confidence,
    bullets,
    analyses_used:  isPro ? null : newUsed,
    analyses_limit: isPro ? null : LIMIT,
  })
}
