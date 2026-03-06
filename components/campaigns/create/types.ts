import { UploadedFile } from "@/lib/firebase/storage-utils";
import { TaskDeliverable } from "@/components/campaigns/RequiredDeliverables";

// Screening question types
export type AnswerOption = {
  id: string;
  text: string;
  isAcceptable: boolean;
};

export type ScreeningQuestion = {
  id: string;
  question: string;
  answers: AnswerOption[];
};

export type CampaignData = {
  title: string;
  description: string;
  objectives: string;
  KPIs: string;
  paymentTerms: string;
  campaignCategories: string[];
  productName: string;
  productType: string;
  productValue: string;
  productLink: string;
  productImages: File[];
  accessInstructions: string;
  contentDetails: string;
  keepProductAsGift: boolean;
  reimburseWithVoucher: boolean;
  reimbursementAmount: string;
  compensationModel: "fixed" | "range";
  currency: string;
  fixedAmount: string;
  budgetFrom: number | string;
  budgetTo: number | string;
  allowBidsMarketplace: boolean;
  startDate: string;
  endDate: string;
  applicationDeadline: string;
  contentCreationStart: string;
  contentCreationEnd: string;
  visibility: "public" | "private";
  minFollowers: number | string;
  minEngagementRate: number | string;
  ageRangeFrom: number | string;
  ageRangeTo: number | string;
  gender: string;
  interests: string;
  location: string;
  dos: string[];
  donts: string[];
  taskDeliverables: TaskDeliverable[];
  requiredHashtags: string[];
  mentionsTags: string[];
  screeningQuestions: ScreeningQuestion[];
  campaignAssets: File[];
  moodBoard: File[];
  campaignBrief: File[];
  contractNDA: File[];
  uploadedCampaignAssets: UploadedFile[];
  uploadedMoodBoard: UploadedFile[];
  uploadedCampaignBrief: UploadedFile[];
  uploadedContractNDA: UploadedFile[];
  uploadedProductImages: UploadedFile[];
};

export type ValidationErrors = {
  [key: string]: string;
};

export interface StepProps {
  campaignData: CampaignData;
  setCampaignData: React.Dispatch<React.SetStateAction<CampaignData>>;
  errors: ValidationErrors;
  setErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
}

// Constants
export const STEPS = [
  { number: 1, label: "DETAILS" },
  { number: 2, label: "PRODUCT" },
  { number: 3, label: "AUDIENCE" },
  { number: 4, label: "BUDGET" },
  { number: 5, label: "TASKS" },
  { number: 6, label: "REVIEW" },
];

export const paymentTermOptions = [
  "Payment on Completion",
  "50% Upfront, 50% on Completion",
  "Milestone Based Payments",
  "Payment after Publication",
].map((term) => ({ value: term, label: term }));

export const genderOptions = [
  { value: "any", label: "Any Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
];

export const categoryOptions = [
  { value: "Beauty & Skincare", label: "Beauty & Skincare" },
  { value: "Fashion & Apparel", label: "Fashion & Apparel" },
  { value: "Health & Wellness", label: "Health & Wellness" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Technology", label: "Technology" },
  { value: "Travel & Lifestyle", label: "Travel & Lifestyle" },
];

export const initialCampaignData: CampaignData = {
  title: "",
  description: "",
  objectives: "",
  KPIs: "",
  paymentTerms: "",
  campaignCategories: [],
  productName: "",
  productType: "",
  productValue: "",
  productLink: "",
  productImages: [],
  accessInstructions: "",
  contentDetails: "",
  keepProductAsGift: false,
  reimburseWithVoucher: false,
  reimbursementAmount: "",
  compensationModel: "fixed",
  currency: "ZAR",
  fixedAmount: "",
  budgetFrom: "",
  budgetTo: "",
  allowBidsMarketplace: false,
  startDate: "",
  endDate: "",
  applicationDeadline: "",
  contentCreationStart: "",
  contentCreationEnd: "",
  visibility: "public",
  minFollowers: "",
  minEngagementRate: "",
  ageRangeFrom: "",
  ageRangeTo: "",
  gender: "",
  interests: "",
  location: "",
  dos: [],
  donts: [],
  taskDeliverables: [],
  requiredHashtags: [],
  mentionsTags: [],
  screeningQuestions: [],
  campaignAssets: [],
  moodBoard: [],
  campaignBrief: [],
  contractNDA: [],
  uploadedCampaignAssets: [],
  uploadedMoodBoard: [],
  uploadedCampaignBrief: [],
  uploadedContractNDA: [],
  uploadedProductImages: [],
};
