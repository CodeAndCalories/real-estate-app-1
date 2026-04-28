import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import SupportWidget from '@/components/SupportWidget'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PropertySignalHQ — Distressed Property Leads Scored 0-100 | $39/mo',
  description: 'Find pre-foreclosure, tax delinquent & absentee owner leads across 1,000,000+ properties. Every lead scored 0-100. CSV export. 30-day free trial. No credit card.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    other: [{ rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    title: 'PropertySignalHQ — Distressed Property Leads Scored 0-100 | $39/mo',
    description: 'Find pre-foreclosure, tax delinquent & absentee owner leads across 1,000,000+ properties. Every lead scored 0-100. CSV export. 30-day free trial. No credit card.',
    url: 'https://propertysignalhq.com',
    siteName: 'PropertySignalHQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PropertySignalHQ — Distressed Property Leads Scored 0-100 | $39/mo',
    description: 'Find pre-foreclosure, tax delinquent & absentee owner leads across 1,000,000+ properties. Every lead scored 0-100. CSV export. 30-day free trial. No credit card.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
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
