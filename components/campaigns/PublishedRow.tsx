"use client";

import React from "react";
import { MessageSquare, Instagram, HelpCircle, CheckCircle2, Music2 } from "lucide-react";

interface PublishedRowData {
  id: string;
  completedDeliverables: number;
  totalDeliverables: number;
  performance: {
    reach: string;
    engagement: string;
    trueReach: string;
  };
  influencer: {
    name: string;
    image: string;
    igFollowers: string;
    ttFollowers: string;
  };
}

interface PublishedRowProps {
  data: PublishedRowData;
  onChat?: (id: string) => void;
  onViewTasks?: (id: string) => void;
}

export default function PublishedRow({ data, onChat, onViewTasks }: PublishedRowProps) {
  const progressPercent = data.totalDeliverables > 0 
    ? (data.completedDeliverables / data.totalDeliverables) * 100 
    : 0;

  return (
    <div className="grid grid-cols-12 items-center border-b border-gray-100 py-5 hover:bg-gray-50/50 transition-colors">
      
      {/* PROFILE - Span 1 */}
      <div className="col-span-1 flex justify-center border-r border-gray-100">
        <div className="relative">
          <img 
            src={data.influencer.image} 
            alt="" 
            className="w-12 h-12 rounded-full object-cover bg-gray-100" 
          />
          <div className="absolute bottom-0 -right-0.5 w-4 h-4 bg-[#4A90E2] rounded-full border-2 border-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
          </div>
        </div>
      </div>

      {/* INFLUENCER - Reduced to Span 2 for the left-shift effect */}
      <div className="col-span-2 px-6 border-r border-gray-100">
        <h4 className="text-sm font-bold text-brand-navy tracking-tight whitespace-nowrap">
          {data.influencer.name}
        </h4>
        <div className="flex gap-2 mt-1">
          <span className="flex items-center text-[10px] text-blue-500 font-semibold">
            <Instagram className="w-3 h-3 mr-1" /> {data.influencer.igFollowers}
          </span>
          <span className="flex items-center text-[10px] text-blue-400 font-semibold italic">
            <Music2 className="w-3 h-3 mr-1" /> {data.influencer.ttFollowers}
          </span>
        </div>
      </div>

      {/* PERFORMANCE - Span 4 */}
      <div className="col-span-4 px-6 border-r border-gray-100 flex items-center justify-start gap-12">
        <div className="text-left">
          <div className="text-[15px] font-bold text-brand-navy">{data.performance.reach}</div>
          <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1">
            Total Reach <HelpCircle className="w-2.5 h-2.5" />
          </div>
        </div>
        <div className="text-left">
          <div className="text-[15px] font-bold text-brand-navy">{data.performance.engagement}</div>
          <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
            Engagement Rate
          </div>
        </div>
      </div>

      {/* TASK PROGRESS - Span 3 */}
      <div className="col-span-3 px-6 border-r border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
          <span className="text-[11px] font-bold text-brand-navy-dark">
            Deliverables {data.completedDeliverables}/{data.totalDeliverables} Completed
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#4ADE80] rounded-full transition-all duration-700" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ACTIONS - Span 2 */}
      <div className="col-span-2 px-4 flex justify-end items-center gap-3">
        <button 
          onClick={() => onChat?.(data.id)} 
          className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onViewTasks?.(data.id)}
          className="px-4 py-2 text-[11px] font-bold border border-gray-200 rounded-xl text-brand-navy hover:bg-gray-50 whitespace-nowrap shadow-sm transition-all"
        >
          View tasks
        </button>
      </div>
    </div>
  );
}
