export const runtime = 'edge'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import CategoryNav from '@/components/CategoryNav'
import Footer from '@/components/Footer'
import NotificationConsent from '@/components/NotificationConsent'
import NotificationManager from '@/components/NotificationManager'
import { BrandingHead } from '@/components/BrandingHead'

const inter = Inter({ subsets: ['latin'] })

// IMPORTANT: Replace the google-site-verification content value below with the
// actual token provided by Google Search Console when verifying classinnews.com.
export const metadata: Metadata = {
  title: 'Classy News – Latest News, Breaking Stories, TV & Radio',
  description:
    'Classy News is a mobile app and news website that lets you read the latest breaking news, trending stories, politics, entertainment, sports, lifestyle, and watch live TV and radio — all in one place. Download the Classy News app on Android.',
  applicationName: 'Classy News',
  keywords: ['news', 'breaking news', 'Classy News', 'trending', 'entertainment', 'sports', 'TV', 'radio'],
  verification: {
    google: 'uXnhIeDrxf525zBlM6AI-0ZbeU610PtFY_3ek_BNwvs',
  },
  openGraph: {
    title: 'Classy News – Latest News, Breaking Stories, TV & Radio',
    description:
      'Classy News is a mobile app and news website for reading the latest stories and watching live TV and radio. Available on Android.',
    url: 'https://classinnews.com',
    siteName: 'Classy News',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrandingHead />
        <div className="min-h-screen flex flex-col bg-gray-50">
          <div className="sticky top-0 z-50">
            <Header />
            <CategoryNav />
          </div>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <NotificationConsent />
          <NotificationManager />
        </div>
      </body>
    </html>
  )
}
