'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Loader, AlertCircle } from 'lucide-react';
import ContentPreview from './ContentPreview';
import FileUploadField from '@/components/campaigns/FileUploadField';
import { uploadFiles } from '@/lib/firebase/storage-utils';
import type { DeliverableSubmission } from '@/types/campaign';

interface ReviewCampaignDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DeliverableFormData) => Promise<void>;
  onDelete?: (deliverableId: string) => Promise<void>;
  campaignId: string;
  applicationId: string;
  existingDeliverable?: DeliverableSubmission | null;
  creatorName: string;
  creatorAvatar: string | null;
  availablePlatforms: string[];
  availableDeliverableTypes: string[];
}

export interface DeliverableFormData {
  platform: string;
  deliverableType: string;
  caption: string;
  contentUrl: string;
  contentScreenshots: string[];
  isDraft?: boolean;
  resubmit?: boolean;
}

const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook'];

const CONTENT_TYPE_MAP: Record<string, string[]> = {
  Instagram: ['Static Post', 'Reel', 'Story', 'Carousel'],
  TikTok: ['Video', 'Story'],
  YouTube: ['Video', 'Short'],
  Twitter: ['Post', 'Thread'],
  Facebook: ['Post', 'Reel', 'Story'],
};

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ReviewCampaignDeliverableModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  campaignId,
  applicationId,
  existingDeliverable,
  creatorName,
  creatorAvatar,
  availablePlatforms,
  availableDeliverableTypes,
}: ReviewCampaignDeliverableModalProps) {
  const isEditMode = !!existingDeliverable;

  const [platform, setPlatform] = useState('');
  const [contentType, setContentType] = useState('');
  const [caption, setCaption] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (existingDeliverable) {
      setPlatform(existingDeliverable.platform || '');
      setContentType(existingDeliverable.deliverableType || '');
      setCaption(existingDeliverable.caption || '');
      setContentUrl(existingDeliverable.contentUrl || '');
      setExistingFiles(existingDeliverable.contentScreenshots || []);
      setFiles([]);
    } else {
      setPlatform('');
      setContentType('');
      setCaption('');
      setContentUrl('');
      setExistingFiles([]);
      setFiles([]);
    }
    setError(null);
  }, [existingDeliverable, isOpen]);

  // Content types based on selected platform — always use CONTENT_TYPE_MAP defaults
  const contentTypes = useMemo(() => {
    if (!platform) return [];
    return CONTENT_TYPE_MAP[platform] || ['Post'];
  }, [platform]);

  // Platforms to show
  const platforms = useMemo(() => {
    if (availablePlatforms.length > 0) return availablePlatforms;
    return PLATFORM_OPTIONS;
  }, [availablePlatforms]);

  // Build all preview thumbnail URLs (existing + new file object URLs)
  const thumbnailUrls = useMemo(() => {
    const urls: string[] = [];

    // Add existing file URLs
    existingFiles.forEach((url) => urls.push(url));

    // Add new file preview URLs (images and videos)
    files.forEach((file) => {
      urls.push(URL.createObjectURL(file));
    });

    return urls;
  }, [files, existingFiles]);

  // Build media items with video detection for ContentPreview
  const mediaItems = useMemo(() => {
    const items: { url: string; isVideo: boolean }[] = [];

    existingFiles.forEach((url) => {
      const isVideo = /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);
      items.push({ url, isVideo });
    });

    files.forEach((file) => {
      items.push({ url: '', isVideo: file.type.startsWith('video/') });
    });

    return items;
  }, [files, existingFiles]);

  // Clean up object URLs on unmount or file change
  useEffect(() => {
    return () => {
      thumbnailUrls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [thumbnailUrls]);

  // File size validation
  const handleFileChange = (newFiles: File[]) => {
    const oversized = newFiles.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(', ');
      setError(`File(s) exceed ${MAX_FILE_SIZE_MB}MB limit: ${names}`);
      // Only keep files under the limit
      const valid = newFiles.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);
      setFiles(valid);
      return;
    }
    setError(null);
    setFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (!platform || !contentType) {
      setError('Please select a platform and content type.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let uploadedUrls: string[] = [...existingFiles];

      // Upload new files to Firebase Storage
      if (files.length > 0) {
        const uploaded = await uploadFiles(files, 'deliverables', campaignId);
        uploadedUrls = [...uploadedUrls, ...uploaded.map((f) => f.url)];
      }

      await onSubmit({
        platform,
        deliverableType: contentType,
        caption,
        contentUrl: contentUrl.trim() || '',
        contentScreenshots: uploadedUrls,
        resubmit: isEditMode && existingDeliverable?.status === 'revision_requested',
      });
    } catch (err) {
      console.error('Error submitting deliverable:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingDeliverable || !onDelete) return;

    setDeleting(true);
    setError(null);

    try {
      await onDelete(existingDeliverable.id);
    } catch (err) {
      console.error('Error deleting deliverable:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveExistingFile = (index: number) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Review Campaign Deliverables
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={submitting || deleting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
            <>
              {/* Brand feedback / revision notes */}
              {isEditMode && existingDeliverable?.status === 'revision_requested' && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-orange-800">Revision Requested</h4>
                      {existingDeliverable.revisionNotes && (
                        <p className="text-sm text-orange-700 mt-1">{existingDeliverable.revisionNotes}</p>
                      )}
                      {existingDeliverable.brandFeedback && existingDeliverable.brandFeedback !== existingDeliverable.revisionNotes && (
                        <p className="text-sm text-orange-600 mt-2 italic">{existingDeliverable.brandFeedback}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Content Preview with carousel */}
                <ContentPreview
                  platform={platform}
                  contentType={contentType}
                  caption={caption}
                  creatorName={creatorName}
                  creatorAvatar={creatorAvatar}
                  thumbnailUrls={thumbnailUrls}
                  mediaItems={mediaItems}
                />

                {/* Right: Form */}
                <div className="space-y-5">
                  {/* Platform */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => {
                        setPlatform(e.target.value);
                        setContentType('');
                      }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent bg-white"
                    >
                      <option value="">Select platform...</option>
                      {platforms.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Content Type
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      disabled={!platform}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent bg-white disabled:opacity-50"
                    >
                      <option value="">Select content type...</option>
                      {contentTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Content URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Post URL
                    </label>
                    <input
                      type="url"
                      value={contentUrl}
                      onChange={(e) => setContentUrl(e.target.value)}
                      placeholder="e.g. https://www.instagram.com/p/abc123"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Paste the link to your published post</p>
                  </div>

                  {/* Post Caption */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Post Caption
                    </label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add caption copy..."
                      rows={5}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Creative Assets */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Creative Assets
                      <span className="text-xs font-normal text-gray-400 ml-2">Max {MAX_FILE_SIZE_MB}MB per file</span>
                    </label>
                    <FileUploadField
                      id="creative-assets"
                      label=""
                      subLabel="Drag & drop or click the upload button to upload files"
                      buttonText="Upload"
                      acceptedFileTypes="image/*,video/*"
                      multiple
                      showImagePreviews
                      value={files}
                      onChange={handleFileChange}
                      existingFiles={existingFiles.map((url, i) => ({
                        name: `file-${i + 1}`,
                        url,
                        path: '',
                        size: 0,
                        type: 'image',
                      }))}
                      onRemoveExisting={handleRemoveExistingFile}
                    />
                  </div>
                </div>
              </div>
            </>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          {isEditMode ? (
            <button
              onClick={handleDelete}
              disabled={submitting || deleting}
              className="px-5 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {deleting && <Loader className="w-4 h-4 animate-spin" />}
              Delete
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || deleting || !platform || !contentType}
            className="px-5 py-2 bg-brand-navy text-white rounded-lg text-sm font-medium hover:bg-brand-navy-light transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader className="w-4 h-4 animate-spin" />}
            {isEditMode
              ? existingDeliverable?.status === 'revision_requested'
                ? 'Resubmit for Review'
                : 'Save'
              : 'Submit for Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
