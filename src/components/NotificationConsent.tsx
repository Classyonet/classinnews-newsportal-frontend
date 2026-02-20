'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import notificationService from '@/services/notificationService';

type TrackingResult = {
  success: boolean;
  data?: {
    id?: string;
    status?: string;
  };
};

export default function NotificationConsent() {
  const [showPopup, setShowPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);

  useEffect(() => {
    const shouldShowPopup = async (): Promise<boolean> => {
      if (!notificationService.isSupported()) return false;

      try {
        const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002'}/api/settings/public`);
        const settings = await settingsRes.json();
        const pushEnabled = settings?.settings?.push_notifications_enabled !== 'false';
        const requireConsent = settings?.settings?.push_require_user_consent !== 'false';
        if (!pushEnabled || !requireConsent) return false;
      } catch {
        // Continue with default behavior when settings endpoint is unavailable.
      }

      const state = notificationService.getPermissionState();
      if (state.granted) return false;
      if (notificationService.hasUserAccepted()) return false;

      if (notificationService.hasUserDenied()) {
        const deniedTime = localStorage.getItem('notification_denied_time');
        if (!deniedTime) return false;

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002'}/api/settings/public`);
          const data = await response.json();
          const reappearDays = parseInt(data.settings?.push_popup_reappear_days || '7', 10);
          const daysSinceDenied = (Date.now() - parseInt(deniedTime, 10)) / (1000 * 60 * 60 * 24);

          if (daysSinceDenied < reappearDays) {
            return false;
          }

          localStorage.removeItem('notification_denied');
          localStorage.removeItem('notification_denied_time');
        } catch {
          const daysSinceDenied = (Date.now() - parseInt(deniedTime, 10)) / (1000 * 60 * 60 * 24);
          if (daysSinceDenied < 7) return false;
        }
      }

      return true;
    };

    shouldShowPopup().then((shouldShow) => {
      if (!shouldShow) return;
      const timer = setTimeout(() => setShowPopup(true), 3000);
      return () => clearTimeout(timer);
    });
  }, []);

  const trackSubscription = async (
    userId: string | null,
    pushSubscription: PushSubscription | null
  ): Promise<TrackingResult | null> => {
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002'}/api/notifications/track-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          deviceInfo: JSON.stringify(deviceInfo),
          subscriptionType: 'web_push',
          pushSubscription,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to track subscription:', response.status, errorText);
        return null;
      }

      return (await response.json()) as TrackingResult;
    } catch (error) {
      console.error('Error tracking subscription:', error);
      return null;
    }
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const permission = await notificationService.requestPermission();

      if (permission === 'granted') {
        notificationService.setUserAccepted();

        const userStr = localStorage.getItem('reader_user');
        let userId: string | null = null;
        let pushSubscription: PushSubscription | null = null;

        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id;
          pushSubscription = await notificationService.subscribeToPush(user.id);
        } else {
          pushSubscription = await notificationService.subscribeToPush('anonymous');
        }

        const trackingResult = await trackSubscription(userId, pushSubscription);
        const subscriptionId = trackingResult?.data?.id;
        const isPendingApproval = trackingResult?.data?.status === 'pending_approval';
        if (subscriptionId) {
          localStorage.setItem('notification_subscription_id', subscriptionId);
        }

        setAwaitingApproval(isPendingApproval);
        setShowPopup(false);
        setShowSuccess(true);

        setTimeout(async () => {
          try {
            await notificationService.showNotification('Welcome to ClassinNews!', {
              body: isPendingApproval
                ? 'Subscription received. Notifications start after admin approval.'
                : 'You will receive notifications for new articles.',
              icon: '/logo.png',
            });
          } catch {
            // Ignore welcome notification failures.
          }
        }, 500);

        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else if (permission === 'denied') {
        notificationService.setUserDenied();
        localStorage.setItem('notification_denied_time', Date.now().toString());
        setShowPopup(false);
      }
    } catch (error) {
      console.error('Error handling notification consent:', error);
      setShowPopup(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLater = () => {
    notificationService.setUserDenied();
    localStorage.setItem('notification_denied_time', Date.now().toString());
    setShowPopup(false);
  };

  if (!showPopup) {
    return (
      <>
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
                {awaitingApproval
                  ? 'Your request is pending admin approval. Notifications will start after approval.'
                  : 'You are all set. You will receive notifications for newly published articles.'}
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
      </>
    );
  }

  return (
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
