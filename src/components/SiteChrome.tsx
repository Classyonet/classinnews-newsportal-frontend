'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import CategoryNav from '@/components/CategoryNav'
import Footer from '@/components/Footer'
import NotificationConsent from '@/components/NotificationConsent'
import NotificationManager from '@/components/NotificationManager'

const AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
]

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  return (
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
  )
}
