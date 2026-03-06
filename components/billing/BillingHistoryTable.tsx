'use client';

import { Receipt } from 'lucide-react';
import InvoiceRow from './InvoiceRow';
import type { Invoice } from '@/types/subscription';
import type { SupportedCurrency } from '@/types/workspace';

interface BillingHistoryTableProps {
  invoices: Invoice[];
  currency?: SupportedCurrency;
}

export default function BillingHistoryTable({
  invoices,
  currency = 'ZAR',
}: BillingHistoryTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">No invoices yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Your billing history will appear here after your first payment
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      {/* Table Header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 min-w-[600px]">
        <div className="flex-shrink-0 w-36">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Invoice
          </span>
        </div>
        <div className="flex-1 hidden sm:block">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Date
          </span>
        </div>
        <div className="flex-shrink-0 w-28 text-right hidden md:block">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Amount
          </span>
        </div>
        <div className="flex-shrink-0 w-20">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Status
          </span>
        </div>
        <div className="flex-shrink-0 w-24 hidden lg:block">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Method
          </span>
        </div>
        <div className="flex-shrink-0 w-16">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Action
          </span>
        </div>
      </div>

      {/* Invoice Rows */}
      <div className="bg-white divide-y divide-gray-50 min-w-[600px]">
        {invoices.map((invoice) => (
          <InvoiceRow key={invoice.id} invoice={invoice} currency={currency} />
        ))}
      </div>
    </div>
  );
}
