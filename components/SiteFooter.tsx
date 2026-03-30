import Link from 'next/link'

type Props = {
  isDark: boolean
}

const PRODUCT_LINKS = [
  { label: 'Find Leads',    href: '/finder' },
  { label: 'Blog',          href: '/blog' },
  { label: 'Pricing',       href: '/#pricing' },
  { label: 'Markets',       href: '/cities' },
  { label: 'Analyze Deal',  href: '/analyze' },
  { label: 'Free Report',   href: '/market-report' },
  { label: 'FAQ',           href: '/#faq' },
  { label: 'Contact',       href: '/contact' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy',   href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy',    href: '/privacy#cookies' },
]

export default function SiteFooter({ isDark: _isDark }: Props) {
  return (
    <footer className="border-t border-white/10 bg-[#020617]">
      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Top grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 group mb-3">
              <svg
                width="28" height="28" viewBox="0 0 40 40" fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="group-hover:opacity-80 transition-opacity"
              >
                <path d="M12 32V8H22C26.4183 8 30 11.5817 30 16C30 20.4183 26.4183 24 22 24H18.5L12 32Z" fill="white"/>
                <path d="M10 26L18 18" stroke="#020617" strokeWidth="3" strokeLinecap="round"/>
              </svg>
              <span className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                PropertySignal<span className="text-blue-400">HQ</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-4">
              Property intelligence for real estate investors. 75,000+ signals across 100+ cities.
            </p>
            <a
              href="mailto:support@propertysignalhq.com"
              className="text-sm text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              support@propertysignalhq.com
            </a>
          </div>

          {/* Product */}
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Product</p>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Trust */}
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5 mb-6">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            {/* Trust signals */}
            <div className="space-y-2">
              {[
                '75,000+ property signals',
                'Real Zillow market data',
                'Weekly data updates',
              ].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <span className="text-blue-400 text-xs font-bold">✓</span>
                  <span className="text-xs text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} PropertySignalHQ. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/terms"   className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Terms</a>
            <a href="/privacy" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Privacy</a>
          </div>
        </div>
        <p className="text-gray-700 text-xs text-center mt-3">
          Property data provided for informational purposes only.
        </p>

      </div>
    </footer>
  )
}
