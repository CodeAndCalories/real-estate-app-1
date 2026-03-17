/**
 * GET /api/pro-status?email=user@example.com
 *
 * Lets the client check whether an email has been granted Pro access by a
 * Lemon Squeezy webhook. The client calls this after login to sync the
 * `plan: "pro"` field into its own localStorage (pshq-users / pshq-session).
 *
 * Response:
 *   { isPro: boolean, grantedAt?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const PRO_USERS_FILE = path.join(process.cwd(), 'data', 'pro-users.json')

type ProUserRecord = {
  email: string
  plan: 'pro'
  grantedAt: string
  event: string
}

async function readProUsers(): Promise<Record<string, ProUserRecord>> {
  try {
    const raw = await fs.readFile(PRO_USERS_FILE, 'utf-8')
    return JSON.parse(raw) as Record<string, ProUserRecord>
  } catch {
    return {}
  }
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim() ?? ''

  if (!email) {
    return NextResponse.json({ isPro: false })
  }

  const proUsers = await readProUsers()
  const record = proUsers[email]

  if (record) {
    return NextResponse.json({ isPro: true, grantedAt: record.grantedAt })
  }

  return NextResponse.json({ isPro: false })
}
