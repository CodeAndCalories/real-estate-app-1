import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import '../styles/globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import SupportWidget from '@/components/SupportWidget'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PropertySignalHQ — Find Real Estate Deals Before Other Investors',
  description: 'Discover distressed owners, price drops, and high-equity property opportunities before other investors and agents.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    other: [{ rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'PropertySignalHQ — Find Real Estate Deals Before Other Investors',
    description: 'Discover distressed owners, price drops, and high-equity property opportunities before other investors and agents.',
    url: 'https://propertysignalhq.com',
    siteName: 'PropertySignalHQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropertySignalHQ — Find Real Estate Deals Before Other Investors',
    description: 'Discover distressed owners, price drops, and high-equity property opportunities before other investors and agents.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={syne.variable}>
      <body className="bg-[#020617] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <SupportWidget />
      </body>
    </html>
  )
}
