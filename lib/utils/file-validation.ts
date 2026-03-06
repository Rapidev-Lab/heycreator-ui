/**
 * File validation utilities for document uploads
 */

export const ALLOWED_FILE_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_FILES = 10;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file type
 */
export function validateFileType(file: File): ValidationResult {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

  // Check MIME type
  if (ALLOWED_FILE_TYPES.includes(fileType)) {
    return { valid: true };
  }

  // Fallback: check file extension (some browsers don't provide correct MIME types)
  if (ALLOWED_EXTENSIONS.includes(fileExtension)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `File type not allowed. Allowed types: PDF, DOC, XLS, PPT, TXT, CSV, and images (JPG, PNG, GIF, WEBP)`,
  };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): ValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds ${sizeMB}MB limit`,
    };
  }
  return { valid: true };
}

/**
 * Validate total size of all files
 */
export function validateTotalSize(files: File[], existingSize: number = 0): ValidationResult {
  const totalSize = files.reduce((sum, file) => sum + file.size, existingSize);

  if (totalSize > MAX_TOTAL_SIZE) {
    const sizeMB = (MAX_TOTAL_SIZE / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Total campaign documents exceed ${sizeMB}MB limit`,
    };
  }
  return { valid: true };
}

/**
 * Validate number of files
 */
export function validateFileCount(currentCount: number, newFilesCount: number = 1): ValidationResult {
  if (currentCount + newFilesCount > MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${MAX_FILES} documents per campaign`,
    };
  }
  return { valid: true };
}

/**
 * Validate a single file (all checks)
 */
export function validateFile(file: File): ValidationResult {
  const typeCheck = validateFileType(file);
  if (!typeCheck.valid) return typeCheck;

  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.valid) return sizeCheck;

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file icon based on type
 */
export function getFileIcon(fileName: string): string {
  const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

  switch (ext) {
    case '.pdf':
      return '📄';
    case '.doc':
    case '.docx':
      return '📝';
    case '.xls':
    case '.xlsx':
      return '📊';
    case '.ppt':
    case '.pptx':
      return '📽️';
    case '.txt':
    case '.csv':
      return '📋';
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
    case '.webp':
      return '🖼️';
    default:
      return '📎';
  }
}
