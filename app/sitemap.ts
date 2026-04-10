import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BASE = 'https://propertysignalhq.com'

function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, '-')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/finder`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/cities`,  lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/analyze`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/pricing`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/vs-propstream`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/vs-dealmachine`,  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/vs-batchleads`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/login`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/signup`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/terms`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // Dynamic city pages
  let cityPages: MetadataRoute.Sitemap = []
  try {
    const { data } = await supabaseAdmin.rpc('get_city_counts')
    const cities = ((data as { city: string; count: number }[]) ?? []).filter((r) => r.city)
    cityPages = cities.map((c) => ({
      url: `${BASE}/cities/${cityToSlug(c.city)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }))
  } catch {
    // If Supabase is unreachable at build time, skip city pages
  }

  // Dynamic zip pages — query per city to stay within Supabase row limits.
  // A single cross-table query with limit(100000) exceeds PostgREST's max_rows
  // cap and throws silently. Instead reuse the city list from get_city_counts
  // and fetch zips city-by-city (same pattern that generateStaticParams uses).
  let zipPages: MetadataRoute.Sitemap = []
  try {
    const { data: citiesData } = await supabaseAdmin.rpc('get_city_counts')
    const cities = ((citiesData as { city: string; count: number }[]) ?? []).filter((r) => r.city)

    for (const { city } of cities) {
      const { data: zipData } = await supabaseAdmin
        .from('properties')
        .select('zip')
        .ilike('city', city)
        .not('zip', 'is', null)
        .limit(5000)

      if (!zipData?.length) continue

      const zipCounts: Record<string, number> = {}
      for (const row of zipData as { zip: string }[]) {
        if (row.zip) zipCounts[row.zip] = (zipCounts[row.zip] ?? 0) + 1
      }

      for (const [zip, cnt] of Object.entries(zipCounts)) {
        if (cnt >= 10) {
          zipPages.push({
            url: `${BASE}/cities/${cityToSlug(city)}/${zip}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          })
        }
      }
    }
  } catch {
    // If Supabase is unreachable at build time, skip zip pages
  }

  return [...staticPages, ...cityPages, ...zipPages]
}
