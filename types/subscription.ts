import { PlanTier, SupportedCurrency } from './workspace';

// ===== SUBSCRIPTION STATUS =====

export type SubscriptionStatus =
  | 'active'
  | 'trial'
  | 'past_due'
  | 'cancelled'
  | 'suspended'
  | 'expired';

export type BillingCycle = 'monthly' | 'annual';

// ===== PAYMENT METHODS =====

export type PaymentMethodType = 'credit_card' | 'eft';

export interface CreditCardDetails {
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
}

export interface EFTDetails {
  bankName: string;
  accountHolder: string;
  referenceNumber: string;
}

export interface PaymentMethod {
  id: string;
  workspaceId: string;
  type: PaymentMethodType;
  isDefault: boolean;
  creditCard?: CreditCardDetails;
  eft?: EFTDetails;
  createdAt: string;
}

// ===== SUBSCRIPTION =====

export interface Subscription {
  id: string;
  workspaceId: string;
  planTier: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currency: SupportedCurrency;

  // Pricing
  amountPerCycle: number;           // e.g., 35000 (ZAR cents or whole)
  nextBillingDate: string;          // ISO date
  currentPeriodStart: string;       // ISO date
  currentPeriodEnd: string;         // ISO date

  // Trial
  trialStartDate?: string;
  trialEndDate?: string;

  // Cancellation
  cancelledAt?: string;
  cancellationReason?: string;
  cancelAtPeriodEnd?: boolean;      // If true, stays active until period ends

  // Grace period (past_due)
  gracePeriodEndsAt?: string;
  failedPaymentCount?: number;

  // Payment
  defaultPaymentMethodId?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ===== INVOICES =====

export type InvoiceStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'void';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  workspaceId: string;
  subscriptionId: string;
  invoiceNumber: string;            // e.g., "INV-2026-001"
  status: InvoiceStatus;
  currency: SupportedCurrency;

  // Amounts
  subtotal: number;
  tax: number;                      // VAT (15% in SA)
  total: number;
  amountPaid: number;

  // Items
  lineItems: InvoiceLineItem[];

  // Dates
  issuedAt: string;
  dueDate: string;
  paidAt?: string;

  // Payment
  paymentMethodType?: PaymentMethodType;
  paymentMethodLast4?: string;

  // PDF
  pdfUrl?: string;

  // Metadata
  createdAt: string;
}

// ===== EFT PROOF OF PAYMENT =====

export type EFTProofStatus = 'pending_review' | 'approved' | 'rejected';

export interface EFTProof {
  id: string;
  workspaceId: string;
  invoiceId: string;
  fileName: string;
  fileSize: number;                 // bytes
  fileUrl: string;
  referenceNumber: string;
  amount: number;
  status: EFTProofStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// ===== TRIAL =====

export interface TrialStatus {
  isOnTrial: boolean;
  daysRemaining: number | null;
  trialEndsAt: string | null;
  isExpired: boolean;
}

// ===== PLAN RECOMMENDATION (AI) =====

export interface PlanRecommendation {
  recommendedPlan: PlanTier;
  reason: string;
  savings?: string;                 // e.g., "Save R5K vs top-ups"
  confidence: 'high' | 'medium' | 'low';
}

// ===== BILLING CONTEXT =====

export interface BillingContextType {
  subscription: Subscription | null;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  eftProofs: EFTProof[];
  isLoading: boolean;
}

// ===== HEYCREATOR BANKING DETAILS (for EFT payments) =====

export const HEYCREATOR_BANKING_DETAILS = {
  bankName: 'First National Bank (FNB)',
  accountName: 'HeyCreator (Pty) Ltd',
  accountNumber: '62 8475 9103',
  branchCode: '250 655',
  branchName: 'Sandton City',
  accountType: 'Business Cheque',
  swiftCode: 'FIRNZAJJ',
  referencePrefix: 'HC',
} as const;
