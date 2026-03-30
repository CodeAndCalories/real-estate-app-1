import Link from 'next/link'
import { BLOG_POSTS } from '@/lib/data/blog-posts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | PropertySignalHQ — Real Estate Investor Resources',
  description: 'Practical guides for house flippers, wholesalers, and real estate agents. Learn how to find off-market deals, generate motivated seller leads, and use property signals.',
}

const CATEGORY_COLORS: Record<string, string> = {
  'House Flipping':       'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Wholesaling':          'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Real Estate Agents':   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'Investor Education':   'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

const POSTS_PER_PAGE = 12

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  const totalPages = Math.ceil(sorted.length / POSTS_PER_PAGE)
  const safePage = Math.min(currentPage, totalPages)
  const pagePosts = sorted.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE)

  return (
    <div className="min-h-screen bg-[#020617]">

      {/* Top nav */}
      <div className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <svg
              width="28" height="28" viewBox="0 0 40 40" fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="group-hover:opacity-80 transition-opacity"
            >
              <path d="M12 32V8H22C26.4183 8 30 11.5817 30 16C30 20.4183 26.4183 24 22 24H18.5L12 32Z" fill="white"/>
              <path d="M10 26L18 18" stroke="#020617" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
              PropertySignal<span className="text-blue-400">HQ</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            Resources
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Real Estate Investor Blog
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            Practical guides for flippers, wholesalers, and agents. No fluff — just what actually works.
          </p>
        </div>

        {/* Posts grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagePosts.map((post) => {
            const colorClass = CATEGORY_COLORS[post.category] ?? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
            const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-[#0a0f1e] border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-[#0f172a] transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${colorClass}`}>
                    {post.category}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white leading-snug mb-3 group-hover:text-blue-300 transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">
                  {post.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{formattedDate}</span>
                    <span className="text-xs text-gray-700">·</span>
                    <span className="text-xs text-gray-600">{post.readTime}</span>
                  </div>
                  <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                    Read →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {/* Previous */}
            {safePage > 1 ? (
              <Link
                href={safePage === 2 ? '/blog' : `/blog?page=${safePage - 1}`}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 bg-[#0f172a] text-gray-300 hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg text-sm font-medium border border-white/5 bg-white/5 text-gray-600 cursor-not-allowed">
                ← Previous
              </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={p === 1 ? '/blog' : `/blog?page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === safePage
                      ? 'bg-blue-600 text-white border border-blue-500/50 shadow-lg shadow-blue-600/25'
                      : 'border border-white/10 bg-[#0f172a] text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>

            {/* Next */}
            {safePage < totalPages ? (
              <Link
                href={`/blog?page=${safePage + 1}`}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 bg-[#0f172a] text-gray-300 hover:bg-white/10 hover:border-white/20 transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="px-4 py-2 rounded-lg text-sm font-medium border border-white/5 bg-white/5 text-gray-600 cursor-not-allowed">
                Next →
              </span>
            )}
          </div>
        )}

        {/* Page indicator (only when paginated) */}
        {totalPages > 1 && (
          <p className="text-center text-xs text-gray-600 mt-3">
            Page {safePage} of {totalPages} · {sorted.length} articles
          </p>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-[#0f172a] border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Ready to find deals?</p>
          <h2 className="text-2xl font-black text-white mb-3">
            Search 88,000+ Property Signals Now
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Filter by city, signal type, and opportunity score. First month free.
          </p>
          <a
            href="/finder"
            className="inline-block font-bold text-base px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/25"
          >
            Start Finding Deals →
          </a>
          <p className="text-xs text-gray-600 mt-3">Free to explore · No account required</p>
        </div>

      </div>
    </div>
  )
}
