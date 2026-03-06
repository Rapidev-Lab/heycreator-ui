/**
 * Firebase Cloud Messaging - Client-side utilities
 *
 * Handles FCM token registration and notification permission.
 * Gracefully degrades if FCM is not configured (no VAPID key).
 */

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import app from './config';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * Check if FCM is available and configured
 */
export async function isFCMAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!VAPID_KEY) return false;
  if (!app) return false;
  try {
    return await isSupported();
  } catch {
    return false;
  }
}

/**
 * Request notification permission and get FCM token.
 * Returns null if FCM is not available or permission denied.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const available = await isFCMAvailable();
    if (!available) {
      console.info('FCM not available, skipping push notification setup');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('Notification permission denied');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    const messaging = getMessaging(app!);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Listen for foreground messages.
 * Returns an unsubscribe function, or null if FCM is not available.
 */
export async function onForegroundMessage(
  callback: (payload: { title?: string; body?: string; actionUrl?: string }) => void
): Promise<(() => void) | null> {
  try {
    const available = await isFCMAvailable();
    if (!available || !app) return null;

    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      callback({
        title: payload.notification?.title,
        body: payload.notification?.body,
        actionUrl: payload.data?.actionUrl,
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up foreground messages:', error);
    return null;
  }
}

/**
 * Save FCM token to user's Firestore document
 */
export async function saveFCMToken(token: string, idToken: string): Promise<void> {
  try {
    await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
}
