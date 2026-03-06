'use client';

import { useState } from 'react';
import { Copy, Check, Building2 } from 'lucide-react';
import { HEYCREATOR_BANKING_DETAILS } from '@/types/subscription';

interface EFTBankingDetailsProps {
  referenceNumber: string;
}

interface DetailRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function DetailRow({ label, value, mono = false }: DetailRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — graceful fallback
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm text-gray-900 font-semibold ${
            mono ? 'font-mono tracking-wider' : ''
          }`}
        >
          {value}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          copied
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
        }`}
        title={`Copy ${label}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            Copy
          </>
        )}
      </button>
    </div>
  );
}

export default function EFTBankingDetails({ referenceNumber }: EFTBankingDetailsProps) {
  const details = HEYCREATOR_BANKING_DETAILS;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-brand-navy/5 border-b border-gray-200">
        <div className="w-9 h-9 rounded-lg bg-brand-navy flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">Banking Details</h3>
          <p className="text-xs text-gray-500">
            Use these details to complete your EFT payment
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-gray-50 px-5 py-1">
        <DetailRow label="Bank" value={details.bankName} />
        <DetailRow label="Account Name" value={details.accountName} />
        <DetailRow label="Account Number" value={details.accountNumber} mono />
        <DetailRow label="Branch Code" value={details.branchCode} mono />
        <DetailRow label="Branch" value={details.branchName} />
        <DetailRow label="Account Type" value={details.accountType} />
        <DetailRow label="SWIFT Code" value={details.swiftCode} mono />
      </div>

      {/* Reference Number — highlighted */}
      <div className="p-4 bg-amber-50 border-t border-amber-200">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
          Your Unique Payment Reference
        </p>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xl font-mono font-bold text-amber-900 tracking-widest">
            {referenceNumber}
          </p>
          <CopyReferenceButton value={referenceNumber} />
        </div>
        <p className="text-xs text-amber-700 mt-2">
          You MUST include this reference number in your EFT payment. Payments without a
          reference may be delayed by up to 5 business days.
        </p>
      </div>
    </div>
  );
}

function CopyReferenceButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
        copied
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy
        </>
      )}
    </button>
  );
}
