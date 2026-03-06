"use client";

import { useState } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";

interface ShareCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
}

export default function ShareCampaignModal({ isOpen, onClose, shareLink }: ShareCampaignModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-navy-dark/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-brand-navy-dark">Share invitation link</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Copy this link to invite creators to view and apply to your campaign directly.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 overflow-hidden">
              <p className="text-sm text-gray-500 truncate font-medium">
                {shareLink}
              </p>
            </div>
            
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 p-3.5 rounded-xl transition-all border ${
                copied 
                ? "bg-green-50 border-green-200 text-green-600" 
                : "bg-white border-gray-200 text-brand-navy-dark hover:border-brand-navy-dark hover:bg-gray-50"
              }`}
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-brand-navy-dark text-white rounded-lg text-sm font-bold hover:bg-brand-navy transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}