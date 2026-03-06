"use client";

import { AlertTriangle, X } from "lucide-react";

interface PublishConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignTitle: string;
}

export default function PublishConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  campaignTitle,
}: PublishConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-navy/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-brand-navy" />
            </div>
            <h3 className="text-lg font-semibold text-brand-navy">
              Publish Campaign?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Once published, <span className="font-medium">{campaignTitle}</span>{" "}
          will be live and creators can start applying. You can edit campaign
          details anytime from your dashboard.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-semibold hover:bg-brand-navy-light transition-colors"
          >
            Publish Now
          </button>
        </div>
      </div>
    </div>
  );
}
