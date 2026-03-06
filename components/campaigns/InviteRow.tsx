"use client";

import { useState } from "react";
import { Trash2, MessageSquare, ChevronRight, Instagram, Music2 } from "lucide-react";
import { InfluencerBid } from "@/types/influencer-bid";

interface InviteRowProps {
  bid: InfluencerBid;
  onDelete?: (id: string) => void;
  onMessage?: (id: string) => void;
  onView?: (id: string) => void;
}

function formatFollowers(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  if (num > 0) return num.toString();
  return "—";
}

const statusStyles: Record<string, string> = {
  sent: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  invited: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function InviteRow({ bid, onDelete, onMessage, onView }: InviteRowProps) {
  const [avatarError, setAvatarError] = useState(false);

  const initials = bid.influencerName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const igFollowers = bid.socialStats?.find((s) => s.platform === "instagram")?.followers || 0;
  const ttFollowers = bid.socialStats?.find((s) => s.platform === "tiktok")?.followers || 0;
  const hasStats = igFollowers > 0 || ttFollowers > 0;

  const statusLabel = bid.status.charAt(0).toUpperCase() + bid.status.slice(1);
  const statusClass = statusStyles[bid.status] || "bg-gray-100 text-gray-600";

  return (
    <div className="grid grid-cols-12 items-center hover:bg-gray-50/50 transition-colors group border-b border-gray-100 last:border-0 min-w-[800px]">

      {/* 1. PROFILE (Avatar) - col-span-1 */}
      <div className="col-span-1 flex justify-center py-4 border-r border-gray-100">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            {avatarError || !bid.avatar ? (
              <div className="w-full h-full bg-brand-navy-dark flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{initials}</span>
              </div>
            ) : (
              <img
                src={bid.avatar}
                alt={bid.influencerName}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            )}
          </div>
          <div className="absolute bottom-0 -right-0.5 w-4 h-4 bg-[#4A90E2] rounded-full border-2 border-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. INFLUENCER - col-span-3 */}
      <div className="col-span-3 px-6 py-4 border-r border-gray-100 h-full flex flex-col justify-center overflow-hidden">
        <h4 className="font-bold text-[#111827] text-[14px] leading-tight mb-1 truncate" title={bid.influencerName}>
          {bid.influencerName}
        </h4>
        {hasStats ? (
          <div className="flex items-center gap-3">
            {igFollowers > 0 && (
              <div className="flex items-center gap-1">
                <Instagram className="w-3 h-3 text-[#4A90E2]" />
                <span className="text-[11px] font-bold text-[#4A90E2]">{formatFollowers(igFollowers)}</span>
              </div>
            )}
            {ttFollowers > 0 && (
              <div className="flex items-center gap-1">
                <Music2 className="w-3 h-3 text-[#4A90E2]" />
                <span className="text-[11px] font-bold text-[#4A90E2]">{formatFollowers(ttFollowers)}</span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-[11px] text-gray-400">No social data yet</span>
        )}
      </div>

      {/* 3. STATUS - col-span-2 */}
      <div className="col-span-2 px-6 py-4 border-r border-gray-100 h-full flex items-center">
        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* 4. OFFER - col-span-3 */}
      <div className="col-span-3 px-8 py-4 border-r border-gray-100 h-full flex items-center">
        {bid.bidAmount > 0 ? (
          <span className="text-[15px] font-bold text-[#4CAF50]">
            R{bid.bidAmount.toLocaleString()}
          </span>
        ) : (
          <span className="text-[13px] text-gray-400">—</span>
        )}
      </div>

      {/* 5. ACTIONS - col-span-3 */}
      <div className="col-span-3 px-6 py-4 flex justify-end items-center gap-2">
        {onDelete && (
          <button
            onClick={() => onDelete(bid.id)}
            className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-100 rounded-lg transition-all shadow-sm active:scale-95"
            title="Remove invitation"
          >
            <Trash2 className="w-5 h-5 stroke-[1.5]" />
          </button>
        )}
        {onMessage && (
          <button
            onClick={() => onMessage(bid.id)}
            className="p-2 text-gray-400 hover:text-blue-500 bg-white border border-gray-100 rounded-lg transition-all shadow-sm active:scale-95"
            title="Send message"
          >
            <MessageSquare className="w-5 h-5 stroke-[1.5]" />
          </button>
        )}
        {onView && (
          <button
            onClick={() => onView(bid.id)}
            className="p-2 text-gray-400 hover:text-black bg-white border border-gray-100 rounded-lg transition-all shadow-sm active:scale-95"
            title="View details"
          >
            <ChevronRight className="w-5 h-5 stroke-[1.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
