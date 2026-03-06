'use client';

import { useState } from 'react';
import { Download, ChevronDown, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type BillingStatus = 'paid' | 'pending' | 'overdue';
type BillingPeriod = 'current' | 'last' | 'last3';

interface BillingRow {
  workspaceId: string;
  workspaceName: string;
  plan: string;
  monthlyCostZAR: number;
  discountPercent: number;
  finalCostZAR: number;
  status: BillingStatus;
  invoiceId: string;
}

// ─── Inline Mock Data ─────────────────────────────────────────────────────────

const BILLING_ROWS: BillingRow[] = [
  {
    workspaceId: 'ws-nike-sa',
    workspaceName: 'Nike SA',
    plan: 'Growth',
    monthlyCostZAR: 35000,
    discountPercent: 15,
    finalCostZAR: 29750,
    status: 'paid',
    invoiceId: 'INV-2026-03-001',
  },
  {
    workspaceId: 'ws-adidas-za',
    workspaceName: 'Adidas ZA',
    plan: 'Discovery',
    monthlyCostZAR: 20000,
    discountPercent: 15,
    finalCostZAR: 17000,
    status: 'paid',
    invoiceId: 'INV-2026-03-002',
  },
  {
    workspaceId: 'ws-agency-hub',
    workspaceName: 'Agency Hub',
    plan: 'Scale',
    monthlyCostZAR: 50000,
    discountPercent: 15,
    finalCostZAR: 42500,
    status: 'pending',
    invoiceId: 'INV-2026-03-003',
  },
];

const PERIOD_LABELS: Record<BillingPeriod, string> = {
  current: 'Current Month (Mar 2026)',
  last: 'Last Month (Feb 2026)',
  last3: 'Last 3 Months',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const normalized = plan.toLowerCase();
  let className = 'bg-gray-100 text-gray-600';
  if (normalized === 'growth') className = 'bg-blue-100 text-blue-700';
  if (normalized === 'scale') className = 'bg-brand-navy text-white';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: BillingStatus }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
        <CheckCircle className="w-3 h-3" />
        Paid
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
      <AlertTriangle className="w-3 h-3" />
      Overdue
    </span>
  );
}

function formatZAR(amount: number): string {
  return `R${amount.toLocaleString('en-ZA')}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgencyBillingTable() {
  const [period, setPeriod] = useState<BillingPeriod>('current');
  const [periodOpen, setPeriodOpen] = useState(false);

  const rows = BILLING_ROWS;

  const totals = rows.reduce(
    (acc, row) => ({
      monthly: acc.monthly + row.monthlyCostZAR,
      final: acc.final + row.finalCostZAR,
    }),
    { monthly: 0, final: 0 },
  );
  const totalSavings = totals.monthly - totals.final;

  function handleDownloadInvoice(invoiceId: string) {
    // In production this would trigger a PDF download
    alert(`Downloading invoice ${invoiceId}…`);
  }

  function handleDownloadAll() {
    alert('Downloading all invoices as ZIP…');
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-brand-navy">Billing Summary</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
            Saved {formatZAR(totalSavings)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="relative">
            <button
              onClick={() => setPeriodOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {PERIOD_LABELS[period]}
              <ChevronDown className={`w-4 h-4 transition-transform ${periodOpen ? 'rotate-180' : ''}`} />
            </button>
            {periodOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {(Object.entries(PERIOD_LABELS) as [BillingPeriod, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setPeriod(key);
                      setPeriodOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      period === key
                        ? 'bg-brand-navy/5 text-brand-navy'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-brand-navy rounded-xl hover:bg-brand-navy-light transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Workspace
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Plan
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Monthly Cost
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Discount
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Final Cost
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.workspaceId} className="hover:bg-gray-50/40 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-brand-navy">{row.workspaceName}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{row.invoiceId}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <PlanBadge plan={row.plan} />
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-medium text-gray-700">
                    {formatZAR(row.monthlyCostZAR)}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-semibold text-green-600">
                    -{row.discountPercent}%
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-sm font-bold text-brand-navy">
                    {formatZAR(row.finalCostZAR)}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleDownloadInvoice(row.invoiceId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-navy border border-brand-navy/20 rounded-lg hover:bg-brand-navy/5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Totals Row */}
          <tfoot>
            <tr className="border-t-2 border-gray-200 bg-gray-50/80">
              <td colSpan={2} className="px-6 py-4">
                <span className="text-sm font-bold text-brand-navy">Total (3 workspaces)</span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="text-sm font-medium text-gray-700 line-through">
                  {formatZAR(totals.monthly)}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="text-sm font-bold text-green-600">
                  -{formatZAR(totalSavings)}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="text-base font-black text-brand-navy">
                  {formatZAR(totals.final)}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  2 Paid
                </span>
              </td>
              <td className="px-4 py-4" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
