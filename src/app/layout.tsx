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

export const metadata: Metadata = {
  title: 'ClassinNews - Your Source for Quality News',
  description: 'Your Source for Quality News',
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
