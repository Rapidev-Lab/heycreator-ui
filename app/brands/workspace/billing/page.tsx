'use client';

import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Building2,
  TrendingUp,
  Download,
  X,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Receipt,
  ChevronRight,
} from 'lucide-react';
import { useWorkspace } from '@/lib/context/workspace-context';
import { PLAN_TIERS } from '@/types/workspace';
import type { Invoice, PaymentMethod } from '@/types/subscription';
import type { SupportedCurrency } from '@/types/workspace';
import BillingHistoryTable from '@/components/billing/BillingHistoryTable';

// ===== MOCK DATA (inline) =====

const MOCK_INVOICES: Invoice[] = [
  {
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
      { description: 'Growth Plan — March 2026', quantity: 1, unitPrice: 30435, total: 30435 },
    ],
    issuedAt: '2026-03-01T00:00:00Z',
    dueDate: '2026-03-07T00:00:00Z',
    paidAt: '2026-03-03T10:30:00Z',
    paymentMethodType: 'credit_card',
    paymentMethodLast4: '4242',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
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
      { description: 'Growth Plan — February 2026', quantity: 1, unitPrice: 30435, total: 30435 },
    ],
    issuedAt: '2026-02-01T00:00:00Z',
    dueDate: '2026-02-07T00:00:00Z',
    paidAt: '2026-02-02T09:15:00Z',
    paymentMethodType: 'eft',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'inv-003',
    workspaceId: 'ws-nikesa-001',
    subscriptionId: 'sub-001',
    invoiceNumber: 'INV-2026-001',
    status: 'paid',
    currency: 'ZAR',
    subtotal: 30435,
    tax: 4565,
    total: 35000,
    amountPaid: 35000,
    lineItems: [
      { description: 'Growth Plan — January 2026', quantity: 1, unitPrice: 30435, total: 30435 },
    ],
    issuedAt: '2026-01-01T00:00:00Z',
    dueDate: '2026-01-07T00:00:00Z',
    paidAt: '2026-01-04T14:00:00Z',
    paymentMethodType: 'credit_card',
    paymentMethodLast4: '4242',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'inv-004',
    workspaceId: 'ws-nikesa-001',
    subscriptionId: 'sub-001',
    invoiceNumber: 'INV-2025-012',
    status: 'failed',
    currency: 'ZAR',
    subtotal: 30435,
    tax: 4565,
    total: 35000,
    amountPaid: 0,
    lineItems: [
      { description: 'Growth Plan — December 2025', quantity: 1, unitPrice: 30435, total: 30435 },
    ],
    issuedAt: '2025-12-01T00:00:00Z',
    dueDate: '2025-12-07T00:00:00Z',
    paymentMethodType: 'credit_card',
    paymentMethodLast4: '9876',
    createdAt: '2025-12-01T00:00:00Z',
  },
];

const MOCK_PAYMENT_METHOD: PaymentMethod = {
  id: 'pm-001',
  workspaceId: 'ws-nikesa-001',
  type: 'credit_card',
  isDefault: true,
  creditCard: {
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 27,
    holderName: 'Demo Brand',
  },
  createdAt: '2026-01-01T00:00:00Z',
};

// ===== HELPERS =====

function formatAmount(amount: number, currency: SupportedCurrency = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R' : '$';
  return `${symbol}${amount.toLocaleString('en-ZA')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ===== CURRENT PLAN CARD =====

function CurrentPlanCard() {
  const router = useRouter();
  const { currentWorkspace, userRole } = useWorkspace();
  const isOwner = userRole === 'owner';

  if (!currentWorkspace) return null;

  const plan = PLAN_TIERS[currentWorkspace.planTier];
  const isOnTrial = currentWorkspace.status === 'trial';
  const nextBillingDate = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Current Plan</h3>
          <p className="text-sm text-gray-500">Your active subscription</p>
        </div>
        {isOwner && (
          <button
            onClick={() => router.push('/brands/workspace/billing/plans')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-brand-navy border border-brand-navy/30 rounded-lg hover:bg-brand-navy/5 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Change Plan
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-brand-navy/5 rounded-xl">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-brand-navy">{plan.name}</span>
            {isOnTrial ? (
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                Trial
              </span>
            ) : (
              <span className="text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            R{plan.price.toLocaleString('en-ZA')}/month &middot; {plan.seats}{' '}
            {plan.seats === 1 ? 'seat' : 'seats'} &middot;{' '}
            {plan.monthlySearches === -1 ? 'unlimited' : plan.monthlySearches} searches
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Next billing</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {formatDate(nextBillingDate)}
          </p>
        </div>
      </div>

      {isOnTrial && currentWorkspace.trialEndsAt && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Your free trial ends on{' '}
            <span className="font-semibold">{formatDate(currentWorkspace.trialEndsAt)}</span>.
            Add a payment method to continue.
          </p>
        </div>
      )}
    </div>
  );
}

// ===== PAYMENT METHOD CARD =====

function PaymentMethodCard() {
  const router = useRouter();
  const { userRole } = useWorkspace();
  const isOwner = userRole === 'owner';
  const pm = MOCK_PAYMENT_METHOD;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Payment Method</h3>
          <p className="text-sm text-gray-500">Default payment for your subscription</p>
        </div>
        {isOwner && (
          <button
            onClick={() => router.push('/brands/workspace/billing/payment?mode=update')}
            className="text-sm font-medium text-brand-cyan hover:text-brand-navy transition-colors"
          >
            Update
          </button>
        )}
      </div>

      {pm.type === 'credit_card' && pm.creditCard ? (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-[9px] font-black italic">
            VISA
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Visa ending in {pm.creditCard.last4}
            </p>
            <p className="text-xs text-gray-400">
              Expires {pm.creditCard.expiryMonth.toString().padStart(2, '0')}/
              {pm.creditCard.expiryYear}
            </p>
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            Default
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <Building2 className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">EFT Bank Transfer</p>
            <p className="text-xs text-gray-400">Manual transfer — FNB Business Account</p>
          </div>
        </div>
      )}

      {isOwner && (
        <button
          onClick={() => router.push('/brands/workspace/billing/eft?mode=pay')}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Pay via EFT instead
        </button>
      )}
    </div>
  );
}

// ===== QUICK ACTIONS =====

function QuickActions() {
  const router = useRouter();
  const { userRole } = useWorkspace();
  const isOwner = userRole === 'owner';

  if (!isOwner) return null;

  const actions = [
    {
      icon: <TrendingUp className="w-5 h-5 text-brand-navy" />,
      label: 'Change Plan',
      description: 'Upgrade or switch your subscription',
      onClick: () => router.push('/brands/workspace/billing/plans'),
    },
    {
      icon: <CreditCard className="w-5 h-5 text-brand-navy" />,
      label: 'Update Payment',
      description: 'Change your default payment method',
      onClick: () => router.push('/brands/workspace/billing/payment?mode=update'),
    },
    {
      icon: <Download className="w-5 h-5 text-brand-navy" />,
      label: 'Download All Invoices',
      description: 'Export your full billing history',
      onClick: () => alert('Downloading all invoices... (mock)'),
    },
    {
      icon: <X className="w-5 h-5 text-red-500" />,
      label: 'Cancel Subscription',
      description: 'End your plan at period close',
      onClick: () => router.push('/brands/workspace/billing/cancel'),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-left ${
              action.label === 'Cancel Subscription'
                ? 'hover:bg-red-50 border border-transparent hover:border-red-100'
                : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold ${
                  action.label === 'Cancel Subscription' ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {action.label}
              </p>
              <p className="text-xs text-gray-400 truncate">{action.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====

export default function BillingPage() {
  const router = useRouter();
  const { currentWorkspace, userRole, isLoading } = useWorkspace();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          </div>
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <p className="text-gray-500">No workspace selected.</p>
      </div>
    );
  }

  // Access restriction for non-owners
  if (userRole !== 'owner') {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-gray-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-gray-500">
            Billing and subscription management is only available to the workspace owner.
            Contact your workspace owner to make changes.
          </p>
        </div>
      </div>
    );
  }

  const currency = currentWorkspace.settings.currency;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing &amp; Subscription</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your plan, payment method, and billing history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <CurrentPlanCard />

          {/* Payment Method */}
          <PaymentMethodCard />

          {/* Billing History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Billing History</h3>
                <p className="text-sm text-gray-500">Your past invoices and payments</p>
              </div>
              <button
                onClick={() => alert('Downloading all invoices... (mock)')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>
            <BillingHistoryTable invoices={MOCK_INVOICES} currency={currency} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Invoice Info */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="w-4 h-4 text-gray-500" />
              <h4 className="text-sm font-semibold text-gray-700">Invoice Details</h4>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Billing entity</p>
                <p className="text-sm text-gray-700 font-medium">{currentWorkspace.brandName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Workspace</p>
                <p className="text-sm text-gray-700 font-medium">{currentWorkspace.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Currency</p>
                <p className="text-sm text-gray-700 font-medium">{currency}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">VAT rate</p>
                <p className="text-sm text-gray-700 font-medium">15% (South Africa)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
