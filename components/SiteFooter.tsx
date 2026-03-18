type Props = {
  isDark: boolean
}

const PRODUCT_LINKS = [
  { label: 'Find Leads', href: '/finder' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '/contact' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Cookie Policy', href: '/privacy#cookies' },
]

export default function SiteFooter({ isDark }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-[#020617]">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <span className="font-display text-white font-black text-xl">PropertySignalHQ</span>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed max-w-xs">
              Property intelligence for real estate professionals.
            </p>
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

          {/* Legal */}
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
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
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            © PropertySignalHQ. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/terms" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Terms</a>
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
