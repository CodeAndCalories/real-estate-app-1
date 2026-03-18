import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#020617] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white font-black text-[10px]">
              P
            </span>
            <span className="text-sm font-semibold text-gray-400">
              PropertySignal<span className="text-blue-500">HQ</span>
            </span>
            <span className="text-xs text-gray-600">© 2026</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <Link href="/about"   className="hover:text-gray-300 transition-colors">About</Link>
            <Link href="/terms"   className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
            <a
              href="mailto:support@propertysignalhq.com"
              className="hover:text-gray-300 transition-colors"
            >
              support@propertysignalhq.com
            </a>
          </nav>

        </div>
      </div>
    </footer>
  )
}
