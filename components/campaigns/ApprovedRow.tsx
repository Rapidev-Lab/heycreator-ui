"use client";

import React from "react";
import { MessageSquare, ChevronRight, Instagram, HelpCircle } from "lucide-react";

const TikTokIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface ApprovedRowProps {
  data: any;
  onChat?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function ApprovedRow({ data, onChat, onViewDetails }: ApprovedRowProps) {
  // Calculate progress percentage
  const progressPercent = data.totalDeliverables > 0 
    ? (data.completedDeliverables / data.totalDeliverables) * 100 
    : 0;

  return (
    <div className="grid grid-cols-12 items-center border-b border-gray-100 py-5 hover:bg-gray-50/50 transition-colors">
      
      {/* PROFILE */}
      <div className="col-span-1 flex justify-center border-r border-gray-100">
        <div className="relative">
          <img src={data.influencer.image} alt="" className="w-12 h-12 rounded-full object-cover bg-gray-100" />
          <div className="absolute bottom-0 -right-0.5 w-4 h-4 bg-[#4A90E2] rounded-full border-2 border-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
          </div>
        </div>
      </div>

      {/* INFLUENCER */}
      <div className="col-span-3 px-6 border-r border-gray-100">
        <h4 className="text-sm font-bold text-brand-navy">{data.influencer.name}</h4>
        <div className="flex gap-3 mt-1">
          <span className="flex items-center text-[11px] text-blue-500 font-semibold">
            <Instagram className="w-3 h-3 mr-1" /> {data.influencer.igFollowers}
          </span>
          <span className="flex items-center text-[11px] text-blue-400 font-semibold">
            <TikTokIcon /> <span className="ml-1">{data.influencer.ttFollowers}</span>
          </span>
        </div>
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="col-span-4 px-6 border-r border-gray-100 flex items-center justify-between">
        <div className="text-center">
          <div className="text-[15px] font-bold text-brand-navy">{data.performance.reach}</div>
          <div className="text-[9px] text-gray-400 font-black uppercase tracking-wider flex items-center justify-center gap-1">
            Total Reach <HelpCircle className="w-2.5 h-2.5" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-[15px] font-bold text-brand-navy">{data.performance.engagement}</div>
          <div className="text-[9px] text-gray-400 font-black uppercase tracking-wider">Engagement Rate</div>
        </div>
        <div className="text-center">
          <div className="text-[15px] font-bold text-brand-navy">{data.performance.trueReach}</div>
          <div className="text-[9px] text-gray-400 font-black uppercase tracking-wider">True Reach</div>
        </div>
      </div>

      {/* TASK PROGRESS */}
      <div className="col-span-3 px-6 border-r border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[11px] font-bold text-brand-navy-dark">
            Deliverables {data.completedDeliverables}/{data.totalDeliverables} Approved
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-navy-dark rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="col-span-1 px-4 flex justify-end gap-2">
        <button onClick={() => onChat?.(data.id)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all">
          <MessageSquare className="w-5 h-5" />
        </button>
        <button onClick={() => onViewDetails?.(data.id)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}