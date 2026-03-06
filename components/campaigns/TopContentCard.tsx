"use client";

import React from "react";
import { Heart, MessageCircle, Eye, TrendingUp, Instagram, Facebook, Play, ExternalLink } from "lucide-react";

const platformHeaderIcons = {
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  facebook: <Facebook className="w-4 h-4 text-blue-600" />,
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.14 1.01.23 2.1 1.01 2.73.73.61 1.74.87 2.69.66 1.13-.25 2.11-1.09 2.51-2.17.1-.28.15-.58.15-.88.02-3.38.01-6.75.02-10.13z" />
    </svg>
  ),
};

function formatTimeAgo(dateStr: string | undefined): string {
  if (!dateStr) return "Recently";
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function TopContentCard({ content, index }: { content: any; index: number }) {
  // Use actual thumbnail if available, otherwise fall back to dummy image
  const postImage = content.thumbnailUrl || `https://picsum.photos/seed/${index + 40}/600/600`;
  const timeAgo = formatTimeAgo(content.submittedAt);
  const likes = content.likes || 0;
  const comments = content.comments || 0;
  const reach = content.reach || 0;
  const engagementRate = content.engagementRate || 0;

  const handleViewContent = () => {
    if (content.contentUrl) {
      window.open(content.contentUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-w-[300px] max-w-[300px] bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
      {/* Header: Keeps the actual Influencer Profile Image */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={content.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(content.influencerName || "Creator")}&background=001F54&color=fff`}
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
            alt={content.influencerName}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(content.influencerName || "Creator")}&background=001F54&color=fff`;
            }}
          />
          <div>
            <h4 className="text-sm font-bold text-brand-navy">{content.influencerName}</h4>
            <p className="text-[10px] text-gray-400 font-medium">{timeAgo}</p>
          </div>
        </div>
        <div className="p-1.5 bg-gray-50 rounded-lg">
          {platformHeaderIcons[content.platform?.toLowerCase() as keyof typeof platformHeaderIcons] || platformHeaderIcons.instagram}
        </div>
      </div>

      {/* Caption Section */}
      <div className="px-4 pb-4">
        <p className="text-[13px] text-gray-600 line-clamp-2 leading-snug">
          {content.caption || "Content delivered for campaign"}
        </p>
        {content.contentUrl && (
          <button
            onClick={handleViewContent}
            className="text-[13px] text-blue-500 font-medium mt-1 flex items-center gap-1 hover:underline"
          >
            View content <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Main Post Media */}
      <div
        className={`relative aspect-square w-full bg-gray-50 ${content.contentUrl ? "cursor-pointer group" : ""}`}
        onClick={content.contentUrl ? handleViewContent : undefined}
      >
        <img
          src={postImage}
          className="w-full h-full object-cover"
          alt="Post content"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${index + 40}/600/600`;
          }}
        />
        {content.contentType === "Video" && (
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm p-1.5 rounded-full">
            <Play className="w-4 h-4 text-white fill-white" />
          </div>
        )}
        {content.contentUrl && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <ExternalLink className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Interaction Footer */}
      <div className="px-4 py-3 grid grid-cols-4 gap-2 border-t border-gray-50 bg-white">
        <div className="flex flex-col items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] font-bold text-gray-500">{formatNumber(likes)}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] font-bold text-gray-500">{formatNumber(comments)}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] font-bold text-gray-500">{formatNumber(reach)}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] font-bold text-gray-500">{engagementRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}