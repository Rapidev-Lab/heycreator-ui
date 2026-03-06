'use client';

import { DeliverableStatus } from '@/types/campaign';
import { Eye, ExternalLink, ImageIcon, Film, Play } from 'lucide-react';

export interface ContentSubmission {
  id: string;
  creatorName: string;
  creatorAvatar: string | null;
  platform: string;
  postType: string;
  submittedDate: string;
  thumbnailUrl: string;
  contentScreenshots: string[];
  caption?: string;
  liveUrl?: string;
  status: DeliverableStatus;
}

interface ContentSubmissionCardProps {
  submission: ContentSubmission;
  onApprove: (id: string) => void;
  onReject: (id: string, notes?: string) => void;
  onView: (submission: ContentSubmission) => void;
}

const getStatusStyles = (status: DeliverableStatus) => {
  switch (status) {
    case DeliverableStatus.APPROVED:
      return { badge: 'bg-green-100 text-green-800', label: 'Approved' };
    case DeliverableStatus.REJECTED:
      return { badge: 'bg-red-100 text-red-800', label: 'Rejected' };
    case DeliverableStatus.SUBMITTED:
      return { badge: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' };
    case DeliverableStatus.REVISION_REQUESTED:
      return { badge: 'bg-orange-100 text-orange-800', label: 'Revision Requested' };
    case DeliverableStatus.COMPLETED:
      return { badge: 'bg-blue-100 text-blue-800', label: 'Completed' };
    case DeliverableStatus.PENDING:
      return { badge: 'bg-gray-100 text-gray-800', label: 'Draft' };
    default:
      return { badge: 'bg-gray-100 text-gray-800', label: status };
  }
};


export default function ContentSubmissionCard({
  submission,
  onApprove,
  onReject,
  onView,
}: ContentSubmissionCardProps) {
  const { badge, label } = getStatusStyles(submission.status);
  const videoTypes = ['Reel', 'Video', 'Short'];
  const isVideoType = videoTypes.some(t => submission.postType?.toLowerCase().includes(t.toLowerCase()));
  const isVideoUrl = submission.thumbnailUrl ? /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(submission.thumbnailUrl) : false;
  const isVideo = isVideoType || isVideoUrl;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden group">
      <div className="relative">
        {submission.thumbnailUrl ? (
          isVideo ? (
            <div className="relative w-full h-48 bg-gray-900">
              <video
                src={submission.thumbnailUrl}
                className="w-full h-full object-contain"
                muted
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" />
                </div>
              </div>
            </div>
          ) : (
            <img src={submission.thumbnailUrl} alt="Submission thumbnail" className="w-full h-48 object-contain bg-white" />
          )
        ) : (
          <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            {isVideo ? (
              <>
                <Film className="w-8 h-8 mb-1" />
                <span className="text-xs">Video submitted</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-xs">No preview</span>
              </>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <button
            onClick={() => onView(submission)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-white/80 rounded-lg hover:bg-white"
          >
            <Eye className="w-4 h-4" />
            Review Content
          </button>
        </div>
        {/* Content type badge — top left */}
        <span className="absolute top-2 left-2 inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-medium bg-brand-navy/80 backdrop-blur-sm text-white">
          {submission.platform} · {submission.postType}
        </span>
        {/* Status badge — top right */}
        <span className={`absolute top-2 right-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge}`}>
            {label}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          {submission.creatorAvatar ? (
            <img src={submission.creatorAvatar} alt={submission.creatorName} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <span className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
              {submission.creatorName.charAt(0)}
            </span>
          )}
          <div className="ml-3 min-w-0">
            <p className="font-semibold text-gray-800 text-sm truncate">{submission.creatorName}</p>
            {submission.submittedDate && (
              <p className="text-[10px] text-gray-400 leading-tight">Submitted {submission.submittedDate}</p>
            )}
          </div>
        </div>

        {submission.status === DeliverableStatus.COMPLETED && submission.liveUrl && (
          <a href={submission.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:underline truncate">
            <ExternalLink className="w-3 h-3 flex-shrink-0"/>
            <span className="truncate">View Live Post</span>
          </a>
        )}
      </div>
    </div>
  );
}
