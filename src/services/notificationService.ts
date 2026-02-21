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

    const registration = await this.getServiceWorkerRegistration();
    if (registration) {
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

  // Subscribe to push notifications (service-worker subscription only).
  // Backend tracking is handled by NotificationConsent.
  public async subscribeToPush(_userId: string): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      return null;
    }

    try {
      const registration = await this.getServiceWorkerRegistration();
      if (!registration) {
        console.warn('Service worker is not ready. Skipping push subscription for now.');
        return null;
      }
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      if (!vapidPublicKey) {
        console.warn('VAPID public key is not configured. Skipping pushManager subscription.');
        return null;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as any
      });

      return subscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  private async getServiceWorkerRegistration(timeoutMs = 8000): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const existing = await navigator.serviceWorker.getRegistration();
      if (existing) return existing;
    } catch {
      // Continue with registration attempt.
    }

    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch {
      // Ignore registration failure; fallback may still work.
    }

    try {
      const readyOrNull = await Promise.race<ServiceWorkerRegistration | null>([
        navigator.serviceWorker.ready,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
      ]);
      if (readyOrNull) return readyOrNull;
    } catch {
      // Continue to final attempt below.
    }

    try {
      const lateExisting = await navigator.serviceWorker.getRegistration();
      return lateExisting || null;
    } catch {
      return null;
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
