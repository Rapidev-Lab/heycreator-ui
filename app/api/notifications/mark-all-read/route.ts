/**
 * Mark All Notifications Read API
 *
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';

export async function POST(request: NextRequest) {
  return requireAuth(async (decodedToken) => {
    try {
      const userId = decodedToken.uid;

      // Fetch all unread notifications for this user
      const snapshot = await firestore
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();

      if (snapshot.empty) {
        return NextResponse.json({
          success: true,
          message: 'No unread notifications',
          data: { updated: 0 },
        });
      }

      // Batch update (Firestore batch limit is 500)
      const batches: FirebaseFirestore.WriteBatch[] = [];
      let currentBatch = firestore.batch();
      let operationCount = 0;

      for (const doc of snapshot.docs) {
        currentBatch.update(doc.ref, {
          read: true,
          readAt: new Date(),
        });
        operationCount++;

        if (operationCount % 500 === 0) {
          batches.push(currentBatch);
          currentBatch = firestore.batch();
        }
      }

      // Push the last batch if it has operations
      if (operationCount % 500 !== 0) {
        batches.push(currentBatch);
      }

      // Execute all batches
      await Promise.all(batches.map((batch) => batch.commit()));

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
        data: { updated: operationCount },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to mark notifications as read' },
        { status: 500 }
      );
    }
  });
}
