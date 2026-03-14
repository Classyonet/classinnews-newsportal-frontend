'use client'

import { useEffect, useState } from 'react'
import { ADMIN_API_URL } from '@/lib/api-config'

interface AdPlacement {
  id: string
  placement_name: string
  display_name: string
  page_type: string
  position: string
  is_active: boolean
  ad_code: string | null
  width: string | null
  height: string | null
  ad_type?: string
  image_url?: string | null
  link_url?: string | null
}

interface AdDisplayProps {
  position: string
  pageType: 'homepage' | 'article'
  className?: string
}

export default function AdDisplay({ position, pageType, className = '' }: AdDisplayProps) {
  const [ad, setAd] = useState<AdPlacement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAd() {
      try {
        const response = await fetch(`${ADMIN_API_URL}/api/ads/active/${pageType}`)
        const result = await response.json()
        const ads: AdPlacement[] = Array.isArray(result) ? result : (result.data || [])
        const matchingAd = ads.find((item) => item.position === position && item.is_active)
        setAd(matchingAd || null)
      } catch (error) {
        console.error(`Failed to fetch ad for ${pageType}/${position}:`, error)
        setAd(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [pageType, position])

  if (loading || !ad || (!ad.ad_code && !ad.image_url)) {
    return null
  }

  const isSidebarAd = position.includes('sidebar')

  if (ad.ad_type === 'image' && ad.image_url) {
    return (
      <div className={`ad-container w-full ${className}`}>
        <div className="ad-wrapper flex w-full max-w-full items-center justify-center overflow-hidden">
          <div
            className="ad-content max-w-full"
            style={{
              width: isSidebarAd ? '100%' : (ad.width || 'auto'),
              maxWidth: '100%',
              height: ad.height || 'auto',
            }}
          >
            {ad.link_url ? (
              <a href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored">
                <img
                  src={ad.image_url}
                  alt="Advertisement"
                  className="h-auto max-w-full"
                  style={{
                    width: '100%',
                    height: ad.height || 'auto',
                    objectFit: isSidebarAd ? 'contain' : 'cover',
                  }}
                />
              </a>
            ) : (
              <img
                src={ad.image_url}
                alt="Advertisement"
                className="h-auto max-w-full"
                style={{
                  width: '100%',
                  height: ad.height || 'auto',
                  objectFit: isSidebarAd ? 'contain' : 'cover',
                }}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`ad-container w-full ${className}`}>
      <div className="ad-wrapper flex w-full max-w-full items-center justify-center overflow-hidden">
        <div
          className="ad-content max-w-full"
          dangerouslySetInnerHTML={{ __html: ad.ad_code || '' }}
          style={{
            width: isSidebarAd ? '100%' : (ad.width || 'auto'),
            maxWidth: '100%',
            height: ad.height || 'auto',
          }}
        />
      </div>
    </div>
  )
}
