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

  // Dynamic zip pages — only zips with 10+ properties to avoid thin content
  let zipPages: MetadataRoute.Sitemap = []
  try {
    const { data: zipData } = await supabaseAdmin
      .from('properties')
      .select('city, zip')
      .not('zip', 'is', null)
      .not('city', 'is', null)
      .limit(100000)

    if (zipData) {
      const zipCounts: Record<string, number> = {}
      for (const row of zipData as { city: string; zip: string }[]) {
        const key = `${row.city}|||${row.zip}`
        zipCounts[key] = (zipCounts[key] ?? 0) + 1
      }

      zipPages = Object.entries(zipCounts)
        .filter(([, cnt]) => cnt >= 10)
        .map(([key]) => {
          const [city, zip] = key.split('|||')
          return {
            url: `${BASE}/cities/${cityToSlug(city)}/${zip}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          }
        })
    }
  } catch {
    // If Supabase is unreachable at build time, skip zip pages
  }

  return [...staticPages, ...cityPages, ...zipPages]
}
