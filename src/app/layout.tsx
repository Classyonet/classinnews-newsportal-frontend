export const runtime = 'edge'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BrandingHead } from '@/components/BrandingHead'
import SiteChrome from '@/components/SiteChrome'
import { ADMIN_API_URL } from '@/lib/api-config'
import { AdsenseScript } from '@/components/AdsenseScript'
import Script from 'next/script'

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

async function fetchGoogleToolsSettings() {
  const results = { adsenseSnippet: '', gaMeasurementId: '', gtmContainerId: '' };
  try {
    const [adsRes, googleRes] = await Promise.all([
      fetch(`${ADMIN_API_URL}/api/settings/public/ads_verification`, { next: { revalidate: 60 } }),
      fetch(`${ADMIN_API_URL}/api/settings/public/google_tools`, { next: { revalidate: 60 } }),
    ]);
    if (adsRes.ok) {
      const { data } = await adsRes.json();
      const s = data?.find((s: any) => s.key === 'web_adsense_snippet');
      if (s?.value) results.adsenseSnippet = s.value;
    }
    if (googleRes.ok) {
      const { data } = await googleRes.json();
      const ga = data?.find((s: any) => s.key === 'ga_measurement_id');
      const gtm = data?.find((s: any) => s.key === 'gtm_container_id');
      if (ga?.value) results.gaMeasurementId = ga.value;
      if (gtm?.value) results.gtmContainerId = gtm.value;
    }
  } catch (e) {
    console.error('Failed to load Google tool settings:', e);
  }
  return results;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { adsenseSnippet, gaMeasurementId, gtmContainerId } = await fetchGoogleToolsSettings();

  return (
    <html lang="en">
      <head>
        <AdsenseScript snippet={adsenseSnippet} />
        {gaMeasurementId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaMeasurementId}');`}
            </Script>
          </>
        )}
        {gtmContainerId && (
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmContainerId}');`}
          </Script>
        )}
      </head>
      <body className={inter.className}>
        {gtmContainerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <BrandingHead />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
