// Push notification system for mobile app

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
}

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationManager {
  private vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';
  private apiBaseUrl = process.env.REACT_APP_API_URL || '/api/v1';
  private subscription: PushSubscription | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize push notifications
   */
  private async init(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.subscription = await registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('Existing push subscription found');
        await this.updateSubscriptionOnServer();
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        await this.subscribeToPush();
      }
      
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscription = existingSubscription;
        return existingSubscription;
      }

      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      });

      this.subscription = subscription;
      await this.sendSubscriptionToServer(subscription);
      
      console.log('Push subscription created successfully');
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const success = await this.subscription.unsubscribe();
      
      if (success) {
        await this.removeSubscriptionFromServer();
        this.subscription = null;
        console.log('Push subscription removed successfully');
      }
      
      return success;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Check if push notifications are supported and enabled
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * Check if user is subscribed to push notifications
   */
  isSubscribed(): boolean {
    return !!this.subscription && Notification.permission === 'granted';
  }

  /**
   * Get current subscription
   */
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }

  /**
   * Show local notification
   */
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      image: payload.image,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      tag: payload.tag,
      timestamp: payload.timestamp || Date.now(),
    };

    const notification = new Notification(payload.title, options);

    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      notification.close();
      
      if (payload.data?.url) {
        window.open(payload.data.url, '_blank');
      }
    };

    return Promise.resolve();
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<void> {
    if (!this.isSubscribed()) {
      throw new Error('Not subscribed to push notifications');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/notifications/test-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      console.log('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Configure notification preferences
   */
  async updateNotificationPreferences(preferences: {
    paymentReminders: boolean;
    maintenanceUpdates: boolean;
    announcements: boolean;
    emergencyAlerts: boolean;
  }): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }

      console.log('Notification preferences updated successfully');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };

    try {
      const response = await fetch(`${this.apiBaseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  /**
   * Update subscription on server
   */
  private async updateSubscriptionOnServer(): Promise<void> {
    if (!this.subscription) return;

    try {
      await this.sendSubscriptionToServer(this.subscription);
    } catch (error) {
      console.error('Error updating subscription on server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/notifications/unsubscribe`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error);
      throw error;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Get auth token from storage
   */
  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

// Notification templates for different types
export const NotificationTemplates = {
  paymentReminder: (amount: number, dueDate: string): NotificationPayload => ({
    title: 'Payment Reminder',
    body: `Your rent payment of $${amount} is due on ${dueDate}`,
    icon: '/icons/payment-icon.png',
    data: { type: 'payment_reminder', url: '/payments' },
    actions: [
      { action: 'pay', title: 'Pay Now' },
      { action: 'view', title: 'View Details' },
    ],
    requireInteraction: true,
  }),

  maintenanceUpdate: (requestId: string, status: string): NotificationPayload => ({
    title: 'Maintenance Update',
    body: `Your maintenance request #${requestId} is now ${status}`,
    icon: '/icons/maintenance-icon.png',
    data: { type: 'maintenance_update', requestId, url: `/maintenance/${requestId}` },
    actions: [
      { action: 'view', title: 'View Request' },
    ],
  }),

  announcement: (title: string, message: string): NotificationPayload => ({
    title: `Announcement: ${title}`,
    body: message,
    icon: '/icons/announcement-icon.png',
    data: { type: 'announcement', url: '/announcements' },
    actions: [
      { action: 'view', title: 'Read More' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }),

  emergencyAlert: (message: string): NotificationPayload => ({
    title: 'Emergency Alert',
    body: message,
    icon: '/icons/emergency-icon.png',
    data: { type: 'emergency', url: '/emergency' },
    requireInteraction: true,
    actions: [
      { action: 'acknowledge', title: 'Acknowledge' },
      { action: 'contact', title: 'Contact Support' },
    ],
  }),

  appointmentReminder: (title: string, time: string): NotificationPayload => ({
    title: 'Appointment Reminder',
    body: `${title} scheduled for ${time}`,
    icon: '/icons/calendar-icon.png',
    data: { type: 'appointment_reminder', url: '/appointments' },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'reschedule', title: 'Reschedule' },
    ],
  }),
};

// React hook for push notifications
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>('default');
  const [manager] = React.useState(() => new PushNotificationManager());

  React.useEffect(() => {
    setIsSupported(manager.isSupported());
    setIsSubscribed(manager.isSubscribed());
    setPermission(Notification.permission);
  }, [manager]);

  const requestPermission = React.useCallback(async () => {
    try {
      const newPermission = await manager.requestPermission();
      setPermission(newPermission);
      setIsSubscribed(manager.isSubscribed());
      return newPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error;
    }
  }, [manager]);

  const subscribe = React.useCallback(async () => {
    try {
      await manager.subscribeToPush();
      setIsSubscribed(true);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }, [manager]);

  const unsubscribe = React.useCallback(async () => {
    try {
      await manager.unsubscribe();
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }, [manager]);

  const showNotification = React.useCallback(async (payload: NotificationPayload) => {
    try {
      await manager.showLocalNotification(payload);
    } catch (error) {
      console.error('Error showing notification:', error);
      throw error;
    }
  }, [manager]);

  const sendTestNotification = React.useCallback(async () => {
    try {
      await manager.sendTestNotification();
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }, [manager]);

  return {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
    sendTestNotification,
    manager,
  };
};

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager();

// Import React for the hook
import React from 'react';