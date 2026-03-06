"use client";

import React from "react";
import { 
  X, 
  Check, 
  MessageSquare, 
  ChevronRight, 
  Instagram 
} from "lucide-react";

// Note: Using a simple div for TikTok as Lucide doesn't always have the brand icon 
// in standard sets, or you can use a custom SVG.
const TikTokIcon = () => (
  <svg 
    width="12" 
    height="12" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface ApplicationRowProps {
  application: any;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onChat?: (id: string) => void;
  onViewProfile?: (id: string) => void;
}

export default function ApplicationRow({
  application,
  onApprove,
  onDecline,
  onChat,
  onViewProfile,
}: ApplicationRowProps) {
  const [avatarError, setAvatarError] = React.useState(false);

  return (
    <div className="grid grid-cols-12 items-center border-b border-gray-100 py-4 hover:bg-gray-50/50 transition-colors">
      
      {/* PROFILE COLUMN */}
      <div className="col-span-1 flex justify-center border-r border-gray-100">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            {application.influencer.image && !avatarError ? (
              <img
                src={application.influencer.image}
                alt={application.influencer.name}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                {application.influencer.name.charAt(0)}
              </div>
            )}
          </div>
          {/* Verified Badge */}
          <div className="absolute bottom-0 -right-0.5 w-4 h-4 bg-[#4A90E2] rounded-full border-2 border-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
          </div>
        </div>
      </div>

      {/* INFLUENCER COLUMN */}
      <div className="col-span-3 px-6 border-r border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 tracking-tight">
          {application.influencer.name}
        </h4>
        <div className="flex gap-3 mt-1">
          <span className="flex items-center text-[11px] text-blue-500 font-semibold">
            <Instagram className="w-3 h-3 mr-1" />
            {application.influencer.igFollowers || "15.3K"}
          </span>
          <span className="flex items-center text-[11px] text-blue-400 font-semibold">
            <TikTokIcon />
            <span className="ml-1">{application.influencer.ttFollowers || "8.2K"}</span>
          </span>
        </div>
      </div>

      {/* OFFER COLUMN */}
      <div className="col-span-2 px-6 border-r border-gray-100">
        <span className="text-[#4ADE80] font-bold text-lg">
          R{application.offerAmount?.toLocaleString() || "0"}
        </span>
      </div>

      {/* COMMENTS COLUMN */}
      <div className="col-span-3 px-6 border-r border-gray-100">
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 italic">
          {application.comment || "my latest comment goes here"}
        </p>
      </div>

      {/* ACTIONS COLUMN */}
      <div className="col-span-3 px-6 flex justify-end items-center gap-2">
        {/* Decline */}
        <button
          onClick={() => onDecline(application.id)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all"
          title="Decline Application"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Approve */}
        <button
          onClick={() => onApprove(application.id)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-green-100 text-green-500 hover:bg-green-50 transition-all"
          title="Approve Application"
        >
          <Check className="w-5 h-5" />
        </button>

        {/* Chat */}
        <button
          onClick={() => onChat?.(application.id)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* View Detail */}
        <button
          onClick={() => onViewProfile?.(application.id)}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}