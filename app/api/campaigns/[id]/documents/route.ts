import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { uploadCampaignDocument } from '@/lib/firebase/storage-admin';
import {
  validateFileType,
  validateFileSize,
  validateFileCount,
  validateTotalSize,
  MAX_FILE_SIZE,
} from '@/lib/utils/file-validation';

// Helper to serialize Firestore data (converts Timestamps to ISO strings)
function serializeFirestoreData(data: any): any {
  if (!data) return data;

  if (data.toDate && typeof data.toDate === 'function') {
    // It's a Firestore Timestamp
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

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const campaignId = params.id;
      const userId = decodedToken.uid;

      // Get form data
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const description = formData.get('description') as string | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        );
      }

      // Fetch campaign from Firestore
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const campaign = campaignDoc.data();

      // Check authorization
      if (campaign?.brandId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: You can only upload documents to your own campaigns' },
          { status: 403 }
        );
      }

      // Validate file type
      const typeValidation = validateFileType(file);
      if (!typeValidation.valid) {
        return NextResponse.json(
          { success: false, error: typeValidation.error },
          { status: 400 }
        );
      }

      // Validate file size
      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        return NextResponse.json(
          { success: false, error: sizeValidation.error },
          { status: 400 }
        );
      }

      // Get existing attachments
      const existingAttachments = campaign.attachments || [];

      // Validate file count
      const countValidation = validateFileCount(existingAttachments.length, 1);
      if (!countValidation.valid) {
        return NextResponse.json(
          { success: false, error: countValidation.error },
          { status: 400 }
        );
      }

      // Validate total size
      const existingTotalSize = existingAttachments.reduce(
        (sum: number, att: any) => sum + (att.fileSize || 0),
        0
      );
      const totalValidation = validateTotalSize([file], existingTotalSize);
      if (!totalValidation.valid) {
        return NextResponse.json(
          { success: false, error: totalValidation.error },
          { status: 400 }
        );
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Firebase Storage
      const uploadResult = await uploadCampaignDocument(
        buffer,
        file.name,
        file.type,
        userId,
        campaignId
      );

      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, error: uploadResult.error || 'Upload failed' },
          { status: 500 }
        );
      }

      // Create document metadata
      const documentId = firestore.collection('campaigns').doc().id;
      const newAttachment: any = {
        id: documentId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storagePath: uploadResult.storagePath,
        downloadUrl: uploadResult.downloadUrl,
        uploadedBy: userId,
        uploadedAt: new Date(),
      };

      // Only add description if it has a value (Firestore doesn't allow undefined)
      if (description && description.trim()) {
        newAttachment.description = description.trim();
      }

      // Update campaign with new attachment
      const updatedAttachments = [...existingAttachments, newAttachment];
      await firestore.collection('campaigns').doc(campaignId).update({
        attachments: updatedAttachments,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        data: { attachment: serializeFirestoreData(newAttachment) },
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to upload document' },
        { status: 500 }
      );
    }
  });
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const campaignId = params.id;
      const userId = decodedToken.uid;

      // Fetch campaign from Firestore
      const campaignDoc = await firestore.collection('campaigns').doc(campaignId).get();

      if (!campaignDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const campaign = campaignDoc.data();

      // Check authorization
      if (campaign?.brandId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }

      const attachments = campaign.attachments || [];
      const totalSize = attachments.reduce((sum: number, att: any) => sum + (att.fileSize || 0), 0);

      // Serialize attachments to convert Firestore Timestamps to ISO strings
      const serializedAttachments = serializeFirestoreData(attachments);

      return NextResponse.json({
        success: true,
        data: {
          attachments: serializedAttachments,
          totalSize,
          count: attachments.length,
        },
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }
  });
}
