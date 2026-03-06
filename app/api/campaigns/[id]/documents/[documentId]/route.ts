import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase/admin';
import { requireAuth } from '@/lib/middleware/campaign-auth';
import { deleteCampaignDocument, uploadCampaignDocument } from '@/lib/firebase/storage-admin';
import {
  validateFileType,
  validateFileSize,
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

/**
 * PUT /api/campaigns/[id]/documents/[documentId]
 * Replace an existing document with a new file
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const campaignId = params.id;
      const documentId = params.documentId;
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
          { success: false, error: 'Unauthorized: You can only replace documents in your own campaigns' },
          { status: 403 }
        );
      }

      // Find the document in attachments
      const attachments = campaign.attachments || [];
      const documentIndex = attachments.findIndex((att: any) => att.id === documentId);

      if (documentIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Document not found' },
          { status: 404 }
        );
      }

      const oldDocument = attachments[documentIndex];

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload new file to Firebase Storage
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

      // Delete old file from Storage (best effort - continue even if it fails)
      const deleteResult = await deleteCampaignDocument(oldDocument.storagePath);
      if (!deleteResult.success) {
        console.warn('Failed to delete old file from storage:', deleteResult.error);
        // Continue anyway - new file is uploaded, old reference will be replaced
      }

      // Create updated document metadata (preserve ID)
      const updatedDocument: any = {
        id: documentId, // Preserve the same ID
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storagePath: uploadResult.storagePath,
        downloadUrl: uploadResult.downloadUrl,
        uploadedBy: userId,
        uploadedAt: new Date(),
        replacedAt: new Date(), // Track when it was replaced
      };

      // Handle description: use new description if provided, otherwise keep old one
      // Only add description field if it has a value (Firestore doesn't allow undefined)
      const newDescription = description !== null && description?.trim() ? description.trim() : null;
      const finalDescription = newDescription || oldDocument.description;

      if (finalDescription && finalDescription.trim()) {
        updatedDocument.description = finalDescription.trim();
      }

      // Update attachments array
      const updatedAttachments = [...attachments];
      updatedAttachments[documentIndex] = updatedDocument;

      // Update campaign
      await firestore.collection('campaigns').doc(campaignId).update({
        attachments: updatedAttachments,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        data: { attachment: serializeFirestoreData(updatedDocument) },
        message: 'Document replaced successfully',
      });
    } catch (error) {
      console.error('Error replacing document:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to replace document' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; documentId: string } }
) {
  return requireAuth(async (decodedToken) => {
    try {
      const campaignId = params.id;
      const documentId = params.documentId;
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
          { success: false, error: 'Unauthorized: You can only delete documents from your own campaigns' },
          { status: 403 }
        );
      }

      // Find the document in attachments
      const attachments = campaign.attachments || [];
      const documentIndex = attachments.findIndex((att: any) => att.id === documentId);

      if (documentIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Document not found' },
          { status: 404 }
        );
      }

      const document = attachments[documentIndex];

      // Delete from Firebase Storage
      const deleteResult = await deleteCampaignDocument(document.storagePath);

      if (!deleteResult.success) {
        console.error('Failed to delete from storage:', deleteResult.error);
        // Continue anyway to remove from Firestore
      }

      // Remove from attachments array
      const updatedAttachments = attachments.filter((_: any, index: number) => index !== documentIndex);

      // Update campaign
      await firestore.collection('campaigns').doc(campaignId).update({
        attachments: updatedAttachments,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete document' },
        { status: 500 }
      );
    }
  });
}
