'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, ImageIcon, AlertCircle } from 'lucide-react';

interface ProofOfPaymentUploadProps {
  onSubmit: (data: { file: File; reference: string; amount: number }) => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ type }: { type: string }) {
  if (type === 'application/pdf') {
    return <FileText className="w-6 h-6 text-red-500" />;
  }
  return <ImageIcon className="w-6 h-6 text-blue-500" />;
}

export default function ProofOfPaymentUpload({
  onSubmit,
  isLoading = false,
}: ProofOfPaymentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [reference, setReference] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setFileError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('Only PDF, JPG, and PNG files are accepted');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`File size must be under ${MAX_SIZE_MB}MB (your file is ${formatFileSize(file.size)})`);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!selectedFile) errors.file = 'Please upload your proof of payment';
    if (!reference.trim()) errors.reference = 'Reference number is required';
    const amount = parseFloat(amountStr);
    if (!amountStr || isNaN(amount) || amount <= 0) {
      errors.amount = 'Please enter the amount you paid';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    onSubmit({ file: selectedFile!, reference: reference.trim(), amount });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Drop Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Proof of Payment
        </label>

        {!selectedFile ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${
                isDragging
                  ? 'border-brand-navy bg-brand-navy/5 scale-[1.01]'
                  : fileError
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 hover:border-brand-navy/50 hover:bg-gray-50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDragging ? 'bg-brand-navy' : 'bg-gray-100'
                }`}
              >
                <Upload
                  className={`w-6 h-6 ${isDragging ? 'text-white' : 'text-gray-400'}`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {isDragging ? 'Drop your file here' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, or PNG — max {MAX_SIZE_MB}MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <FileIcon type={selectedFile.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {fileError && (
          <div className="mt-2 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-xs">{fileError}</p>
          </div>
        )}
        {formErrors.file && !selectedFile && !fileError && (
          <p className="mt-1 text-xs text-red-500">{formErrors.file}</p>
        )}
      </div>

      {/* Reference Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Payment Reference Number
        </label>
        <input
          type="text"
          placeholder="e.g. HC-NIKESA-MAR26"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm font-mono outline-none transition-all ${
            formErrors.reference
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
              : 'border-gray-300 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy'
          }`}
        />
        {formErrors.reference && (
          <p className="mt-1 text-xs text-red-500">{formErrors.reference}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          This must match the unique reference number provided in the banking details above
        </p>
      </div>

      {/* Amount Paid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Amount Paid (ZAR)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm font-semibold text-gray-400">R</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            className={`w-full pl-7 pr-3 py-2.5 border rounded-lg text-sm outline-none transition-all ${
              formErrors.amount
                ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy'
            }`}
          />
        </div>
        {formErrors.amount && (
          <p className="mt-1 text-xs text-red-500">{formErrors.amount}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Submit Proof of Payment
          </>
        )}
      </button>
    </form>
  );
}
