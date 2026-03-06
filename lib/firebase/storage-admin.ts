/**
 * Server-side Storage Functions (using Firebase Admin SDK)
 * These are used by API routes that run on the server
 *
 * DO NOT import this file in client-side components!
 */

import { getAdminStorage } from './admin';

export interface UploadDocumentResult {
  success: boolean;
  storagePath?: string;
  downloadUrl?: string;
  error?: string;
}

export interface DeleteDocumentResult {
  success: boolean;
  error?: string;
}

/**
 * Upload a campaign document using Firebase Admin SDK (server-side)
 * Used by API routes for document upload
 */
export const uploadCampaignDocument = async (
  buffer: Buffer,
  fileName: string,
  contentType: string,
  userId: string,
  campaignId: string
): Promise<UploadDocumentResult> => {
  try {
    const adminStorage = getAdminStorage();
    const bucket = adminStorage.bucket();

    // Create a unique filename with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `campaigns/${campaignId}/documents/${timestamp}_${sanitizedName}`;

    const file = bucket.file(storagePath);

    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          uploadedBy: userId,
          campaignId,
          originalName: fileName,
        },
      },
    });

    // Make the file publicly accessible (or use signed URL)
    await file.makePublic();

    // Get the public URL
    const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    return {
      success: true,
      storagePath,
      downloadUrl,
    };
  } catch (error) {
    console.error('Error uploading campaign document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * Delete a campaign document from Firebase Storage using Admin SDK (server-side)
 * Used by API routes for document deletion
 */
export const deleteCampaignDocument = async (
  storagePath: string
): Promise<DeleteDocumentResult> => {
  try {
    const adminStorage = getAdminStorage();
    const bucket = adminStorage.bucket();
    const file = bucket.file(storagePath);

    // Check if file exists before attempting to delete
    const [exists] = await file.exists();
    if (!exists) {
      return {
        success: true, // Already deleted, consider success
      };
    }

    await file.delete();

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting campaign document:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
};
