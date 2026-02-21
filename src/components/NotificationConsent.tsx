'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import notificationService from '@/services/notificationService';

type TrackingResult = {
  success: boolean;
  data?: {
    id?: string;
  };
};

type PopupMode = 'none' | 'consent' | 'blocked';

type BrowserHelp = {
  browser: string;
  settingsUrl: string | null;
  steps: string[];
};

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002';
const BLOCKED_HELP_KEY = 'notification_blocked_help_dismissed_time';
const BLOCKED_HELP_REAPPEAR_DAYS = 1;
const TRACK_TIMEOUT_MS = 8000;
const SUBSCRIPTION_UPDATED_EVENT = 'notification-subscription-updated';
const LAST_SYNC_KEY = 'notification_last_sync_time';
const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

function getBrowserHelp(): BrowserHelp {
  const ua = navigator.userAgent;
  const isEdge = ua.includes('Edg/');
  const isChrome = ua.includes('Chrome') && !isEdge;
  const isFirefox = ua.includes('Firefox');
  const isSafari = ua.includes('Safari') && !ua.includes('Chrome');

  if (isEdge) {
    return {
      browser: 'Edge',
      settingsUrl: 'edge://settings/content/notifications',
      steps: [
        'Click the tune/lock icon next to the URL.',
        'Open Site permissions or Site settings.',
        'Set Notifications to Allow.',
        'Reload this page and click "I Enabled Notifications".',
      ],
    };
  }

  if (isChrome) {
    return {
      browser: 'Chrome',
      settingsUrl: 'chrome://settings/content/notifications',
      steps: [
        'Click the tune/lock icon next to the URL.',
        'Open Site settings.',
        'Set Notifications to Allow.',
        'Reload this page and click "I Enabled Notifications".',
      ],
    };
  }

  if (isFirefox) {
    return {
      browser: 'Firefox',
      settingsUrl: 'about:preferences#privacy',
      steps: [
        'Open site permissions from the lock icon next to the URL.',
        'Allow notifications for this site.',
        'Reload this page and click "I Enabled Notifications".',
      ],
    };
  }

  if (isSafari) {
    return {
      browser: 'Safari',
      settingsUrl: null,
      steps: [
        'Open Safari settings for this website.',
        'Allow notifications for this site.',
        'Reload this page and click "I Enabled Notifications".',
      ],
    };
  }

  return {
    browser: 'Browser',
    settingsUrl: null,
    steps: [
      'Open this site permission settings in your browser.',
      'Set Notifications to Allow for this site.',
      'Reload this page and click "I Enabled Notifications".',
    ],
  };
}

export default function NotificationConsent() {
  const [popupMode, setPopupMode] = useState<PopupMode>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState('');
  const browserHelp = getBrowserHelp();

  const trackSubscription = async (
    userId: string | null,
    pushSubscription: PushSubscription | null
  ): Promise<TrackingResult | null> => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), TRACK_TIMEOUT_MS);

      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch(`${ADMIN_API_URL}/api/notifications/track-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          userId,
          deviceInfo: JSON.stringify(deviceInfo),
          subscriptionType: 'web_push',
          pushSubscription,
        }),
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to track subscription:', response.status, errorText);
        return null;
      }

      return (await response.json()) as TrackingResult;
    } catch (error) {
      console.error('Error tracking subscription:', error);
      return null;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  };

  const markDenied = () => {
    notificationService.setUserDenied();
    localStorage.setItem('notification_denied_time', Date.now().toString());
  };

  const completeSubscription = async () => {
    notificationService.setUserAccepted();
    localStorage.removeItem('notification_denied');
    localStorage.removeItem('notification_denied_time');
    window.dispatchEvent(new Event(SUBSCRIPTION_UPDATED_EVENT));

    const userStr = localStorage.getItem('reader_user');
    let userId: string | null = null;
    let pushSubscription: PushSubscription | null = null;

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userId = user?.id || null;
      } catch {
        userId = null;
      }
    }
    pushSubscription = await notificationService.subscribeToPush(userId || 'anonymous');

    const trackingResult = await trackSubscription(userId, pushSubscription);
    const subscriptionId = trackingResult?.data?.id;
    if (subscriptionId) {
      localStorage.setItem('notification_subscription_id', subscriptionId);
    }
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    window.dispatchEvent(new Event(SUBSCRIPTION_UPDATED_EVENT));
  };

  useEffect(() => {
    const shouldShowBlockedHelp = (): boolean => {
      const dismissedAt = localStorage.getItem(BLOCKED_HELP_KEY);
      if (!dismissedAt) return true;

      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      return daysSinceDismissed >= BLOCKED_HELP_REAPPEAR_DAYS;
    };

    const shouldShowConsentPopup = async (): Promise<boolean> => {
      try {
        const response = await fetch(`${ADMIN_API_URL}/api/settings/public`);
        const settings = await response.json();
        const pushEnabled = settings?.settings?.push_notifications_enabled !== 'false';
        const requireConsent = settings?.settings?.push_require_user_consent !== 'false';
        if (!pushEnabled || !requireConsent) return false;
      } catch {
        // Keep default behavior if settings call fails.
      }

      if (notificationService.hasUserAccepted()) return false;

      if (notificationService.hasUserDenied()) {
        const deniedTime = localStorage.getItem('notification_denied_time');
        if (!deniedTime) return false;

        try {
          const response = await fetch(`${ADMIN_API_URL}/api/settings/public`);
          const data = await response.json();
          const reappearDays = parseInt(data.settings?.push_popup_reappear_days || '7', 10);
          const daysSinceDenied = (Date.now() - parseInt(deniedTime, 10)) / (1000 * 60 * 60 * 24);
          if (daysSinceDenied < reappearDays) return false;

          localStorage.removeItem('notification_denied');
          localStorage.removeItem('notification_denied_time');
        } catch {
          const daysSinceDenied = (Date.now() - parseInt(deniedTime, 10)) / (1000 * 60 * 60 * 24);
          if (daysSinceDenied < 7) return false;
        }
      }

      return true;
    };

    const initializePopup = async () => {
      if (!notificationService.isSupported()) return;

      const state = notificationService.getPermissionState();
      const lastSyncTime = parseInt(localStorage.getItem(LAST_SYNC_KEY) || '0', 10);
      const shouldSyncNow = Number.isNaN(lastSyncTime) || (Date.now() - lastSyncTime > SYNC_INTERVAL_MS);

      if (state.granted) {
        notificationService.setUserAccepted();
        if (shouldSyncNow) {
          void completeSubscription().catch((error) => {
            console.error('Auto-sync for granted permission failed:', error);
          });
        }
        return;
      }

      if (state.denied) {
        markDenied();
        if (shouldShowBlockedHelp()) {
          setTimeout(() => setPopupMode('blocked'), 1500);
        }
        return;
      }

      const showConsent = await shouldShowConsentPopup();
      if (showConsent) {
        setTimeout(() => setPopupMode('consent'), 3000);
      }
    };

    initializePopup();
  }, []);

  const showSuccessState = () => {
    setPopupMode('none');
    setShowSuccess(true);

    setTimeout(async () => {
      try {
        await notificationService.showNotification('Welcome to ClassinNews!', {
          body: 'You will receive notifications for new articles.',
          icon: '/logo.png',
        });
      } catch {
        // Ignore local welcome notification failures.
      }
    }, 400);

    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    setBlockedNotice('');
    try {
      const permission = await notificationService.requestPermission();
      if (permission === 'granted') {
        showSuccessState();
        void completeSubscription().catch((error) => {
          console.error('Background subscription setup failed:', error);
        });
      } else {
        markDenied();
        setPopupMode('blocked');
      }
    } catch (error) {
      console.error('Error handling notification consent:', error);
      markDenied();
      setPopupMode('blocked');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryAfterEnable = async () => {
    setIsProcessing(true);
    setBlockedNotice('');
    try {
      const state = notificationService.getPermissionState();
      if (!state.granted) {
        setBlockedNotice('Notifications are still blocked. Enable them in browser site settings first.');
        return;
      }

      showSuccessState();
      void completeSubscription().catch((error) => {
        console.error('Background subscription setup failed:', error);
      });
    } catch (error) {
      console.error('Error finalizing enabled notifications:', error);
      setBlockedNotice('Could not finish subscription setup. Please reload and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const dismissBlockedHelp = () => {
    localStorage.setItem(BLOCKED_HELP_KEY, Date.now().toString());
    setPopupMode('none');
    setBlockedNotice('');
  };

  const openBrowserSettings = () => {
    if (!browserHelp.settingsUrl) return;
    window.open(browserHelp.settingsUrl, '_blank');
  };

  const handleLater = () => {
    markDenied();
    setPopupMode('none');
  };

  if (popupMode === 'none' && !showSuccess) return null;

  return (
    <>
      {popupMode === 'consent' && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fadeIn" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-scaleIn relative">
              <button
                onClick={handleLater}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Stay Updated with ClassinNews</h2>
              <p className="text-center text-gray-600 mb-6">
                Get notified instantly when new articles are published. Never miss breaking news.
              </p>

              <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700">Real-time alerts for breaking news</p>
                <p className="text-sm text-gray-700">Published articles from verified creators</p>
                <p className="text-sm text-gray-700">Unsubscribe anytime</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Allow Notifications'}
                </button>
                <button
                  onClick={handleLater}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {popupMode === 'blocked' && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fadeIn" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-scaleIn relative">
              <button
                onClick={dismissBlockedHelp}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isProcessing}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Bell className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Notifications Are Blocked</h2>
              <p className="text-center text-gray-600 mb-4">
                Your {browserHelp.browser} browser is currently blocking notification permission for this site.
              </p>

              <div className="space-y-2 mb-5 bg-gray-50 rounded-xl p-4">
                {browserHelp.steps.map((step) => (
                  <p key={step} className="text-sm text-gray-700">{step}</p>
                ))}
              </div>

              {blockedNotice && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
                  {blockedNotice}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRetryAfterEnable}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Checking...' : 'I Enabled Notifications'}
                </button>
                {browserHelp.settingsUrl && (
                  <button
                    onClick={openBrowserSettings}
                    disabled={isProcessing}
                    className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Open Browser Notification Settings
                  </button>
                )}
                <button
                  onClick={dismissBlockedHelp}
                  disabled={isProcessing}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Remind Me Later
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Successfully Subscribed!</h2>
            <p className="text-gray-600 mb-6">
              You are all set. You will receive notifications for newly published articles.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
