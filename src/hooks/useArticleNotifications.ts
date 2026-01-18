import { useEffect, useRef } from 'react';
import notificationService from '@/services/notificationService';

const POLL_INTERVAL = 5000; // Check every 5 seconds
const LAST_ARTICLE_KEY = 'last_article_notified_id';

export const useArticleNotifications = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastArticleIdRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('🔍 Checking notification setup...');
    
    // Only start listening if user has accepted notifications
    if (!notificationService.hasUserAccepted()) {
      console.log('⏭️ User has not accepted notifications yet');
      return;
    }

    console.log('✅ User has accepted notifications');

    // Check if permission is still granted
    const permissionState = notificationService.getPermissionState();
    if (!permissionState.granted) {
      console.log('❌ Notification permission not granted');
      return;
    }

    console.log('✅ Notification permission granted');

    // Load last notified article ID from localStorage
    const lastId = localStorage.getItem(LAST_ARTICLE_KEY);
    lastArticleIdRef.current = lastId;
    console.log('📝 Last notified article ID:', lastId || 'none');

    // Function to check for new published articles
    const checkForNewArticles = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'}/articles/latest?limit=1`
        );

        if (!response.ok) {
          console.error('Failed to fetch latest article');
          return;
        }

        const articles = await response.json();

        if (!articles || !Array.isArray(articles) || articles.length === 0) {
          return;
        }

        const latestArticle = articles[0];

        if (!latestArticle || !latestArticle.id) {
          return;
        }

        console.log('📰 Latest article:', latestArticle.title, 'ID:', latestArticle.id);

        // Check if this is a new article (different from last notified)
        if (lastArticleIdRef.current && latestArticle.id !== lastArticleIdRef.current) {
          console.log('🆕 New article detected!');
          
          // Show notification for new article
          await notificationService.showNotification(
            '📰 New Article Published!',
            {
              body: latestArticle.title,
              icon: latestArticle.featuredImageUrl || '/logo.svg',
              badge: '/badge.svg',
              tag: `article-${latestArticle.id}`,
              data: {
                url: `${window.location.origin}/articles/${latestArticle.slug}`
              },
              requireInteraction: false,
            }
          );

          console.log('🔔 Notification shown for:', latestArticle.title);
        } else if (!lastArticleIdRef.current) {
          console.log('📌 First time - storing current article ID');
        } else {
          console.log('✓ No new articles');
        }

        // Update last article ID
        lastArticleIdRef.current = latestArticle.id;
        localStorage.setItem(LAST_ARTICLE_KEY, latestArticle.id);

      } catch (error) {
        console.error('❌ Error checking for new articles:', error);
      }
    };

    console.log('⏰ Starting article check interval (every 5 seconds)');

    // Initial check after a short delay
    const initialTimeout = setTimeout(() => {
      console.log('🔄 Running initial article check...');
      checkForNewArticles();
    }, 2000);

    // Start polling
    intervalRef.current = setInterval(() => {
      console.log('🔄 Checking for new articles...');
      checkForNewArticles();
    }, POLL_INTERVAL);

    // Cleanup
    return () => {
      console.log('🛑 Stopping notification polling');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(initialTimeout);
    };
  }, []);
};
