'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import notificationService from '@/services/notificationService';

export default function NotificationConsent() {
  const [showPopup, setShowPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check if we should show the popup
    const shouldShow = async () => {
      // Don't show if browser doesn't support notifications
      if (!notificationService.isSupported()) {
        return false;
      }

      // Check if permission is already granted
      const state = notificationService.getPermissionState();
      if (state.granted) {
        // User has accepted, never show again
        return false;
      }

      // Check if user has accepted before
      if (notificationService.hasUserAccepted()) {
        return false;
      }

      // Check if user has denied and when
      if (notificationService.hasUserDenied()) {
        const deniedTime = localStorage.getItem('notification_denied_time');
        if (deniedTime) {
          // Fetch reappear setting from backend
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002'}/api/settings/public`);
            const data = await response.json();
            const reappearDays = parseInt(data.settings?.push_popup_reappear_days || '7');
            
            const daysSinceDenied = (Date.now() - parseInt(deniedTime)) / (1000 * 60 * 60 * 24);
            
            if (daysSinceDenied < reappearDays) {
              console.log(`⏰ Popup will reappear in ${Math.ceil(reappearDays - daysSinceDenied)} days`);
              return false;
            } else {
              // Time has passed, clear the denied flag
              console.log('✅ Reappear time reached, showing popup again');
              localStorage.removeItem('notification_denied');
              localStorage.removeItem('notification_denied_time');
            }
          } catch (error) {
            console.error('Error fetching reappear setting:', error);
            // Default to 7 days if fetch fails
            const daysSinceDenied = (Date.now() - parseInt(deniedTime)) / (1000 * 60 * 60 * 24);
            if (daysSinceDenied < 7) {
              return false;
            }
          }
        }
      }

      return true;
    };

    // Show popup after 3 seconds delay
    shouldShow().then(show => {
      if (show) {
        const timer = setTimeout(() => {
          setShowPopup(true);
        }, 3000);

        return () => clearTimeout(timer);
      }
    });
  }, []);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const permission = await notificationService.requestPermission();
      
      if (permission === 'granted') {
        // Mark as permanently accepted
        notificationService.setUserAccepted();
        
        // Subscribe to push (if user is logged in)
        const userStr = localStorage.getItem('reader_user');
        let userId = null;
        
        if (userStr) {
          const user = JSON.parse(userStr);
          userId = user.id;
          await notificationService.subscribeToPush(user.id);
        }

        // Track subscription in database
        await trackSubscription(userId);
        
        console.log('✅ Notification accepted - will never show popup again');
        
        // Hide consent popup
        setShowPopup(false);
        
        // Show success message
        setShowSuccess(true);
        
        // Show welcome notification after a short delay
        setTimeout(async () => {
          await notificationService.showNotification('Welcome to ClassinNews!', {
            body: 'You\'ll now receive notifications about new articles',
            icon: '/logo.png',
          });
        }, 500);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
        
      } else if (permission === 'denied') {
        // User explicitly denied
        notificationService.setUserDenied();
        localStorage.setItem('notification_denied_time', Date.now().toString());
        console.log('❌ Notification denied - popup will reappear based on admin settings');
        setShowPopup(false);
      }

    } catch (error) {
      console.error('Error handling notification consent:', error);
      setShowPopup(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const trackSubscription = async (userId: string | null) => {
    try {
      console.log('📝 Tracking subscription in database...');
      
      // Get device and browser info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      console.log('Device info:', deviceInfo);

      const url = `${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002'}/api/notifications/track-subscription`;
      console.log('Calling API:', url);

      // Send to admin backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          deviceInfo: JSON.stringify(deviceInfo),
          subscriptionType: 'web_push'
        })
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to track subscription:', response.status, errorText);
      } else {
        const result = await response.json();
        console.log('✅ Subscription tracked successfully:', result);
      }
    } catch (error) {
      console.error('❌ Error tracking subscription:', error);
    }
  };

  const handleLater = () => {
    // User clicked "Maybe Later" or close button - treat as soft rejection
    notificationService.setUserDenied();
    localStorage.setItem('notification_denied_time', Date.now().toString());
    setShowPopup(false);
    console.log('⏭️ User chose "Maybe Later" - popup will reappear based on admin settings');
  };

  if (!showPopup) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fadeIn" />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-scaleIn">
          {/* Close button */}
          <button
            onClick={handleLater}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Bell className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Stay Updated with ClassinNews
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Get notified instantly when new articles are published. Never miss out on breaking news and trending stories!
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-6 bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Real-time alerts for breaking news</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">Personalized content recommendations</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-700">You can unsubscribe anytime</p>
            </div>
          </div>

          {/* Action Buttons */}
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

          {/* Privacy note */}
          <p className="text-xs text-center text-gray-500 mt-4">
            We respect your privacy. You can change your notification preferences anytime in settings.
          </p>
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

      {/* Success Message */}
      {showSuccess && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 animate-fadeIn" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scaleIn text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Successfully Subscribed! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                You&apos;re all set! You&apos;ll now receive instant notifications when new articles are published.
              </p>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3 text-left">
                  <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">What&apos;s Next?</p>
                    <p className="text-xs text-gray-600">
                      Whenever an admin approves a new article, you&apos;ll get a desktop notification instantly. Click it to read the article!
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-6 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg"
              >
                Got it!
              </button>

              {/* Auto-close indicator */}
              <p className="text-xs text-gray-400 mt-3">This message will auto-close in 5 seconds</p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
