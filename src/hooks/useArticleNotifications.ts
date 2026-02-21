import { useEffect, useRef } from 'react';
import notificationService from '@/services/notificationService';

const POLL_INTERVAL = 5000;
const LAST_ARTICLE_KEY = 'last_article_notified_id';
const GATE_CACHE_MS = 60000;

export const useArticleNotifications = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastArticleIdRef = useRef<string | null>(null);
  const gateRef = useRef<{ allowed: boolean; checkedAt: number }>({ allowed: false, checkedAt: 0 });

  useEffect(() => {
    const isMobileDevice = (): boolean => {
      return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    };

    const isLocallyEligible = (): boolean => {
      const permissionState = notificationService.getPermissionState();
      if (!permissionState.granted) return false;
      if (!notificationService.hasUserAccepted()) {
        notificationService.setUserAccepted();
      }
      return true;
    };

    const canDeliverNotifications = async (): Promise<boolean> => {
      if (!isLocallyEligible()) {
        return false;
      }

      const now = Date.now();
      if (now - gateRef.current.checkedAt < GATE_CACHE_MS) {
        return gateRef.current.allowed;
      }

      try {
        const adminApi = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002';

        const settingsRes = await fetch(`${adminApi}/api/settings/public`);
        const settingsData = await settingsRes.json();
        const settings = settingsData?.settings || {};

        const pushEnabled = settings.push_notifications_enabled !== 'false';
        const articlePushEnabled = settings.push_new_article_notification !== 'false';
        const mobileEnabled = settings.push_mobile_enabled === 'true';
        const desktopEnabled = settings.push_desktop_enabled !== 'false';

        if (!pushEnabled || !articlePushEnabled) {
          gateRef.current = { allowed: false, checkedAt: now };
          return false;
        }

        if (isMobileDevice() && !mobileEnabled) {
          gateRef.current = { allowed: false, checkedAt: now };
          return false;
        }

        if (!isMobileDevice() && !desktopEnabled) {
          gateRef.current = { allowed: false, checkedAt: now };
          return false;
        }

        gateRef.current = { allowed: true, checkedAt: now };
        return true;
      } catch {
        gateRef.current = { allowed: false, checkedAt: now };
        return false;
      }
    };

    const checkForNewArticles = async () => {
      try {
        const allowed = await canDeliverNotifications();
        if (!allowed) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'}/articles/latest?limit=1`
        );

        if (!response.ok) return;

        const articles = await response.json();
        if (!Array.isArray(articles) || articles.length === 0) return;

        const latestArticle = articles[0];
        if (!latestArticle?.id) return;

        if (lastArticleIdRef.current && latestArticle.id !== lastArticleIdRef.current) {
          await notificationService.showNotification('New Article Published', {
            body: latestArticle.title,
            icon: latestArticle.featuredImageUrl || '/logo.svg',
            badge: '/badge.svg',
            tag: `article-${latestArticle.id}`,
            data: {
              url: `${window.location.origin}/articles/${latestArticle.slug}`
            },
            requireInteraction: false,
          });
        }

        lastArticleIdRef.current = latestArticle.id;
        localStorage.setItem(LAST_ARTICLE_KEY, latestArticle.id);
      } catch (error) {
        console.error('Notification polling failed:', error);
      }
    };

    lastArticleIdRef.current = localStorage.getItem(LAST_ARTICLE_KEY);

    const initialTimeout = setTimeout(() => {
      checkForNewArticles();
    }, 2000);

    intervalRef.current = setInterval(() => {
      checkForNewArticles();
    }, POLL_INTERVAL);

    const onSubscriptionUpdated = () => {
      gateRef.current = { allowed: false, checkedAt: 0 };
      checkForNewArticles();
    };
    window.addEventListener('notification-subscription-updated', onSubscriptionUpdated);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(initialTimeout);
      window.removeEventListener('notification-subscription-updated', onSubscriptionUpdated);
    };
  }, []);
};
