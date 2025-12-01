'use client';

import { useEffect, useState } from 'react';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002';

interface AdPlacement {
  id: string;
  placement_name: string;
  display_name: string;
  page_type: string;
  position: string;
  is_active: boolean;
  ad_code: string | null;
  width: string | null;
  height: string | null;
  ad_type?: string;
  image_url?: string | null;
  link_url?: string | null;
}

interface AdDisplayProps {
  position: string;
  pageType: 'homepage' | 'article';
  className?: string;
}

export default function AdDisplay({ position, pageType, className = '' }: AdDisplayProps) {
  const [ad, setAd] = useState<AdPlacement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAd();
  }, [position, pageType]);

  const fetchAd = async () => {
    try {
      console.log(`[AdDisplay] Fetching ads for ${pageType} - position: ${position}`);
      const response = await fetch(`${ADMIN_API_URL}/api/ads/active/${pageType}`);
      const ads: AdPlacement[] = await response.json();
      console.log(`[AdDisplay] Received ${ads.length} active ads for ${pageType}:`, ads);
      
      // Find the ad for this specific position
      const matchingAd = ads.find(a => a.position === position && a.is_active);
      console.log(`[AdDisplay] Matching ad for position ${position}:`, matchingAd);
      setAd(matchingAd || null);
    } catch (error) {
      console.error(`[AdDisplay] Error fetching ad for ${pageType}/${position}:`, error);
      setAd(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    console.log(`[AdDisplay] Loading ad for ${pageType}/${position}...`);
    return null; // Don't show loading state for ads
  }

  if (!ad || (!ad.ad_code && !ad.image_url)) {
    console.log(`[AdDisplay] No ad to display for ${pageType}/${position}`);
    return null; // Don't render anything if no ad is available
  }

  console.log(`[AdDisplay] Rendering ad for ${pageType}/${position}:`, ad.display_name);
  
  // Render image ad
  if (ad.ad_type === 'image' && ad.image_url) {
    return (
      <div className={`ad-container ${className}`}>
        <div className="ad-wrapper max-w-full overflow-hidden flex items-center justify-center">
          <div
            className="ad-content"
            style={{
              maxWidth: '100%',
              width: ad.width || 'auto',
              height: ad.height || 'auto',
            }}
          >
            {ad.link_url ? (
              <a href={ad.link_url} target="_blank" rel="noopener noreferrer sponsored">
                <img
                  src={ad.image_url}
                  alt="Advertisement"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </a>
            ) : (
              <img
                src={ad.image_url}
                alt="Advertisement"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Render code ad
  return (
    <div className={`ad-container ${className}`}>
      <div className="ad-wrapper max-w-full overflow-hidden flex items-center justify-center">
        <div
          className="ad-content"
          dangerouslySetInnerHTML={{ __html: ad.ad_code || '' }}
          style={{
            maxWidth: '100%',
            width: ad.width || 'auto',
            height: ad.height || 'auto',
          }}
        />
      </div>
    </div>
  );
}
