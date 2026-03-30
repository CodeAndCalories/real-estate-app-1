import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost, BLOG_POSTS } from '@/lib/data/blog-posts'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} | PropertySignalHQ Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  }
}

/** Converts the plain markdown-like content into structured HTML sections */
function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={i}
          className="text-2xl sm:text-3xl font-black text-white mt-10 mb-4 leading-tight"
        >
          {line.slice(3)}
        </h2>
      )
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3">
          {line.slice(4)}
        </h3>
      )
    } else if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
      // Standalone bold line (used as a sub-label)
      elements.push(
        <p key={i} className="font-bold text-white mt-4 mb-1">
          {line.slice(2, -2)}
        </p>
      )
    } else if (line.trim() === '') {
      // Skip blank lines
    } else {
      // Regular paragraph — inline bold handling
      elements.push(
        <p
          key={i}
          className="text-gray-300 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>'),
          }}
        />
      )
    }

    i++
  }

  return elements
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) notFound()

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#020617]">

      {/* Top nav */}
      <div className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
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
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Blog
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Category + meta */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            {post.category}
          </span>
          <span className="text-xs text-gray-500">{formattedDate}</span>
          <span className="text-xs text-gray-500">·</span>
          <span className="text-xs text-gray-500">{post.readTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Lede */}
        <p className="text-lg text-gray-400 leading-relaxed mb-10 border-l-2 border-blue-600 pl-4">
          {post.description}
        </p>

        <hr className="border-white/10 mb-10" />

        {/* Body */}
        <div className="prose-like">
          {renderContent(post.content)}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-[#0f172a] border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">Try it free</p>
          <h2 className="text-2xl font-black text-white mb-3">
            Find deals like these in your market
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            PropertySignalHQ gives you 88,000+ scored property signals across 125+ cities. First month free.
          </p>
          <a
            href="/upgrade"
            className="inline-block font-bold text-base px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/25"
          >
            Start Free Trial →
          </a>
          <p className="text-xs text-gray-600 mt-3">30 days free · No charge until day 31 · Cancel anytime</p>
        </div>

        {/* Back to blog */}
        <div className="mt-10 text-center">
          <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to all posts
          </Link>
        </div>

      </div>
    </div>
  )
}
