import { Subscription } from '@/types/subscription';

// ===== DATE HELPERS =====
// All dates relative to the project's canonical "now": 2026-03-05

const D = (offsetDays: number): string => {
  const base = new Date('2026-03-05T00:00:00.000Z');
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString();
};

// Readable anchors
const NOW        = D(0);   // 2026-03-05
const D_MINUS_30 = D(-30); // 2026-02-03  — billing period started ~30 days ago
const D_MINUS_12 = D(-12); // 2026-02-21  — Nike: period started 12 days ago  → next billing in 18 days
const D_PLUS_18  = D(18);  // 2026-03-23  — Nike: next billing date
const D_MINUS_25 = D(-25); // 2026-02-08  — Adidas: period started 25 days ago → next billing in 5 days
const D_PLUS_5   = D(5);   // 2026-03-10  — Adidas: next billing date
const D_MINUS_7  = D(-7);  // 2026-02-26  — Freshly Baked: trial started 7 days ago
const D_PLUS_7   = D(7);   // 2026-03-12  — Freshly Baked: trial ends in 7 days

export const mockSubscriptions: { id: string; data: Subscription }[] = [
  // -------------------------------------------------------------------------
  // Nike South Africa — Growth plan, active, monthly, credit_card
  // Billing period: 2026-02-21 → 2026-03-23 (next billing in 18 days)
  // -------------------------------------------------------------------------
  {
    id: 'mock-sub-1',
    data: {
      id: 'mock-sub-1',
      workspaceId: 'ws-nike-sa',
      planTier: 'growth',
      status: 'active',
      billingCycle: 'monthly',
      currency: 'ZAR',

      // Growth plan = R35,000 / month (amounts stored as whole Rands)
      amountPerCycle: 35000,
      nextBillingDate: D_PLUS_18,
      currentPeriodStart: D_MINUS_12,
      currentPeriodEnd: D_PLUS_18,

      defaultPaymentMethodId: 'mock-pm-1',

      createdAt: D_MINUS_30,
      updatedAt: NOW,
    },
  },

  // -------------------------------------------------------------------------
  // Adidas ZA — Discovery plan, active, monthly, EFT
  // Billing period: 2026-02-08 → 2026-03-10 (next billing in 5 days)
  // -------------------------------------------------------------------------
  {
    id: 'mock-sub-2',
    data: {
      id: 'mock-sub-2',
      workspaceId: 'ws-adidas-za',
      planTier: 'discovery',
      status: 'active',
      billingCycle: 'monthly',
      currency: 'ZAR',

      // Discovery plan = R20,000 / month
      amountPerCycle: 20000,
      nextBillingDate: D_PLUS_5,
      currentPeriodStart: D_MINUS_25,
      currentPeriodEnd: D_PLUS_5,

      defaultPaymentMethodId: 'mock-pm-3',

      createdAt: D_MINUS_30,
      updatedAt: NOW,
    },
  },

  // -------------------------------------------------------------------------
  // Freshly Baked Co — Growth plan, trial
  // Trial started 7 days ago (2026-02-26), ends in 7 days (2026-03-12)
  // No payment method required yet; billing starts after trial
  // -------------------------------------------------------------------------
  {
    id: 'mock-sub-3',
    data: {
      id: 'mock-sub-3',
      workspaceId: 'ws-freshly-baked',
      planTier: 'growth',
      status: 'trial',
      billingCycle: 'monthly',
      currency: 'ZAR',

      // Will be charged Growth rate when trial converts
      amountPerCycle: 35000,
      // First real billing date = day after trial ends
      nextBillingDate: D_PLUS_7,
      currentPeriodStart: D_MINUS_7,
      currentPeriodEnd: D_PLUS_7,

      trialStartDate: D_MINUS_7,
      trialEndDate: D_PLUS_7,

      createdAt: D_MINUS_7,
      updatedAt: NOW,
    },
  },
];
