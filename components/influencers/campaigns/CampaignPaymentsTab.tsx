'use client';

import { useMemo } from 'react';

export interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  dueDate: string;
  campaignName: string;
  brandName: string;
  method: string;
  creatorName: string;
}

interface CampaignPaymentsTabProps {
  campaign: any;
  payments?: PaymentItem[];
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-[#FFC107]', text: 'text-white' },
  processing: { label: 'Processing', bg: 'bg-blue-500', text: 'text-white' },
  paid: { label: 'Paid', bg: 'bg-green-500', text: 'text-white' },
  failed: { label: 'Failed', bg: 'bg-red-500', text: 'text-white' },
  refunded: { label: 'Refunded', bg: 'bg-gray-500', text: 'text-white' },
};

function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R' : currency;
  return `${symbol} ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleDateString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  } catch {
    return dateStr;
  }
}

/* ── Main Component ── */
export default function CampaignPaymentsTab({
  campaign,
  payments: externalPayments,
}: CampaignPaymentsTabProps) {
  // Use external payments or generate demo data from campaign
  const payments = useMemo(() => {
    if (externalPayments && externalPayments.length > 0) return externalPayments;

    const budget = campaign?.budget;
    const amount = budget?.fixedAmount || budget?.maxRangeAmount || 8500;
    const currency = budget?.currency || 'ZAR';
    const campaignName = campaign?.title || campaign?.campaignTitle || 'Campaign';
    const brandName = campaign?.brandInfo?.name || 'Brand';

    return [
      {
        id: '1',
        amount,
        currency,
        status: 'pending' as const,
        dueDate: '2026-01-02',
        campaignName,
        brandName,
        method: 'Bank EFT',
        creatorName: 'Jim Bean',
      },
      {
        id: '2',
        amount: Math.round(amount * 1.35),
        currency,
        status: 'pending' as const,
        dueDate: '2026-02-12',
        campaignName,
        brandName,
        method: 'Bank EFT',
        creatorName: 'Jim Bean',
      },
      {
        id: '3',
        amount: Math.round(amount * 1.35),
        currency,
        status: 'pending' as const,
        dueDate: '2026-02-12',
        campaignName,
        brandName,
        method: 'Bank EFT',
        creatorName: 'Jim Bean',
      },
      {
        id: '4',
        amount: Math.round(amount * 1.35),
        currency,
        status: 'pending' as const,
        dueDate: '2026-02-12',
        campaignName,
        brandName,
        method: 'Bank EFT',
        creatorName: 'Jim Bean',
      },
    ];
  }, [campaign, externalPayments]);

  // Featured payment = first item
  const featuredPayment = payments[0];

  return (
    <div className="space-y-6">
      {/* ===== FEATURED PAYMENT CARD ===== */}
      {featuredPayment && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="mb-6">
            <h3 className="text-3xl font-bold text-brand-navy-dark">
              {formatCurrency(featuredPayment.amount, featuredPayment.currency)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {PAYMENT_STATUS_CONFIG[featuredPayment.status]?.label || featuredPayment.status}
            </p>
          </div>

          <div className="grid grid-cols-5 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Due</p>
              <p className="text-sm font-medium text-brand-navy-dark">
                {formatDate(featuredPayment.dueDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Campaign</p>
              <p className="text-sm font-medium text-brand-navy-dark">
                {featuredPayment.campaignName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Brand</p>
              <p className="text-sm font-medium text-brand-navy-dark">
                {featuredPayment.brandName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Method</p>
              <p className="text-sm font-medium text-brand-navy-dark">
                {featuredPayment.method}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  PAYMENT_STATUS_CONFIG[featuredPayment.status]?.bg || 'bg-gray-200'
                } ${PAYMENT_STATUS_CONFIG[featuredPayment.status]?.text || 'text-gray-700'}`}
              >
                {PAYMENT_STATUS_CONFIG[featuredPayment.status]?.label || featuredPayment.status}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
