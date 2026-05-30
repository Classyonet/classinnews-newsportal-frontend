export const runtime = 'edge'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BrandingHead } from '@/components/BrandingHead'
import SiteChrome from '@/components/SiteChrome'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Classy News – Latest News, Breaking Stories, TV & Radio',
  description:
    'Classy News is a news app and website for reading the latest breaking news, politics, entertainment, sports, and watching live TV and radio — all in one place. Available on Android.',
  applicationName: 'Classy News',
  keywords: ['Classy News', 'news', 'breaking news', 'trending', 'entertainment', 'sports', 'TV', 'radio'],
  verification: {
    google: 'uXnhIeDrxf525zBlM6AI-0ZbeU610PtFY_3ek_BNwvs',
  },
  openGraph: {
    title: 'Classy News – Latest News, Breaking Stories, TV & Radio',
    description: 'Classy News is a news app and website for reading the latest stories and watching live TV and radio. Available on Android.',
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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
