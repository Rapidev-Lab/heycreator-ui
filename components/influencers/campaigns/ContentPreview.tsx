'use client';

import { useState, useEffect } from 'react';
import { Link as LinkIcon, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaItem {
  url: string;
  isVideo: boolean;
}

interface ContentPreviewProps {
  platform: string;
  contentType: string;
  caption: string;
  creatorName: string;
  creatorAvatar: string | null;
  thumbnailUrls: string[];
  mediaItems?: MediaItem[];
}

export default function ContentPreview({
  platform,
  contentType,
  caption,
  creatorName,
  creatorAvatar,
  thumbnailUrls,
  mediaItems,
}: ContentPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isEmpty = thumbnailUrls.length === 0 && !caption;
  const isVideoContentType = ['Reel', 'Story', 'Video', 'Short'].includes(contentType);
  const hasMultiple = thumbnailUrls.length > 1;

  // Reset index when thumbnails change
  useEffect(() => {
    setCurrentIndex(0);
  }, [thumbnailUrls.length]);

  // Keep index in bounds
  const safeIndex = Math.min(currentIndex, Math.max(0, thumbnailUrls.length - 1));
  const currentUrl = thumbnailUrls[safeIndex] || null;

  const initials = creatorName
    ? creatorName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => Math.min(prev + 1, thumbnailUrls.length - 1));
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg border border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <LinkIcon className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 font-medium">Add Content to Load Preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[400px] bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Thumbnail / Image area */}
      <div className="relative flex-1 bg-gray-900 flex items-center justify-center min-h-[250px]">
        {currentUrl ? (
          <>
            {(mediaItems?.[safeIndex]?.isVideo || (!mediaItems && isVideoContentType && currentUrl.match(/\.(mp4|mov|webm|avi|mkv)(\?|$)/i))) ? (
              <video
                src={currentUrl}
                controls
                className="w-full h-full object-contain bg-black"
                preload="metadata"
              />
            ) : (
              <>
                <img
                  src={currentUrl}
                  alt={`Content preview ${safeIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {isVideoContentType && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center">
                      <Play className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-sm">No preview available</div>
        )}

        {/* Platform badge */}
        {platform && (
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 rounded text-xs font-medium text-gray-700">
            {platform}
          </span>
        )}

        {/* Carousel navigation arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              disabled={safeIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={goNext}
              disabled={safeIndex === thumbnailUrls.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {thumbnailUrls.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === safeIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Creator info + Caption */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{creatorName}</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
              Sponsored
            </span>
          </div>
        </div>

        {caption && (
          <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">{caption}</p>
        )}

        {/* Image counter */}
        {hasMultiple && (
          <p className="text-[10px] text-gray-400 mt-2">
            {safeIndex + 1} of {thumbnailUrls.length}
          </p>
        )}
      </div>
    </div>
  );
}
