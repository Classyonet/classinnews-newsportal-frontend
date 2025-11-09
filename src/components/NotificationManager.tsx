'use client';

import { useEffect } from 'react';
import { useArticleNotifications } from '@/hooks/useArticleNotifications';

export default function NotificationManager() {
  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Start polling for new articles
  useArticleNotifications();

  return null; // This component doesn't render anything
}
