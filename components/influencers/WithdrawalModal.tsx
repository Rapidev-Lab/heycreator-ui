'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader } from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  campaignTitle: string;
  isLoading?: boolean;
}

export default function WithdrawalModal({
  isOpen,
  onClose,
  onConfirm,
  campaignTitle,
  isLoading = false,
}: WithdrawalModalProps) {
  const [reason, setReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onConfirm(showReasonField && reason ? reason : undefined);
      // Reset state after successful submission
      setReason('');
      setShowReasonField(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Withdrawal error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting && !isLoading) {
      setReason('');
      setShowReasonField(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={submitting || isLoading}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Withdraw Application?
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center mb-4">
            Are you sure you want to withdraw your application for{' '}
            <span className="font-medium text-gray-900">{campaignTitle}</span>?
            This action cannot be undone.
          </p>

          {/* Optional reason */}
          <div className="mb-6">
            <button
              onClick={() => setShowReasonField(!showReasonField)}
              className="text-sm text-brand-navy hover:text-brand-navy-light font-medium mb-2 transition-colors"
              disabled={submitting || isLoading}
              type="button"
            >
              {showReasonField ? '− Hide reason (optional)' : '+ Add reason (optional)'}
            </button>

            {showReasonField && (
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you withdrawing? (This will help us improve)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-navy focus:border-transparent resize-none text-sm"
                rows={3}
                disabled={submitting || isLoading}
                maxLength={500}
              />
            )}
            {showReasonField && reason && (
              <p className="text-xs text-gray-500 mt-1 text-right">
                {reason.length}/500
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting || isLoading}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              disabled={submitting || isLoading}
              type="button"
            >
              {submitting || isLoading ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Withdrawing...
                </>
              ) : (
                'Withdraw Application'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
