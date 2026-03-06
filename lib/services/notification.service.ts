/**
 * Notification Service
 *
 * Handles creating in-app notifications (Firestore) and sending push notifications (FCM).
 * FCM is optional — if not configured, only Firestore notifications are created.
 */

import * as admin from 'firebase-admin';
import { getAdminDb, getAdminApp } from '@/lib/firebase/admin';

export type NotificationType =
  | 'application_received'
  | 'application_reviewed'
  | 'campaign_invitation'
  | 'invitation_response'
  | 'deliverable_submitted'
  | 'deliverable_reviewed'
  | 'payment_processed'
  | 'campaign_deadline'
  | 'message_received';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  campaignId?: string;
  applicationId?: string;
  deliverableId?: string;
  actionUrl?: string;
}

export interface PushNotificationData {
  title: string;
  body: string;
  actionUrl?: string;
}

/**
 * Create an in-app notification in Firestore
 * Deduplicates by userId + type + campaignId + applicationId + deliverableId.
 * For deliverable_reviewed, also matches on title so "Approved" vs "Revision Requested" are distinct.
 */
export async function createNotification(data: CreateNotificationData): Promise<string> {
  const db = getAdminDb();

  // ── Dedup check: skip if an identical notification already exists ──
  let query: FirebaseFirestore.Query = db
    .collection('notifications')
    .where('userId', '==', data.userId)
    .where('type', '==', data.type);

  if (data.campaignId) {
    query = query.where('campaignId', '==', data.campaignId);
  }
  if (data.applicationId) {
    query = query.where('applicationId', '==', data.applicationId);
  }
  if (data.deliverableId) {
    query = query.where('deliverableId', '==', data.deliverableId);
  }
  // For deliverable_reviewed, different actions (approve/reject/revision) should be distinct
  if (data.type === 'deliverable_reviewed') {
    query = query.where('title', '==', data.title);
  }

  const existing = await query.limit(1).get();
  if (!existing.empty) {
    return existing.docs[0].id;
  }

  // ── No duplicate found — create the notification ──
  const notificationRef = db.collection('notifications').doc();

  const notification = {
    id: notificationRef.id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    campaignId: data.campaignId || null,
    applicationId: data.applicationId || null,
    deliverableId: data.deliverableId || null,
    actionUrl: data.actionUrl || null,
    read: false,
    readAt: null,
    createdAt: new Date(),
  };

  await notificationRef.set(notification);
  return notificationRef.id;
}

/**
 * Send a push notification via FCM to a user's registered devices
 * Gracefully handles missing FCM configuration
 */
export async function sendPushNotification(
  userId: string,
  { title, body, actionUrl }: PushNotificationData
): Promise<void> {
  try {
    const db = getAdminDb();

    // Fetch user's FCM tokens
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    const fcmTokens: string[] = userData?.fcmTokens || [];

    if (fcmTokens.length === 0) return;

    // Get messaging instance
    let messaging: admin.messaging.Messaging;
    try {
      messaging = admin.messaging(getAdminApp());
    } catch {
      // FCM not available (missing credentials or not configured)
      console.warn('FCM not available, skipping push notification');
      return;
    }

    // Send to all registered tokens
    const message: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title,
        body,
      },
      data: {
        actionUrl: actionUrl || '/',
        type: 'campaign_notification',
      },
      webpush: {
        fcmOptions: {
          link: actionUrl || '/',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;
          if (
            errorCode === 'messaging/invalid-registration-token' ||
            errorCode === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(fcmTokens[idx]);
          }
        }
      });

      if (invalidTokens.length > 0) {
        // Remove invalid tokens from user document
        await db.collection('users').doc(userId).update({
          fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
        });
      }
    }
  } catch (error) {
    // Don't let push notification failures break the main flow
    console.error('Error sending push notification:', error);
  }
}

/**
 * Create notification + send push in one call
 */
export async function notifyUser(
  data: CreateNotificationData
): Promise<string> {
  const notificationId = await createNotification(data);

  // Fire-and-forget push notification
  sendPushNotification(data.userId, {
    title: data.title,
    body: data.message,
    actionUrl: data.actionUrl,
  }).catch((err) => console.error('Push notification failed:', err));

  return notificationId;
}
