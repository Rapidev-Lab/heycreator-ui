import { Invoice } from '@/types/subscription';

// ===== DATE HELPERS =====
// All dates relative to the project's canonical "now": 2026-03-05

const D = (offsetDays: number): string => {
  const base = new Date('2026-03-05T00:00:00.000Z');
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString();
};

// ===== PRICING CONSTANTS =====
// Growth plan: R35,000 + 15% VAT = R40,250
// Discovery plan: R20,000 + 15% VAT = R23,000
// Trial: R0 (no charge during trial period)

const GROWTH_SUBTOTAL   = 35000;
const GROWTH_TAX        = 5250;   // 15% of 35,000
const GROWTH_TOTAL      = 40250;

const DISCOVERY_SUBTOTAL = 20000;
const DISCOVERY_TAX      = 3000;  // 15% of 20,000
const DISCOVERY_TOTAL    = 23000;

export const mockInvoices: { id: string; data: Invoice }[] = [
  // -------------------------------------------------------------------------
  // Nike SA — Growth plan February 2026 (paid)
  // Billing period: 2026-02-01 → 2026-02-28
  // -------------------------------------------------------------------------
  {
    id: 'mock-inv-1',
    data: {
      id: 'mock-inv-1',
      workspaceId: 'ws-nike-sa',
      subscriptionId: 'mock-sub-1',
      invoiceNumber: 'INV-2026-001',
      status: 'paid',
      currency: 'ZAR',

      subtotal: GROWTH_SUBTOTAL,
      tax: GROWTH_TAX,
      total: GROWTH_TOTAL,
      amountPaid: GROWTH_TOTAL,

      lineItems: [
        {
          description: 'HeyCreator Growth Plan — February 2026',
          quantity: 1,
          unitPrice: GROWTH_SUBTOTAL,
          total: GROWTH_SUBTOTAL,
        },
        {
          description: 'VAT (15%)',
          quantity: 1,
          unitPrice: GROWTH_TAX,
          total: GROWTH_TAX,
        },
      ],

      issuedAt: '2026-02-01T00:00:00.000Z',
      dueDate: '2026-02-08T00:00:00.000Z',
      paidAt: '2026-02-03T09:14:22.000Z',

      paymentMethodType: 'credit_card',
      paymentMethodLast4: '6411',

      pdfUrl: '/mock/invoices/INV-2026-001.pdf',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  },

  // -------------------------------------------------------------------------
  // Nike SA — Growth plan January 2026 (paid)
  // Billing period: 2026-01-01 → 2026-01-31
  // -------------------------------------------------------------------------
  {
    id: 'mock-inv-2',
    data: {
      id: 'mock-inv-2',
      workspaceId: 'ws-nike-sa',
      subscriptionId: 'mock-sub-1',
      invoiceNumber: 'INV-2026-002',
      status: 'paid',
      currency: 'ZAR',

      subtotal: GROWTH_SUBTOTAL,
      tax: GROWTH_TAX,
      total: GROWTH_TOTAL,
      amountPaid: GROWTH_TOTAL,

      lineItems: [
        {
          description: 'HeyCreator Growth Plan — January 2026',
          quantity: 1,
          unitPrice: GROWTH_SUBTOTAL,
          total: GROWTH_SUBTOTAL,
        },
        {
          description: 'VAT (15%)',
          quantity: 1,
          unitPrice: GROWTH_TAX,
          total: GROWTH_TAX,
        },
      ],

      issuedAt: '2026-01-01T00:00:00.000Z',
      dueDate: '2026-01-08T00:00:00.000Z',
      paidAt: '2026-01-02T11:05:44.000Z',

      paymentMethodType: 'credit_card',
      paymentMethodLast4: '6411',

      pdfUrl: '/mock/invoices/INV-2026-002.pdf',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  },

  // -------------------------------------------------------------------------
  // Nike SA — Growth plan December 2025 (paid)
  // Billing period: 2025-12-01 → 2025-12-31
  // -------------------------------------------------------------------------
  {
    id: 'mock-inv-3',
    data: {
      id: 'mock-inv-3',
      workspaceId: 'ws-nike-sa',
      subscriptionId: 'mock-sub-1',
      invoiceNumber: 'INV-2025-012',
      status: 'paid',
      currency: 'ZAR',

      subtotal: GROWTH_SUBTOTAL,
      tax: GROWTH_TAX,
      total: GROWTH_TOTAL,
      amountPaid: GROWTH_TOTAL,

      lineItems: [
        {
          description: 'HeyCreator Growth Plan — December 2025',
          quantity: 1,
          unitPrice: GROWTH_SUBTOTAL,
          total: GROWTH_SUBTOTAL,
        },
        {
          description: 'VAT (15%)',
          quantity: 1,
          unitPrice: GROWTH_TAX,
          total: GROWTH_TAX,
        },
      ],

      issuedAt: '2025-12-01T00:00:00.000Z',
      dueDate: '2025-12-08T00:00:00.000Z',
      paidAt: '2025-12-04T08:33:11.000Z',

      paymentMethodType: 'credit_card',
      paymentMethodLast4: '6411',

      pdfUrl: '/mock/invoices/INV-2025-012.pdf',
      createdAt: '2025-12-01T00:00:00.000Z',
    },
  },

  // -------------------------------------------------------------------------
  // Adidas ZA — Discovery plan February 2026 (paid)
  // Billing period: 2026-02-08 → 2026-03-07 (paid via EFT)
  // -------------------------------------------------------------------------
  {
    id: 'mock-inv-4',
    data: {
      id: 'mock-inv-4',
      workspaceId: 'ws-adidas-za',
      subscriptionId: 'mock-sub-2',
      invoiceNumber: 'INV-2026-003',
      status: 'paid',
      currency: 'ZAR',

      subtotal: DISCOVERY_SUBTOTAL,
      tax: DISCOVERY_TAX,
      total: DISCOVERY_TOTAL,
      amountPaid: DISCOVERY_TOTAL,

      lineItems: [
        {
          description: 'HeyCreator Discovery Plan — February 2026',
          quantity: 1,
          unitPrice: DISCOVERY_SUBTOTAL,
          total: DISCOVERY_SUBTOTAL,
        },
        {
          description: 'VAT (15%)',
          quantity: 1,
          unitPrice: DISCOVERY_TAX,
          total: DISCOVERY_TAX,
        },
      ],

      issuedAt: '2026-02-08T00:00:00.000Z',
      dueDate: '2026-02-15T00:00:00.000Z',
      paidAt: '2026-02-12T13:47:09.000Z',

      paymentMethodType: 'eft',

      pdfUrl: '/mock/invoices/INV-2026-003.pdf',
      createdAt: '2026-02-08T00:00:00.000Z',
    },
  },

  // -------------------------------------------------------------------------
  // Adidas ZA — Discovery plan March 2026 (pending, due in 5 days)
  // Billing period: 2026-03-08 → 2026-04-07
  // -------------------------------------------------------------------------
  {
    id: 'mock-inv-5',
    data: {
      id: 'mock-inv-5',
      workspaceId: 'ws-adidas-za',
      subscriptionId: 'mock-sub-2',
      invoiceNumber: 'INV-2026-004',
      status: 'pending',
      currency: 'ZAR',

      subtotal: DISCOVERY_SUBTOTAL,
      tax: DISCOVERY_TAX,
      total: DISCOVERY_TOTAL,
      amountPaid: 0,

      lineItems: [
        {
          description: 'HeyCreator Discovery Plan — March 2026',
          quantity: 1,
          unitPrice: DISCOVERY_SUBTOTAL,
          total: DISCOVERY_SUBTOTAL,
        },
        {
          description: 'VAT (15%)',
          quantity: 1,
          unitPrice: DISCOVERY_TAX,
          total: DISCOVERY_TAX,
        },
      ],

      issuedAt: D(3),   // Issued 3 days from now (2026-03-08 — start of next period)
      dueDate: D(5),    // Due in 5 days (2026-03-10)

      paymentMethodType: 'eft',

      pdfUrl: '/mock/invoices/INV-2026-004.pdf',
      createdAt: D(3),
    },
  },

  // -------------------------------------------------------------------------
  // Freshly Baked Co — Growth plan trial (pending, R0 during trial period)
  // Trial period: 2026-02-26 → 2026-03-12
  // -------------------------------------------------------------------------
  {
    id: 'mock-inv-6',
    data: {
      id: 'mock-inv-6',
      workspaceId: 'ws-freshly-baked',
      subscriptionId: 'mock-sub-3',
      invoiceNumber: 'INV-2026-005',
      status: 'pending',
      currency: 'ZAR',

      subtotal: 0,
      tax: 0,
      total: 0,
      amountPaid: 0,

      lineItems: [
        {
          description: 'HeyCreator Growth Plan — Trial Period (2026-02-26 to 2026-03-12)',
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],

      issuedAt: '2026-02-26T00:00:00.000Z',
      dueDate: '2026-03-12T00:00:00.000Z',   // Due when trial converts

      pdfUrl: '/mock/invoices/INV-2026-005.pdf',
      createdAt: '2026-02-26T00:00:00.000Z',
    },
  },
];
