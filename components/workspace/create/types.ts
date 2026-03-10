import { IndustryType, CompanySize } from '@/types/firebase';
import { PlanTier, SupportedCurrency } from '@/types/workspace';

// ===== FORM DATA =====

export type WorkspaceFormData = {
  name: string;
  slug: string;
  logoFile: File | null;
  logoPreviewUrl: string | null;
  logoSource: 'upload' | 'brandfetch' | null;
  brandName: string;
  brandDomain: string;
  brandColors: { hex: string; type: string }[];
  brandFonts: { name: string; type: string }[];
  industry: IndustryType | '';
  website: string;
  companySize: CompanySize | '';
  selectedPlan: PlanTier;
  currency: SupportedCurrency;
  inviteEmails: string[];
};

// ===== VALIDATION =====

export type ValidationErrors = { [key: string]: string };

// ===== STEP PROPS =====

export interface StepProps {
  formData: WorkspaceFormData;
  setFormData: React.Dispatch<React.SetStateAction<WorkspaceFormData>>;
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

// ===== WIZARD STEPS =====

export const WIZARD_STEPS = [
  { number: 1, label: 'NAME & LOGO' },
  { number: 2, label: 'BRAND DETAILS' },
  { number: 3, label: 'SELECT PLAN' },
  { number: 4, label: 'INVITE TEAM' },
] as const;

// ===== INVITE ENTRY =====

export type InviteRole = 'admin' | 'editor' | 'viewer';

export interface InviteEntry {
  email: string;
  role: InviteRole;
}

// ===== INITIAL STATE =====

export const initialFormData: WorkspaceFormData = {
  name: '',
  slug: '',
  logoFile: null,
  logoPreviewUrl: null,
  logoSource: null,
  brandName: '',
  brandDomain: '',
  brandColors: [],
  brandFonts: [],
  industry: '',
  website: '',
  companySize: '',
  selectedPlan: 'growth',
  currency: 'ZAR',
  inviteEmails: [],
};

// ===== HELPERS =====

/**
 * Converts a workspace name into a URL-safe slug.
 * e.g. "Acme Corp Hub" → "acme-corp-hub"
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ===== VALIDATION HELPERS =====

export function validateStep(
  step: number,
  formData: WorkspaceFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (step === 1) {
    if (!formData.name.trim()) {
      errors.name = 'Workspace name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Workspace name must be at least 2 characters.';
    }
  }

  if (step === 2) {
    if (!formData.brandName.trim()) {
      errors.brandName = 'Brand name is required.';
    }
    if (!formData.industry) {
      errors.industry = 'Please select an industry.';
    }
    if (!formData.companySize) {
      errors.companySize = 'Please select a company size.';
    }
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      errors.website = 'Please enter a valid URL (starting with https://).';
    }
  }

  if (step === 3) {
    if (!formData.selectedPlan) {
      errors.selectedPlan = 'Please select a plan to continue.';
    }
  }

  // Step 4 (Invite Team) is entirely optional — no required fields

  return errors;
}

// ===== CURRENCY DISPLAY =====

export const CURRENCY_OPTIONS: Array<{
  value: SupportedCurrency;
  label: string;
  flag: string;
}> = [
  { value: 'ZAR', label: 'ZAR – South African Rand', flag: '🇿🇦' },
  { value: 'USD', label: 'USD – US Dollar', flag: '🇺🇸' },
  { value: 'EUR', label: 'EUR – Euro', flag: '🇪🇺' },
  { value: 'GBP', label: 'GBP – British Pound', flag: '🇬🇧' },
];

// ===== INDUSTRY OPTIONS =====

export const INDUSTRY_OPTIONS: Array<{ value: IndustryType; label: string }> = [
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Beauty', label: 'Beauty' },
  { value: 'Food & Beverage', label: 'Food & Beverage' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Fitness', label: 'Fitness' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Education', label: 'Education' },
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Other', label: 'Other' },
];

// ===== COMPANY SIZE OPTIONS =====

export const COMPANY_SIZE_OPTIONS: Array<{
  value: CompanySize;
  label: string;
  description: string;
}> = [
  { value: '1-10', label: '1–10', description: 'Solo or small team' },
  { value: '11-50', label: '11–50', description: 'Growing startup' },
  { value: '51-200', label: '51–200', description: 'Mid-size company' },
  { value: '201-1000', label: '201–1000', description: 'Large enterprise' },
  { value: '1000+', label: '1000+', description: 'Global corporation' },
];
