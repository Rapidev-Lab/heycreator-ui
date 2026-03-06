'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Printer, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import type { Invoice } from '@/types/subscription';

// ===== MOCK INVOICE DATA =====

const MOCK_INVOICES: Record<string, Invoice> = {
  'inv-001': {
    id: 'inv-001',
    workspaceId: 'ws-nikesa-001',
    subscriptionId: 'sub-001',
    invoiceNumber: 'INV-2026-003',
    status: 'paid',
    currency: 'ZAR',
    subtotal: 30435,
    tax: 4565,
    total: 35000,
    amountPaid: 35000,
    lineItems: [
      {
        description: 'HeyCreator Growth Plan — March 2026',
        quantity: 1,
        unitPrice: 30435,
        total: 30435,
      },
      {
        description: '3 Team seats included',
        quantity: 3,
        unitPrice: 0,
        total: 0,
      },
    ],
    issuedAt: '2026-03-01T00:00:00Z',
    dueDate: '2026-03-07T00:00:00Z',
    paidAt: '2026-03-03T10:30:00Z',
    paymentMethodType: 'credit_card',
    paymentMethodLast4: '4242',
    createdAt: '2026-03-01T00:00:00Z',
  },
  'inv-002': {
    id: 'inv-002',
    workspaceId: 'ws-nikesa-001',
    subscriptionId: 'sub-001',
    invoiceNumber: 'INV-2026-002',
    status: 'paid',
    currency: 'ZAR',
    subtotal: 30435,
    tax: 4565,
    total: 35000,
    amountPaid: 35000,
    lineItems: [
      {
        description: 'HeyCreator Growth Plan — February 2026',
        quantity: 1,
        unitPrice: 30435,
        total: 30435,
      },
    ],
    issuedAt: '2026-02-01T00:00:00Z',
    dueDate: '2026-02-07T00:00:00Z',
    paidAt: '2026-02-02T09:15:00Z',
    paymentMethodType: 'eft',
    createdAt: '2026-02-01T00:00:00Z',
  },
};

// ===== HELPERS =====

function formatDate(iso: string, long = false): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: long ? 'long' : 'short',
    year: 'numeric',
  });
}

function formatAmount(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ===== STATUS BADGE =====

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const config = {
    paid: {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Paid',
      className: 'bg-green-100 text-green-700 border-green-200',
    },
    pending: {
      icon: <Clock className="w-4 h-4" />,
      label: 'Pending',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    failed: {
      icon: <XCircle className="w-4 h-4" />,
      label: 'Payment Failed',
      className: 'bg-red-100 text-red-700 border-red-200',
    },
    refunded: {
      icon: <AlertCircle className="w-4 h-4" />,
      label: 'Refunded',
      className: 'bg-gray-100 text-gray-600 border-gray-200',
    },
    void: {
      icon: <XCircle className="w-4 h-4" />,
      label: 'Void',
      className: 'bg-gray-100 text-gray-500 border-gray-200',
    },
  };

  const s = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${s.className}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

// ===== INVOICE NOT FOUND =====

function NotFound() {
  const router = useRouter();
  return (
    <div className="p-6 lg:p-8 text-center py-20">
      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-gray-900 mb-2">Invoice Not Found</h2>
      <p className="text-sm text-gray-500 mb-6">
        This invoice does not exist or you don&apos;t have permission to view it.
      </p>
      <button
        onClick={() => router.push('/brands/workspace/billing')}
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Billing
      </button>
    </div>
  );
}

// ===== INVOICE DETAIL PAGE =====

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  // Try to find by ID or invoice number
  const invoice =
    MOCK_INVOICES[id] ||
    Object.values(MOCK_INVOICES).find((inv) => inv.invoiceNumber === id.toUpperCase()) ||
    null;

  if (!invoice) return <NotFound />;

  const handlePrint = () => window.print();
  const handleDownload = () => {
    // Mock: in production this would download a real PDF
    alert(`Downloading ${invoice.invoiceNumber}.pdf (mock — PDF generation not yet connected)`);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Back (hidden in print) */}
      <div className="print:hidden mb-6">
        <button
          onClick={() => router.push('/brands/workspace/billing')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Billing
        </button>
      </div>

      {/* Invoice Document */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-8 bg-brand-navy">
          {/* Branding */}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">HeyCreator</h1>
            <p className="text-sm text-white/70 mt-1">Influencer Discovery Platform</p>
            <div className="mt-3 space-y-0.5">
              <p className="text-xs text-white/60">HeyCreator (Pty) Ltd</p>
              <p className="text-xs text-white/60">Sandton, Johannesburg, South Africa</p>
              <p className="text-xs text-white/60">VAT Reg: 4810293847</p>
            </div>
          </div>

          {/* Invoice meta */}
          <div className="text-right">
            <p className="text-3xl font-black text-white tracking-tight">INVOICE</p>
            <p className="text-sm font-mono text-white/80 mt-1">{invoice.invoiceNumber}</p>
            <div className="mt-3">
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Invoice Details Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-b border-gray-200">
          {[
            { label: 'Issue Date', value: formatDate(invoice.issuedAt, true) },
            { label: 'Due Date', value: formatDate(invoice.dueDate, true) },
            {
              label: 'Paid Date',
              value: invoice.paidAt ? formatDate(invoice.paidAt, true) : '—',
            },
            {
              label: 'Payment Method',
              value:
                invoice.paymentMethodType === 'credit_card'
                  ? `Visa ••${invoice.paymentMethodLast4}`
                  : invoice.paymentMethodType === 'eft'
                  ? 'EFT Transfer'
                  : '—',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="px-5 py-4 border-r border-gray-200 last:border-r-0"
            >
              <p className="text-xs text-gray-400 uppercase tracking-wide">{item.label}</p>
              <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-8 py-6 border-b border-gray-200">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Bill To
            </p>
            <p className="text-sm font-bold text-gray-900">Nikesa SA Workspace</p>
            <p className="text-sm text-gray-600">Demo Brand (Pty) Ltd</p>
            <p className="text-sm text-gray-500">Johannesburg, South Africa</p>
            <p className="text-sm text-gray-500">admin@nikesa.co.za</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              From
            </p>
            <p className="text-sm font-bold text-gray-900">HeyCreator (Pty) Ltd</p>
            <p className="text-sm text-gray-500">Sandton City, Johannesburg</p>
            <p className="text-sm text-gray-500">billing@heycreator.com</p>
            <p className="text-sm text-gray-500">+27 11 000 0000</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-8 py-6">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 w-1/2">
                  Description
                </th>
                <th className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3">
                  Qty
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3">
                  Unit Price
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 text-sm text-gray-700">{item.description}</td>
                  <td className="py-4 text-sm text-gray-600 text-center">{item.quantity}</td>
                  <td className="py-4 text-sm text-gray-600 text-right">
                    {item.unitPrice === 0 ? 'Included' : formatAmount(item.unitPrice)}
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-900 text-right">
                    {item.total === 0 ? '—' : formatAmount(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 pb-8">
          <div className="ml-auto max-w-xs space-y-2 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal (excl. VAT)</span>
              <span className="text-gray-700">{formatAmount(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">VAT (15%)</span>
              <span className="text-gray-700">{formatAmount(invoice.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1">
              <span className="text-gray-900">Total</span>
              <span className="text-brand-navy">{formatAmount(invoice.total)}</span>
            </div>
            {invoice.status === 'paid' && (
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Amount Paid</span>
                <span>{formatAmount(invoice.amountPaid)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Thank you for using HeyCreator. For billing queries, contact{' '}
            <a href="mailto:billing@heycreator.com" className="text-brand-cyan hover:underline">
              billing@heycreator.com
            </a>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            HeyCreator (Pty) Ltd &middot; Registration 2024/123456/07 &middot; VAT 4810293847
          </p>
        </div>
      </div>

      {/* Action Buttons (hidden in print) */}
      <div className="print:hidden flex items-center gap-3 mt-6">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-navy text-white rounded-xl text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
      </div>
    </div>
  );
}
