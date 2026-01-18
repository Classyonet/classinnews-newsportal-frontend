// Notification Service for News Portal

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Check if browser supports notifications
  public isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Get current permission state
  public getPermissionState(): NotificationPermissionState {
    if (!this.isSupported()) {
      return { granted: false, denied: false, default: true };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  // Check if user has already been asked for permission
  public hasUserBeenAsked(): boolean {
    return localStorage.getItem('notification_asked') === 'true';
  }

  // Mark that user has been asked
  public setUserAsked(): void {
    localStorage.setItem('notification_asked', 'true');
  }

  // Check if user has accepted notifications
  public hasUserAccepted(): boolean {
    return localStorage.getItem('notification_accepted') === 'true';
  }

  // Mark that user has accepted
  public setUserAccepted(): void {
    localStorage.setItem('notification_accepted', 'true');
  }

  // Check if user has denied notifications
  public hasUserDenied(): boolean {
    return localStorage.getItem('notification_denied') === 'true';
  }

  // Mark that user has denied
  public setUserDenied(): void {
    localStorage.setItem('notification_denied', 'true');
  }

  // Request notification permission
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications not supported');
    }

    try {
      const permission = await Notification.requestPermission();
      
      // Don't auto-set flags here - let the component handle it
      // This gives more control over when and how to mark acceptance/denial
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }

  // Show a test notification
  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permissionState = this.getPermissionState();
    
    if (!permissionState.granted) {
      throw new Error('Notification permission not granted');
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/logo.svg',
        badge: '/badge.svg',
        ...options
      });
    } else {
      // Fallback to basic notification
      const notification = new Notification(title, {
        icon: '/logo.svg',
        ...options
      });

      // Handle click event for basic notification
      notification.onclick = (event) => {
        event.preventDefault();
        if (options?.data && (options.data as any).url) {
          window.open((options.data as any).url, '_blank');
        }
        notification.close();
      };
    }
  }

  // Subscribe to push notifications (for future use with backend)
  public async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      // Subscribe to push
      // Note: You'll need VAPID keys for production
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as any
      });

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription, userId);

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  // Send subscription to backend
  private async sendSubscriptionToBackend(subscription: PushSubscription, userId: string): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004/api'}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to backend');
      }
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
    }
  }

  // Helper function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default NotificationService.getInstance();
