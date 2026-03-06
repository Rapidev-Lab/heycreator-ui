'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, File, AlertCircle, Loader2 } from 'lucide-react';
import { formatFileSize, getFileIcon } from '@/lib/utils/file-validation';

interface CampaignAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  downloadUrl: string;
  uploadedBy: string;
  uploadedAt: Date | { seconds: number; nanoseconds: number } | string;
  description?: string;
  replacedAt?: Date | { seconds: number; nanoseconds: number } | string;
}

interface DocumentListProps {
  campaignId: string;
  refreshTrigger?: number;
}

export default function DocumentList({ campaignId, refreshTrigger = 0 }: DocumentListProps) {
  const [documents, setDocuments] = useState<CampaignAttachment[]>([]);
  const [totalSize, setTotalSize] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [documentToReplace, setDocumentToReplace] = useState<CampaignAttachment | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceDescription, setReplaceDescription] = useState('');

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('You must be logged in to view documents');
      }

      const token = await user.getIdToken();

      const response = await fetch(`/api/campaigns/${campaignId}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.data.attachments || []);
      setTotalSize(data.data.totalSize || 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [campaignId, refreshTrigger]);

  const handleDownload = (doc: CampaignAttachment) => {
    window.open(doc.downloadUrl, '_blank');
  };

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);

    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('You must be logged in to delete documents');
      }

      const token = await user.getIdToken();

      const response = await fetch(
        `/api/campaigns/${campaignId}/documents/${documentToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      // Refresh the list
      await fetchDocuments();
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete document';
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplaceClick = (doc: CampaignAttachment) => {
    setDocumentToReplace(doc);
    setReplaceDescription(doc.description || '');
    setSelectedFile(null);
    setReplaceModalOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleReplaceConfirm = async () => {
    if (!documentToReplace || !selectedFile) return;

    setIsReplacing(true);

    try {
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('You must be logged in to replace documents');
      }

      const token = await user.getIdToken();

      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (replaceDescription.trim()) {
        formData.append('description', replaceDescription.trim());
      }

      const response = await fetch(
        `/api/campaigns/${campaignId}/documents/${documentToReplace.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to replace document');
      }

      // Refresh the list
      await fetchDocuments();
      setReplaceModalOpen(false);
      setDocumentToReplace(null);
      setSelectedFile(null);
      setReplaceDescription('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to replace document';
      alert(errorMessage);
    } finally {
      setIsReplacing(false);
    }
  };

  const formatDate = (date: Date | { seconds: number; nanoseconds: number } | string): string => {
    if (!date) return 'Unknown date';

    let actualDate: Date;

    if (date instanceof Date) {
      actualDate = date;
    } else if (typeof date === 'string') {
      // Handle ISO string dates from API serialization
      actualDate = new Date(date);
    } else if (typeof date === 'object' && 'seconds' in date) {
      // Handle Firestore Timestamp objects
      actualDate = new Date(date.seconds * 1000);
    } else {
      return 'Unknown date';
    }

    // Check if date is valid
    if (isNaN(actualDate.getTime())) {
      return 'Unknown date';
    }

    return actualDate.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <File className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">No documents uploaded yet</p>
        <p className="text-sm text-gray-500 mt-1">Upload your first document to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Document Count and Total Size */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {documents.length} {documents.length === 1 ? 'document' : 'documents'}
        </span>
        <span>Total size: {formatFileSize(totalSize)}</span>
      </div>

      {/* Document List */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            {/* File Icon */}
            <span className="text-3xl flex-shrink-0">{getFileIcon(doc.fileName)}</span>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{doc.fileName}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>•</span>
                <span>Uploaded {formatDate(doc.uploadedAt)}</span>
              </div>
              {doc.description && (
                <p className="text-sm text-gray-600 mt-1 italic">{doc.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleReplaceClick(doc)}
                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                title="Replace"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(doc.id)}
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Delete Document</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this document? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDocumentToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Document Modal */}
      {replaceModalOpen && documentToReplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-green-600 mb-4">
              <RefreshCw className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Replace Document</h3>
            </div>

            {/* Current Document Info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Current file:</p>
              <div className="flex items-center gap-2">
                <span className="text-xl">{getFileIcon(documentToReplace.fileName)}</span>
                <p className="font-medium text-gray-900 truncate">{documentToReplace.fileName}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatFileSize(documentToReplace.fileSize)}</p>
            </div>

            {/* File Picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select new file
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif"
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {selectedFile && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <span className="text-xl">{getFileIcon(selectedFile.name)}</span>
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-gray-500">({formatFileSize(selectedFile.size)})</span>
                </div>
              )}
            </div>

            {/* Description (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                value={replaceDescription}
                onChange={(e) => setReplaceDescription(e.target.value)}
                placeholder="Add a note about this document..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setReplaceModalOpen(false);
                  setDocumentToReplace(null);
                  setSelectedFile(null);
                  setReplaceDescription('');
                }}
                disabled={isReplacing}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReplaceConfirm}
                disabled={isReplacing || !selectedFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isReplacing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isReplacing ? 'Replacing...' : 'Replace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
