import { PaymentMethod } from '@/types/subscription';

// All dates relative to the project's canonical "now": 2026-03-05

export const mockPaymentMethods: { id: string; data: PaymentMethod }[] = [
  // -------------------------------------------------------------------------
  // Nike SA — Visa ending 6411 (default)
  // Primary card used for all Growth plan monthly billings
  // -------------------------------------------------------------------------
  {
    id: 'mock-pm-1',
    data: {
      id: 'mock-pm-1',
      workspaceId: 'ws-nike-sa',
      type: 'credit_card',
      isDefault: true,
      creditCard: {
        brand: 'visa',
        last4: '6411',
        expiryMonth: 9,
        expiryYear: 2027,
        holderName: 'Nike South Africa (Pty) Ltd',
      },
      createdAt: '2026-02-03T08:00:00.000Z',
    },
  },

  // -------------------------------------------------------------------------
  // Nike SA — Mastercard ending 8832 (non-default backup card)
  // -------------------------------------------------------------------------
  {
    id: 'mock-pm-2',
    data: {
      id: 'mock-pm-2',
      workspaceId: 'ws-nike-sa',
      type: 'credit_card',
      isDefault: false,
      creditCard: {
        brand: 'mastercard',
        last4: '8832',
        expiryMonth: 4,
        expiryYear: 2026,
        holderName: 'Nike South Africa (Pty) Ltd',
      },
      createdAt: '2026-02-03T08:05:00.000Z',
    },
  },

  // -------------------------------------------------------------------------
  // Adidas ZA — EFT via FNB business account (default)
  // Reference number follows HeyCreator's HC prefix convention
  // -------------------------------------------------------------------------
  {
    id: 'mock-pm-3',
    data: {
      id: 'mock-pm-3',
      workspaceId: 'ws-adidas-za',
      type: 'eft',
      isDefault: true,
      eft: {
        bankName: 'First National Bank (FNB)',
        accountHolder: 'Adidas South Africa (Pty) Ltd',
        referenceNumber: 'HC-WS-ADIDAS-ZA',
      },
      createdAt: '2026-02-08T10:30:00.000Z',
    },
  },
];
