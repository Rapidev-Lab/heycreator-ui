import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/firebase/auth-server';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/profiles/[id]/star
 * Toggles the 'starred' status of an influencer in the user's collection.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await requireAuth(request);
        if (authResult instanceof Response) return authResult;
        const { userId } = authResult;
        const profileId = params.id;

        const db = getAdminDb();

        // Check if the influencer is already in the user's collection
        const userCollectionQuery = await db.collection('user_collections')
            .where('userId', '==', userId)
            .where('globalInfluencerId', '==', profileId)
            .limit(1)
            .get();

        if (!userCollectionQuery.empty) {
            // Toggle existing starred status
            const doc = userCollectionQuery.docs[0];
            const currentStarred = doc.data().starred || false;
            await doc.ref.update({
                starred: !currentStarred,
                updatedAt: admin.firestore.Timestamp.now()
            });

            return NextResponse.json({
                success: true,
                starred: !currentStarred,
                message: `Influencer ${!currentStarred ? 'starred' : 'unstarred'}`
            });
        } else {
            // If it doesn't exist in user_collections, it's likely a profile from discovery
            // For simplicity in this dashboard toggle, we'll create a basic entry
            // In a full 'Save' flow, more data from discovery would be passed

            const newEntry = {
                userId,
                globalInfluencerId: profileId,
                customCategories: [],
                notes: '',
                lists: [],
                starred: true,
                collaborationStatus: 'none',
                enrichmentStatus: 'none',
                addedAt: admin.firestore.Timestamp.now(),
                lastViewedAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
            };

            await db.collection('user_collections').add(newEntry);

            return NextResponse.json({
                success: true,
                starred: true,
                message: 'Influencer saved and starred'
            });
        }
    } catch (error: any) {
        console.error('Toggle Star Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to toggle star' },
            { status: 500 }
        );
    }
}
