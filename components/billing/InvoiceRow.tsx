'use client';

import { Download, CreditCard, Building2 } from 'lucide-react';
import type { Invoice } from '@/types/subscription';
import type { SupportedCurrency } from '@/types/workspace';

interface InvoiceRowProps {
  invoice: Invoice;
  currency?: SupportedCurrency;
}

const STATUS_CONFIG = {
  paid: {
    label: 'Paid',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  void: {
    label: 'Void',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

function formatAmount(amount: number, currency: SupportedCurrency = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
  return `${symbol}${amount.toLocaleString('en-ZA')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function InvoiceRow({ invoice, currency = 'ZAR' }: InvoiceRowProps) {
  const statusConfig = STATUS_CONFIG[invoice.status];

  const handleDownload = () => {
    // Mock: open PDF URL or show placeholder
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else {
      alert(`Invoice ${invoice.invoiceNumber} — PDF not yet available`);
    }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors">
      {/* Invoice Number */}
      <div className="flex-shrink-0 w-36">
        <p className="text-sm font-semibold text-gray-900 font-mono">
          {invoice.invoiceNumber}
        </p>
      </div>

      {/* Date */}
      <div className="flex-1 min-w-0 hidden sm:block">
        <p className="text-sm text-gray-600">{formatDate(invoice.issuedAt)}</p>
        {invoice.paidAt && (
          <p className="text-xs text-gray-400">Paid {formatDate(invoice.paidAt)}</p>
        )}
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 w-28 text-right hidden md:block">
        <p className="text-sm font-semibold text-gray-900">
          {formatAmount(invoice.total, currency)}
        </p>
        {invoice.tax > 0 && (
          <p className="text-xs text-gray-400">
            incl. VAT {formatAmount(invoice.tax, currency)}
          </p>
        )}
      </div>

      {/* Status Badge */}
      <div className="flex-shrink-0 w-20">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Payment Method */}
      <div className="flex-shrink-0 hidden lg:flex items-center gap-1.5 w-24">
        {invoice.paymentMethodType === 'credit_card' ? (
          <>
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">
              {invoice.paymentMethodLast4 ? `••${invoice.paymentMethodLast4}` : 'Card'}
            </span>
          </>
        ) : invoice.paymentMethodType === 'eft' ? (
          <>
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">EFT</span>
          </>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>

      {/* Download Action */}
      <div className="flex-shrink-0">
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title={`Download ${invoice.invoiceNumber}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PDF</span>
        </button>
      </div>
    </div>
  );
}
