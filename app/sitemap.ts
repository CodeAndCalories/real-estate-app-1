import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const BASE = 'https://propertysignalhq.com'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const STATE_SLUGS = [
  'alabama', 'alaska', 'arizona', 'arkansas', 'california',
  'colorado', 'connecticut', 'delaware', 'florida', 'georgia',
  'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
  'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
  'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri',
  'montana', 'nebraska', 'nevada', 'new-hampshire', 'new-jersey',
  'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio',
  'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina',
  'south-dakota', 'tennessee', 'texas', 'utah', 'vermont',
  'virginia', 'washington', 'west-virginia', 'wisconsin', 'wyoming',
]

const CITIES = [
  'phoenix', 'miami', 'dallas', 'atlanta', 'chicago',
  'cleveland', 'los-angeles', 'new-york', 'tampa', 'nashville',
  'denver', 'charlotte', 'seattle', 'houston', 'austin',
  'columbus', 'indianapolis', 'memphis', 'baltimore', 'pittsburgh',
]

const BLOG_POSTS = [
  'what-are-real-estate-investment-signals',
  'off-market-property-leads-real-estate-agents',
  'how-wholesalers-use-property-signals',
  'wholesale-real-estate-lead-generation-2025',
  'find-flip-deals-before-other-investors',
  'best-tools-house-flippers-2025',
  'best-distressed-property-markets-ohio-2026',
  'find-pre-foreclosure-properties-cleveland',
  'michigan-wholesale-real-estate-guide',
  'propstream-free-alternatives-2026',
  'tax-delinquent-property-list-by-county',
  'how-to-find-absentee-owner-properties',
  'cheapest-way-to-find-motivated-sellers-2026',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                       lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/finder`,           lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/cities`,           lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/analyze`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/pricing`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/vs-propstream`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/vs-dealmachine`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/vs-batchleads`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/blog`,             lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/market-report`,    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/login`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/signup`,           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/terms`,            lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
  ]

  const cityPages: MetadataRoute.Sitemap = CITIES.map((slug) => ({
    url: `${BASE}/cities/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Fetch distinct city+zip combos from Supabase via paginated batches
  let zipPages: MetadataRoute.Sitemap = []
  try {
    let allRows: { city: string; zip: string }[] = []
    let from = 0
    const batchSize = 1000
    let iterations = 0
    while (iterations < 50) {
      const { data, error } = await supabase
        .from('properties')
        .select('city, zip')
        .not('city', 'is', null)
        .not('zip', 'is', null)
        .range(from, from + batchSize - 1)
      if (error || !data || data.length === 0) break
      allRows = [...allRows, ...data]
      if (data.length < batchSize) break
      from += batchSize
      iterations++
    }

    // Filter out blank zips, then deduplicate by city+zip
    const seen = new Set<string>()
    zipPages = allRows
      .filter(({ zip }) => zip && zip.trim().length > 0)
      .filter(({ city, zip }) => {
        const key = `${city}-${zip}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map(({ city, zip }) => ({
        url: `${BASE}/cities/${city.toLowerCase().replace(/\s+/g, '-')}/${zip}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
  } catch (e) {
    console.error('Sitemap ZIP fetch failed:', e)
  }

  const stateIndexPage: MetadataRoute.Sitemap = [
    { url: `${BASE}/states`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const statePages: MetadataRoute.Sitemap = STATE_SLUGS.map((slug) => ({
    url: `${BASE}/states/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const leadPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/leads/pre-foreclosure`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/leads/tax-delinquent`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/leads/absentee-owner`,  lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const comparePages: MetadataRoute.Sitemap = [
    { url: `${BASE}/compare`,                                          lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/compare/propertysignalhq-vs-propstream`,           lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]

  return [...staticPages, ...cityPages, ...blogPages, ...zipPages, ...stateIndexPage, ...statePages, ...leadPages, ...comparePages]
}