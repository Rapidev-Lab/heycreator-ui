import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

export interface UploadedFile {
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
}

const isMockMode =
  process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

function mockUploadedFile(file: File, mockPath: string): UploadedFile {
  return {
    name: file.name,
    url: `/mock-uploads/${mockPath}`,
    path: mockPath,
    size: file.size,
    type: file.type,
  };
}

/**
 * Upload a single file to Firebase Storage
 */
export const uploadFile = async (
  file: File,
  folder: string,
  campaignId: string
): Promise<UploadedFile> => {
  if (isMockMode) {
    const mockPath = `campaigns/${campaignId}/${folder}/${Date.now()}_${file.name}`;
    return mockUploadedFile(file, mockPath);
  }
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  // Create a unique filename with timestamp to avoid collisions
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `campaigns/${campaignId}/${folder}/${timestamp}_${sanitizedName}`;

  const storageRef = ref(storage, path);

  // Upload the file
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  // Get the download URL
  const url = await getDownloadURL(snapshot.ref);

  return {
    name: file.name,
    url,
    path,
    size: file.size,
    type: file.type,
  };
};

/**
 * Upload multiple files to Firebase Storage
 */
export const uploadFiles = async (
  files: File[],
  folder: string,
  campaignId: string,
  onProgress?: (completed: number, total: number) => void
): Promise<UploadedFile[]> => {
  const uploadedFiles: UploadedFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const uploaded = await uploadFile(file, folder, campaignId);
    uploadedFiles.push(uploaded);

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return uploadedFiles;
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  if (isMockMode) return;
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
};

/**
 * Upload a profile photo to Firebase Storage
 */
export const uploadProfilePhoto = async (
  userId: string,
  file: File
): Promise<UploadedFile> => {
  if (isMockMode) {
    const ext = file.name.split('.').pop() || 'jpg';
    const mockPath = `users/${userId}/profile/avatar_${Date.now()}.${ext}`;
    return mockUploadedFile(file, mockPath);
  }
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `users/${userId}/profile/avatar_${timestamp}.${ext}`;

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });
  const url = await getDownloadURL(snapshot.ref);

  return {
    name: file.name,
    url,
    path,
    size: file.size,
    type: file.type,
  };
};

/**
 * Upload all campaign files (assets, mood board, brief, contract)
 */
export const uploadCampaignFiles = async (
  campaignId: string,
  files: {
    campaignAssets: File[];
    moodBoard: File[];
    campaignBrief: File[];
    contractNDA: File[];
    productImages: File[];
  },
  onProgress?: (message: string) => void
): Promise<{
  campaignAssets: UploadedFile[];
  moodBoard: UploadedFile[];
  campaignBrief: UploadedFile[];
  contractNDA: UploadedFile[];
  productImages: UploadedFile[];
}> => {
  const result = {
    campaignAssets: [] as UploadedFile[],
    moodBoard: [] as UploadedFile[],
    campaignBrief: [] as UploadedFile[],
    contractNDA: [] as UploadedFile[],
    productImages: [] as UploadedFile[],
  };

  // Upload campaign assets
  if (files.campaignAssets.length > 0) {
    onProgress?.('Uploading campaign assets...');
    result.campaignAssets = await uploadFiles(files.campaignAssets, 'assets', campaignId);
  }

  // Upload mood board
  if (files.moodBoard.length > 0) {
    onProgress?.('Uploading mood board...');
    result.moodBoard = await uploadFiles(files.moodBoard, 'moodboard', campaignId);
  }

  // Upload campaign brief
  if (files.campaignBrief.length > 0) {
    onProgress?.('Uploading campaign brief...');
    result.campaignBrief = await uploadFiles(files.campaignBrief, 'brief', campaignId);
  }

  // Upload contract/NDA
  if (files.contractNDA.length > 0) {
    onProgress?.('Uploading contract/NDA...');
    result.contractNDA = await uploadFiles(files.contractNDA, 'contract', campaignId);
  }

  // Upload product images
  if (files.productImages.length > 0) {
    onProgress?.('Uploading product images...');
    result.productImages = await uploadFiles(files.productImages, 'products', campaignId);
  }

  return result;
};
