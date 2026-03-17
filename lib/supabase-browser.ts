/**
 * Browser-safe Supabase client for use in Client Components.
 *
 * Uses NEXT_PUBLIC_ env vars so the client is accessible in the browser.
 * Add these to .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *
 * The server-side client in lib/supabase.ts remains unchanged for API routes.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? ''
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabaseBrowser = createClient(supabaseUrl, supabaseKey)
