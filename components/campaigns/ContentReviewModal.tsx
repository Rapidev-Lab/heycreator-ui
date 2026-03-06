'use client';

import { useState, useMemo } from 'react';
import { X, CheckCircle, ChevronLeft, ChevronRight, ImageIcon, Loader2, Film } from 'lucide-react';
import { ContentSubmission } from '@/components/campaigns/ContentSubmissionCard';
import { DeliverableStatus } from '@/types/campaign';

interface ContentReviewModalProps {
  submission: ContentSubmission;
  allSubmissions: ContentSubmission[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, notes?: string) => void;
  onSelectSubmission: (submission: ContentSubmission) => void;
}

const statusColors: Record<string, string> = {
  [DeliverableStatus.PENDING]: 'text-gray-500',
  [DeliverableStatus.IN_PROGRESS]: 'text-blue-500',
  [DeliverableStatus.SUBMITTED]: 'text-[#FF9800]',
  [DeliverableStatus.APPROVED]: 'text-[#00A63E]',
  [DeliverableStatus.REVISION_REQUESTED]: 'text-orange-500',
  [DeliverableStatus.REJECTED]: 'text-[#FF4D4F]',
  [DeliverableStatus.COMPLETED]: 'text-[#4A90E2]',
};

const statusLabels: Record<string, string> = {
  [DeliverableStatus.PENDING]: 'Draft',
  [DeliverableStatus.SUBMITTED]: 'Pending Review',
  [DeliverableStatus.APPROVED]: 'Approved',
  [DeliverableStatus.REVISION_REQUESTED]: 'Revision Requested',
  [DeliverableStatus.REJECTED]: 'Rejected',
  [DeliverableStatus.COMPLETED]: 'Completed',
};

export default function ContentReviewModal({
  submission,
  allSubmissions,
  onClose,
  onApprove,
  onReject,
  onSelectSubmission,
}: ContentReviewModalProps) {
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [revisionError, setRevisionError] = useState(false);

  const screenshots = submission.contentScreenshots || [];
  const currentImage = screenshots[imageIndex] || submission.thumbnailUrl;
  const hasMultipleImages = screenshots.length > 1;

  const isVideoContent = useMemo(() => {
    const videoTypes = ['Reel', 'Video', 'Short'];
    const isVideoType = videoTypes.some(t => submission.postType?.toLowerCase().includes(t.toLowerCase()));
    const isVideoUrl = currentImage ? /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(currentImage) : false;
    return isVideoType || isVideoUrl;
  }, [submission.postType, currentImage]);

  const handleApprove = async () => {
    setActionLoading('approve');
    await onApprove(submission.id);
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      setRevisionError(true);
      return;
    }
    setRevisionError(false);
    setActionLoading('reject');
    await onReject(submission.id, comment.trim());
    setActionLoading(null);
    setComment('');
  };

  const goNextImage = () => setImageIndex((i) => (i + 1) % screenshots.length);
  const goPrevImage = () => setImageIndex((i) => (i - 1 + screenshots.length) % screenshots.length);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {submission.creatorAvatar ? (
              <img
                src={submission.creatorAvatar}
                alt={submission.creatorName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="w-12 h-12 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-lg">
                {submission.creatorName.charAt(0)}
              </span>
            )}
            <div>
              <h2 className="text-lg font-bold text-brand-navy">{submission.creatorName}</h2>
              <p className="text-sm text-gray-500">Submitted {submission.submittedDate}</p>
            </div>
            <span
              className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                submission.status === DeliverableStatus.APPROVED
                  ? 'bg-[#E8F5E9] text-[#00A63E]'
                  : submission.status === DeliverableStatus.SUBMITTED
                  ? 'bg-yellow-50 text-yellow-700'
                  : submission.status === DeliverableStatus.REJECTED
                  ? 'bg-red-50 text-red-700'
                  : submission.status === DeliverableStatus.REVISION_REQUESTED
                  ? 'bg-orange-50 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {statusLabels[submission.status] || submission.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left: Deliverables List */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
                All Submissions ({allSubmissions.length})
              </h3>
              {allSubmissions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No submissions yet</p>
              ) : (
                allSubmissions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectSubmission(item);
                      setImageIndex(0);
                    }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      item.id === submission.id
                        ? 'border-[#4A90E2] bg-[#E3F2FD]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-semibold text-brand-navy block truncate">
                          {item.platform} {item.postType}
                        </span>
                        <span className="text-[11px] text-gray-400 block truncate">
                          {item.creatorName} &middot; {item.submittedDate}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold whitespace-nowrap ${statusColors[item.status] || 'text-gray-500'}`}>
                        {statusLabels[item.status] || item.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Center: Content Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-0">
                <div className="relative aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden">
                  {currentImage ? (
                    isVideoContent ? (
                      <video
                        key={currentImage}
                        src={currentImage}
                        controls
                        className="w-full h-full object-contain bg-black"
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={currentImage}
                        alt="Content preview"
                        className="w-full h-full object-contain bg-white"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span className="text-sm">No preview available</span>
                    </div>
                  )}

                  {/* Carousel arrows */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={goPrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={goNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </>
                  )}

                  {/* Dot indicators */}
                  {hasMultipleImages && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {screenshots.map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i === imageIndex ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Platform badge */}
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2">
                    {submission.creatorAvatar ? (
                      <img src={submission.creatorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <span className="text-[9px] text-brand-navy font-bold">{submission.creatorName.charAt(0)}</span>
                      </div>
                    )}
                    {submission.creatorName}
                    <span className="bg-white/20 px-2 py-0.5 rounded">{submission.platform} {submission.postType}</span>
                  </div>
                </div>

                {/* Caption area */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  {submission.caption ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.caption}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No caption provided</p>
                  )}
                </div>

                {/* Content URL — only show when creator has submitted the final live link */}
                {submission.status === DeliverableStatus.COMPLETED && submission.liveUrl && (
                  <a
                    href={submission.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-center text-sm text-[#4A90E2] font-semibold hover:underline"
                  >
                    View Original Post &rarr;
                  </a>
                )}
              </div>
            </div>

            {/* Right: Comments & Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Review & Feedback</h3>

              {/* Comment Input */}
              <div className="space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => { setComment(e.target.value); if (e.target.value.trim()) setRevisionError(false); }}
                  placeholder="Add revision notes for the creator..."
                  className={`w-full p-3 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 ${
                    revisionError ? 'border-red-500 focus:ring-red-400' : 'border-gray-200 focus:ring-[#4A90E2]'
                  }`}
                  rows={4}
                />
                {submission.status === DeliverableStatus.SUBMITTED && !comment.trim() && (
                  <p className={`text-xs ${revisionError ? 'text-red-500 font-medium' : 'text-gray-400'}`}>Notes are required when requesting a revision.</p>
                )}
              </div>

              {/* Action Buttons — show for submitted deliverables */}
              {submission.status === DeliverableStatus.SUBMITTED && (
                <div className="flex gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading !== null}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#00A63E] text-white rounded-lg font-semibold hover:bg-[#008A33] transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'approve' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading !== null}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#FF4D4F] text-white rounded-lg font-semibold hover:bg-[#E33A3C] transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'reject' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                    Request Revision
                  </button>
                </div>
              )}

              {/* Status Messages */}
              {submission.status === DeliverableStatus.APPROVED && (
                <div className="flex items-center gap-2 p-3 bg-[#E8F5E9] text-[#00A63E] rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">Approved</p>
                    <p className="text-xs">This content has been approved for publishing.</p>
                  </div>
                </div>
              )}

              {submission.status === DeliverableStatus.REVISION_REQUESTED && (
                <div className="flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg">
                  <X className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">Revision Requested</p>
                    <p className="text-xs">Waiting for the creator to resubmit.</p>
                  </div>
                </div>
              )}

              {submission.status === DeliverableStatus.REJECTED && (
                <div className="flex items-center gap-2 p-3 bg-[#FFEBEE] text-[#FF4D4F] rounded-lg">
                  <X className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-bold">Rejected</p>
                    <p className="text-xs">This content was not approved.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
