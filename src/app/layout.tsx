import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import CategoryNav from '@/components/CategoryNav'
import Footer from '@/components/Footer'
import NotificationConsent from '@/components/NotificationConsent'
import NotificationManager from '@/components/NotificationManager'

const inter = Inter({ subsets: ['latin'] })

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://classinnews-admin-backend.onrender.com';

// Fetch branding settings from backend
async function getBrandingSettings() {
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/settings/branding`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (error) {
    console.error('Failed to fetch branding settings:', error);
  }
  return {
    siteName: 'ClassinNews',
    siteDescription: 'Your Source for Quality News',
    site_logo_url: '',
    site_favicon_url: ''
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getBrandingSettings();
  
  const metadata: Metadata = {
    title: `${branding.siteName} - ${branding.siteDescription}`,
    description: branding.siteDescription,
  };
  
  // Add favicon if available
  if (branding.site_favicon_url) {
    metadata.icons = {
      icon: branding.site_favicon_url,
      shortcut: branding.site_favicon_url,
      apple: branding.site_favicon_url,
    };
  }
  
  return metadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
