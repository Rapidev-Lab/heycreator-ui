'use client';

import { useState } from 'react';
import { Image as ImageIcon, Play, Calendar, MessageCircle, ChevronLeft, ChevronRight, AlertCircle, ExternalLink, Link, Check, Loader2 } from 'lucide-react';
import type { DeliverableSubmission } from '@/types/campaign';

interface CreatorDeliverableCardProps {
  deliverable: DeliverableSubmission;
  onClick: () => void;
  onSubmitUrl?: (deliverableId: string, contentUrl: string) => Promise<void>;
  creatorName?: string;
  creatorAvatar?: string | null;
}

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  submitted: { label: 'Pending Review', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  approved: { label: 'Approved', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  revision_requested: { label: 'Revision Requested', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  rejected: { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  completed: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
};

function formatDate(val: any): string | null {
  if (!val) return null;
  try {
    const d = typeof val === 'string' ? new Date(val) : val?.toDate?.() || new Date(val);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  } catch {
    return null;
  }
}

function isVideoType(type: string): boolean {
  const videoTypes = ['reel', 'reels', 'story', 'stories', 'video', 'tiktok', 'short', 'shorts'];
  return videoTypes.some((v) => type.toLowerCase().includes(v));
}

export default function CreatorDeliverableCard({
  deliverable,
  onClick,
  onSubmitUrl,
  creatorName,
  creatorAvatar,
}: CreatorDeliverableCardProps) {
  const screenshots = deliverable.contentScreenshots || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [submittingUrl, setSubmittingUrl] = useState(false);
  const hasMultiple = screenshots.length > 1;
  const currentImage = screenshots[currentIndex] || null;

  const status = STATUS_STYLES[deliverable.status] || STATUS_STYLES.pending;
  const submittedDate = formatDate(deliverable.submittedAt);
  const showPlayButton = isVideoType(deliverable.deliverableType || '');

  const platformBadge = [deliverable.platform, deliverable.deliverableType]
    .filter(Boolean)
    .join(' · ');

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i + 1) % screenshots.length);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((i) => (i - 1 + screenshots.length) % screenshots.length);
  };

  const isApproved = deliverable.status === 'approved' || deliverable.status === 'completed';

  return (
    <button
      onClick={isApproved ? undefined : onClick}
      className={`group relative bg-white border border-gray-200 rounded-xl overflow-hidden transition-all text-left w-full ${
        isApproved ? 'cursor-default' : 'hover:border-brand-navy hover:shadow-md cursor-pointer'
      }`}
    >
      {/* Thumbnail area — fixed height */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {currentImage ? (
          <img
            src={currentImage}
            alt={deliverable.deliverableType}
            className="w-full h-full object-contain bg-white"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-xs">No preview</span>
          </div>
        )}

        {/* Carousel arrows */}
        {hasMultiple && (
          <>
            <div
              onClick={goPrev}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </div>
            <div
              onClick={goNext}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
          </>
        )}

        {/* Dot indicators */}
        {hasMultiple && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {screenshots.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Play button overlay for video types */}
        {showPlayButton && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Platform badge — top left */}
        {platformBadge && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand-navy/80 backdrop-blur-sm rounded text-[10px] font-medium text-white">
            {platformBadge}
          </span>
        )}

        {/* Status badge — top right */}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold ${status.bg} ${status.text} border ${status.border}`}
        >
          {status.label}
        </span>
      </div>

      {/* Creator info + caption */}
      <div className="p-3 space-y-1.5">
        {/* Creator row */}
        <div className="flex items-center gap-2">
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName || ''}
              className="w-5 h-5 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-brand-navy flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
              {(creatorName || 'C')[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {creatorName || 'Creator'}
            </p>
            {submittedDate && (
              <p className="text-[10px] text-gray-400 leading-tight">Submitted {submittedDate}</p>
            )}
          </div>
        </div>

        {/* Revision notes banner */}
        {deliverable.status === 'revision_requested' && deliverable.revisionNotes && (
          <div className="flex items-start gap-1.5 p-2 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-orange-700 line-clamp-2 leading-snug">
              {deliverable.revisionNotes}
            </p>
          </div>
        )}

        {/* Caption */}
        {deliverable.caption && (
          <p className="text-[11px] text-gray-600 line-clamp-2 leading-snug">{deliverable.caption}</p>
        )}

        {/* Completed — show live link */}
        {deliverable.status === 'completed' && deliverable.liveUrl && (
          <a
            href={deliverable.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium hover:underline truncate"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">View Live Post</span>
          </a>
        )}

        {/* Approved — show content URL or input to add one */}
        {deliverable.status === 'approved' && onSubmitUrl && (
          <div onClick={(e) => e.stopPropagation()}>
            {deliverable.contentUrl ? (
              <a
                href={deliverable.contentUrl.startsWith('http') ? deliverable.contentUrl : `https://${deliverable.contentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium hover:underline truncate"
              >
                <Link className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{deliverable.contentUrl.replace(/^https?:\/\//, '')}</span>
              </a>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste post URL..."
                  className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-[11px] focus:ring-1 focus:ring-brand-navy focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && urlInput.trim()) {
                      e.preventDefault();
                      setSubmittingUrl(true);
                      const url = urlInput.trim().startsWith('http') ? urlInput.trim() : `https://${urlInput.trim()}`;
                      onSubmitUrl(deliverable.id, url)
                        .then(() => setUrlInput(''))
                        .finally(() => setSubmittingUrl(false));
                    }
                  }}
                />
                <button
                  disabled={!urlInput.trim() || submittingUrl}
                  onClick={() => {
                    if (!urlInput.trim()) return;
                    setSubmittingUrl(true);
                    const url = urlInput.trim().startsWith('http') ? urlInput.trim() : `https://${urlInput.trim()}`;
                    onSubmitUrl(deliverable.id, url)
                      .then(() => setUrlInput(''))
                      .finally(() => setSubmittingUrl(false));
                  }}
                  className="p-1 rounded bg-brand-navy text-white hover:bg-brand-navy-light disabled:opacity-40 transition-colors flex-shrink-0"
                >
                  {submittingUrl ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer: due date + revisions */}
        <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{submittedDate || 'No date'}</span>
          </div>
          {deliverable.revisionCount > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{deliverable.revisionCount} revision{deliverable.revisionCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
