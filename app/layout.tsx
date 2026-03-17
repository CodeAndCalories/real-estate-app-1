import type { Metadata } from 'next'
import '../styles/globals.css'
import Navbar from '@/components/Navbar'
import CookieBanner from '@/components/CookieBanner'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Navbar />
        <main>{children}</main>
        <CookieBanner />
      </body>
    </html>
  )
}
