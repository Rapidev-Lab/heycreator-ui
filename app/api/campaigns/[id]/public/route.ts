import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';

// Helper to serialize Firestore data (converts Timestamps to ISO strings)
function serializeFirestoreData(data: any): any {
  if (!data) return data;

  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }

  if (data instanceof Date) {
    return data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }

  if (typeof data === 'object') {
    const serialized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        serialized[key] = serializeFirestoreData(data[key]);
      }
    }
    return serialized;
  }

  return data;
}

/**
 * Public endpoint to fetch campaign details
 * Only returns data for published/active campaigns
 * No authentication required
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    // Fetch campaign from Firestore
    const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

    if (!campaignDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaignDoc.data();

    // Only allow viewing published/active campaigns publicly
    const allowedStatuses = ['PUBLISHED', 'ACTIVE', 'IN_PROGRESS', 'published', 'active', 'in_progress'];
    if (!allowedStatuses.includes(campaign?.status || '')) {
      return NextResponse.json(
        { success: false, error: 'This campaign is not available for public viewing' },
        { status: 403 }
      );
    }

    // For public endpoint, don't include sensitive data like applications
    // Return only the campaign data needed for the brief view
    return NextResponse.json({
      success: true,
      data: {
        campaign: {
          ...serializeFirestoreData(campaign),
          id: campaignId,
        },
      },
    });
  } catch (error) {
    console.error(`Error fetching public campaign ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}
