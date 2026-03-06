/**
 * Notifications API
 *
 * GET /api/notifications
 * Get notifications for the authenticated user
 *
 * Performance:
 * - Unread count checks (?unread=true&limit=1) fetch all notifications,
 *   dedup, then count unread — consistent with the full path.
 * - Per-user in-memory cache with 10s TTL for the polling use case
 *   (NotificationBell polls every 30s, but multiple tabs could overlap).
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

// ── Lightweight per-user unread count cache ──
// Prevents identical Firestore queries within 10s window
const UNREAD_CACHE_TTL_MS = 10_000;
const unreadCountCache = new Map<string, { count: number; timestamp: number }>();

function getCachedUnreadCount(userId: string): number | null {
  const entry = unreadCountCache.get(userId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > UNREAD_CACHE_TTL_MS) {
    unreadCountCache.delete(userId);
    return null;
  }
  return entry.count;
}

function setCachedUnreadCount(userId: string, count: number) {
  unreadCountCache.set(userId, { count, timestamp: Date.now() });
  // Prevent unbounded growth — evict stale entries periodically
  if (unreadCountCache.size > 500) {
    const now = Date.now();
    for (const [key, val] of unreadCountCache) {
      if (now - val.timestamp > UNREAD_CACHE_TTL_MS) unreadCountCache.delete(key);
    }
  }
}

export async function GET(request: NextRequest) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;
      const { searchParams } = new URL(request.url);

      const unreadOnly = searchParams.get('unread') === 'true';
      const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

      // ── Fast path: unread count only (polling from NotificationBell) ──
      // Fetches all notifications, deduplicates, then counts unread.
      // Cache (10s TTL) prevents repeated Firestore queries.
      if (unreadOnly && limit <= 1) {
        const cached = getCachedUnreadCount(userId);
        if (cached !== null) {
          return NextResponse.json({
            success: true,
            data: { notifications: [], unreadCount: cached },
          });
        }

        // Fetch ALL notifications so we can dedup before counting unread
        const allSnapshot = await firestore
          .collection('notifications')
          .where('userId', '==', userId)
          .get();

        // Sort by createdAt desc so we keep the newest per dedup key
        const docs = allSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            let createdAtMs: number;
            try {
              createdAtMs = data.createdAt?.toDate?.()
                ? data.createdAt.toDate().getTime()
                : new Date(data.createdAt).getTime();
              if (isNaN(createdAtMs)) createdAtMs = 0;
            } catch {
              createdAtMs = 0;
            }
            return { data, createdAtMs };
          })
          .sort((a, b) => b.createdAtMs - a.createdAtMs);

        const seen = new Set<string>();
        let unreadCount = 0;
        for (const { data } of docs) {
          const key = `${data.type || 'general'}:${data.campaignId || null}:${data.applicationId || null}:${data.deliverableId || null}:${data.title || 'Notification'}`;
          if (seen.has(key)) continue;
          seen.add(key);
          if (!data.read) unreadCount++;
        }

        setCachedUnreadCount(userId, unreadCount);

        return NextResponse.json({
          success: true,
          data: { notifications: [], unreadCount },
        });
      }

      // ── Full path: fetch notifications list ──
      const snapshot = await firestore
        .collection('notifications')
        .where('userId', '==', userId)
        .get();

      let notifications = snapshot.docs
        .map((doc) => {
          try {
            const data = doc.data();
            let createdAtDate: Date;
            try {
              createdAtDate = data.createdAt?.toDate?.()
                ? data.createdAt.toDate()
                : new Date(data.createdAt);
              if (isNaN(createdAtDate.getTime())) {
                createdAtDate = new Date();
              }
            } catch {
              createdAtDate = new Date();
            }

            return {
              id: doc.id,
              type: data.type || 'general',
              title: data.title || 'Notification',
              message: data.message || '',
              campaignId: data.campaignId || null,
              applicationId: data.applicationId || null,
              deliverableId: data.deliverableId || null,
              actionUrl: data.actionUrl || null,
              read: data.read || false,
              createdAt: createdAtDate.toISOString(),
              _createdAtMs: createdAtDate.getTime(),
            };
          } catch (err) {
            console.error('Error parsing notification doc:', doc.id, err);
            return null;
          }
        })
        .filter((n): n is NonNullable<typeof n> => n !== null);

      // Sort by createdAt descending
      notifications.sort((a, b) => b._createdAtMs - a._createdAtMs);

      // ── Collapse duplicates: keep newest per composite key ──
      {
        const seen = new Set<string>();
        notifications = notifications.filter((n) => {
          const key = `${n.type}:${n.campaignId}:${n.applicationId}:${n.deliverableId}:${n.title}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      // Count unread before filtering
      const unreadCount = notifications.filter((n) => !n.read).length;
      setCachedUnreadCount(userId, unreadCount);

      // Filter if unread only
      if (unreadOnly) {
        notifications = notifications.filter((n) => !n.read);
      }

      // Apply limit
      notifications = notifications.slice(0, limit);

      // Remove internal sort field
      const cleanNotifications = notifications.map(({ _createdAtMs, ...rest }) => rest);

      return NextResponse.json({
        success: true,
        data: {
          notifications: cleanNotifications,
          unreadCount,
        },
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }
  });
}
