import { MetadataRoute } from 'next'

const BASE = 'https://propertysignalhq.com'

export default function sitemap(): MetadataRoute.Sitemap {
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

  const cityPages: MetadataRoute.Sitemap = [
    'phoenix', 'miami', 'dallas', 'atlanta', 'chicago',
    'cleveland', 'los-angeles', 'new-york', 'tampa', 'nashville',
    'denver', 'charlotte', 'seattle', 'houston', 'austin',
    'columbus', 'indianapolis', 'memphis', 'baltimore', 'pittsburgh',
  ].map((slug) => ({
    url: `${BASE}/cities/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const blogPosts: MetadataRoute.Sitemap = [
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
  ].map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...cityPages, ...blogPosts]
}
