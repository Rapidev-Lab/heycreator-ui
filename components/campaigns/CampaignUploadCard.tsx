"use client";

import React from 'react';
import { FileText, Image as ImageIcon, Plus } from 'lucide-react';

interface CampaignUploadCardProps {
  label?: string;
  title: string;
  subtext: string;
  iconType: 'plus' | 'document' | 'image';
  onClick: () => void;
  error?: string;
  className?: string;
}

export default function CampaignUploadCard({
  label,
  title,
  subtext,
  iconType,
  onClick,
  error,
  className = ""
}: CampaignUploadCardProps) {
  const renderIcon = () => {
    switch (iconType) {
      case 'plus':
        return <Plus className="w-6 h-6 text-gray-500" />;
      case 'image':
        return <ImageIcon className="w-14 h-10 text-gray-500" />;
      case 'document':
        return <FileText className="w-10 h-10 text-gray-500" />;
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-brand-navy-dark mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={onClick}
        className={`
          w-full flex flex-col items-center justify-center p-10
          border border-gray-200 rounded-2xl transition-all duration-200
          bg-white hover:bg-gray-50
          ${error ? 'border-red-500 ring-1 ring-red-500' : ''}
          min-h-[220px]
        `}
      >
        <div className="mb-4 flex items-center justify-center">
          {/* Circular border for the plus icon specifically */}
          {iconType === 'plus' ? (
            <div className="p-2 border-2 border-gray-500 rounded-full">
              {renderIcon()}
            </div>
          ) : (
            renderIcon()
          )}
        </div>
        
        <h4 className="text-brand-navy-dark font-semibold text-lg mb-1">
          {title}
        </h4>
        
        <p className="text-gray-400 text-sm">
          {subtext}
        </p>
      </button>
    </div>
  );
}