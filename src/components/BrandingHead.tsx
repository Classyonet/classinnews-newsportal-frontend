'use client'

import { useEffect } from 'react'

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://classinnews-admin-backend.onrender.com'

export function BrandingHead() {
  useEffect(() => {
    async function fetchBranding() {
      try {
        const res = await fetch(`${ADMIN_API_URL}/api/settings/branding`)
        if (res.ok) {
          const data = await res.json()
          const branding = data.data
          
          if (branding?.site_favicon_url) {
            const faviconUrl = branding.site_favicon_url.startsWith('http')
              ? branding.site_favicon_url
              : `${ADMIN_API_URL}${branding.site_favicon_url}`
            
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
            if (!link) {
              link = document.createElement('link')
              link.rel = 'icon'
              document.head.appendChild(link)
            }
            link.href = faviconUrl
          }
          
          if (branding?.siteName) {
            document.title = `${branding.siteName} - ${branding.siteDescription || 'Your Source for Quality News'}`
          }
        }
      } catch (error) {
        // Silently fail - default metadata will be used
      }
    }
    fetchBranding()
  }, [])

  return null
}
