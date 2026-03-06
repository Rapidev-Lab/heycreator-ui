"use client";

import {
  DollarSign,
  Calendar,
  Globe,
  Users,
  Check,
  Package,
  Info,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Download,
} from "lucide-react";
import Tag from "@/components/ui/Tag";
import CreatorPreviewBanner from "@/components/campaigns/CreatorPreviewBanner";
import SecondaryOutlinedButton from "@/components/ui/SecondaryOutlinedButton";
import DisplayTask from "@/components/campaigns/DisplayTask";
import VisibilitySelector from "@/components/campaigns/VisibilitySelector";
import { StepProps } from "./types";

interface Step6ReviewProps extends StepProps {
  setStep: (step: number) => void;
}

// Helper function to get currency symbol
const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    ZAR: "R",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] || currency;
};

// InfoRow component for review display
const InfoRow = ({
  label,
  value,
  fallback = "Not specified",
}: {
  label: string;
  value: string | number | null | undefined;
  fallback?: string;
}) => (
  <div className="flex items-center gap-2">
    {label && <span className="text-sm text-gray-500">{label}:</span>}
    <span className="text-sm font-medium text-gray-900">
      {value || fallback}
    </span>
  </div>
);

// Helper to determine if a file is an image
const isImageFile = (file: { name: string; type?: string; url?: string }) => {
  const name = file.name?.toLowerCase() || "";
  const type = file.type || "";
  return (
    type.startsWith("image/") || name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)
  );
};

// File display component for review
const FilePreview = ({
  files,
  newFiles,
  title,
  showAsGrid = false,
}: {
  files: Array<{ name: string; url: string; type?: string }>;
  newFiles: File[];
  title: string;
  showAsGrid?: boolean;
}) => {
  const hasFiles = files.length > 0 || newFiles.length > 0;

  if (!hasFiles) {
    return (
      <div className="text-sm text-gray-400 italic">
        No {title.toLowerCase()} uploaded
      </div>
    );
  }

  if (showAsGrid) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {files.map((file, index) => (
          <div key={`existing-${index}`} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {isImageFile(file) ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-1 right-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-3 h-3 text-gray-600" />
            </a>
          </div>
        ))}
        {newFiles.map((file, index) => (
          <div key={`new-${index}`} className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-blue-200">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <span className="absolute bottom-1 left-1 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded">
              New
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={`existing-${index}`}
          className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">{file.name}</span>
          </div>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 flex-shrink-0"
          >
            <ExternalLink className="w-3 h-3" />
            View
          </a>
        </div>
      ))}
      {newFiles.map((file, index) => (
        <div
          key={`new-${index}`}
          className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-gray-700 truncate">{file.name}</span>
            <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded flex-shrink-0">
              New
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Step6Review({
  campaignData,
  setCampaignData,
  setStep,
}: Step6ReviewProps) {
  return (
    <div className="space-y-6">
      {/* Creator Preview Banner */}
      <CreatorPreviewBanner />

      {/* Campaign Preview Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Card Header with Tags and Edit Button */}
        <div className="p-4 md:p-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Tag
                text={
                  campaignData.campaignCategories.length > 0
                    ? campaignData.campaignCategories.join(", ")
                    : "Category"
                }
                variant="default"
                size="md"
              />
              <Tag text="Active Campaign" variant="success" size="md" showDot />
            </div>
            <SecondaryOutlinedButton
              label="Edit Campaign"
              onClick={() => setStep(1)}
            />
          </div>

          {/* Campaign Title */}
          <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">
            {campaignData.title || "Campaign Title"}
          </h2>

          {/* Campaign Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {campaignData.description || "No description provided."}
          </p>

          {/* Key Info Grid - Responsive */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 p-4 md:p-[17px] rounded-[14px] border border-[#E0E0E0] bg-[#F8F9FD]">
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                COMPENSATION
              </p>
              <p className="text-sm md:text-[17px] font-bold text-brand-navy-dark leading-tight md:leading-7">
                {campaignData.compensationModel === "fixed"
                  ? `${getCurrencySymbol(campaignData.currency)}${campaignData.fixedAmount || "0"}`
                  : `${getCurrencySymbol(campaignData.currency)}${campaignData.budgetFrom || "0"} - ${getCurrencySymbol(campaignData.currency)}${campaignData.budgetTo || "0"}`}
              </p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                DEADLINE
              </p>
              <p className="text-sm md:text-[17px] font-bold text-brand-navy-dark leading-tight md:leading-7">
                {campaignData.applicationDeadline || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                LOCATION
              </p>
              <p className="text-sm md:text-[17px] font-bold text-brand-navy-dark leading-tight md:leading-7 truncate">
                {campaignData.location || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                MIN FOLLOWERS
              </p>
              <p className="text-sm md:text-[17px] font-bold text-brand-navy-dark leading-tight md:leading-7">
                {campaignData.minFollowers
                  ? `${Number(campaignData.minFollowers).toLocaleString()}+`
                  : "Not set"}
              </p>
            </div>
          </div>

          {/* Campaign Tags - Responsive */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-4">
            {campaignData.productValue && (
              <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-[#E6F9EF] text-[#00A86B] text-xs md:text-base font-medium rounded-[10px] border border-[#B8F0D3]">
                <Check className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">
                  Free Product ({getCurrencySymbol(campaignData.currency)}
                  {campaignData.productValue} value)
                </span>
                <span className="sm:hidden">Free Product</span>
              </span>
            )}
            {campaignData.productType === "physical_product" && (
              <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-[#E8F4FA] text-[#5B9BD5] text-xs md:text-base font-medium rounded-[10px] border border-[#C4DEF0]">
                <Check className="w-4 h-4 md:w-5 md:h-5" />
                Product Shipped
              </span>
            )}
            {campaignData.allowBidsMarketplace && (
              <span className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-[#F5EEFA] text-[#9B59B6] text-xs md:text-base font-medium rounded-[10px] border border-[#E4D1F0]">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
                Open to Bids
              </span>
            )}
          </div>

          {/* Quick Edit Links - Responsive */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 pt-4 mt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex h-7 px-3 py-1.5 justify-center items-center rounded-[10px] bg-[#F8F9FD] text-xs md:text-sm text-gray-500 hover:text-[#00A8CC] transition-colors"
            >
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex h-7 px-3 py-1.5 justify-center items-center rounded-[10px] bg-[#F8F9FD] text-xs md:text-sm text-gray-500 hover:text-[#00A8CC] transition-colors"
            >
              Edit Product
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex h-7 px-3 py-1.5 justify-center items-center rounded-[10px] bg-[#F8F9FD] text-xs md:text-sm text-gray-500 hover:text-[#00A8CC] transition-colors"
            >
              Edit Budget
            </button>
          </div>
        </div>
      </div>

      {/* Ideal Creator Profile */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#E0E0E0] flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-[16px] font-semibold text-brand-navy-dark">
              Ideal Creator Profile
            </h3>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {/* Demographics */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 md:mb-4">
                Demographics
              </p>
              <div className="space-y-2">
                <InfoRow
                  label="Age Range"
                  value={
                    campaignData.ageRangeFrom && campaignData.ageRangeTo
                      ? `${campaignData.ageRangeFrom}-${campaignData.ageRangeTo}`
                      : null
                  }
                />
                <InfoRow label="Gender" value={campaignData.gender} />
              </div>
            </div>
            {/* Audience Size */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 md:mb-4">
                Audience Size
              </p>
              <div className="space-y-2">
                <InfoRow
                  label="Min Followers"
                  value={
                    campaignData.minFollowers
                      ? `${Number(campaignData.minFollowers).toLocaleString()}+`
                      : null
                  }
                />
                <InfoRow
                  label="Min Engagement"
                  value={
                    campaignData.minEngagementRate
                      ? `${campaignData.minEngagementRate}%`
                      : null
                  }
                />
              </div>
            </div>
            {/* Interests */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 md:mb-4">
                Interests
              </p>
              <InfoRow
                label=""
                value={campaignData.interests}
                fallback="Not specified"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Objectives */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-brand-navy">
              Campaign Objectives
            </h3>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="px-4 md:px-6 pb-4 md:pb-6 pt-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {campaignData.objectives || "No objectives specified."}
          </p>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-brand-navy">
              Key Performance Indicators
            </h3>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            {campaignData.KPIs || "No KPIs specified."}
          </p>
        </div>
      </div>

      {/* Documents & Assets */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-brand-navy">
              Documents & Assets
            </h3>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="p-4 md:p-6 space-y-6">
          {/* Campaign Assets */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Campaign Assets
            </h4>
            <FilePreview
              files={campaignData.uploadedCampaignAssets}
              newFiles={campaignData.campaignAssets}
              title="campaign assets"
              showAsGrid={false}
            />
          </div>

          {/* Mood Board */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Mood Board
            </h4>
            <FilePreview
              files={campaignData.uploadedMoodBoard}
              newFiles={campaignData.moodBoard}
              title="mood board images"
              showAsGrid={true}
            />
          </div>

          {/* Campaign Brief */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Campaign Brief
            </h4>
            <FilePreview
              files={campaignData.uploadedCampaignBrief}
              newFiles={campaignData.campaignBrief}
              title="campaign brief"
              showAsGrid={false}
            />
          </div>

          {/* Contract / NDA */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contract / NDA
            </h4>
            <FilePreview
              files={campaignData.uploadedContractNDA}
              newFiles={campaignData.contractNDA}
              title="contracts"
              showAsGrid={false}
            />
          </div>
        </div>
      </div>

      {/* Product Details - Responsive layout */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-brand-navy">
              Product Details
            </h3>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            {/* Product Image */}
            <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center flex-shrink-0 overflow-hidden">
              {campaignData.uploadedProductImages.length > 0 ? (
                <img
                  src={campaignData.uploadedProductImages[0].url}
                  alt={campaignData.uploadedProductImages[0].name || "Product"}
                  className="w-full h-full object-cover"
                />
              ) : campaignData.productImages.length > 0 ? (
                <img
                  src={URL.createObjectURL(campaignData.productImages[0])}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Package className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Product Image</span>
                </>
              )}
            </div>
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg md:text-xl font-semibold text-brand-navy mb-1">
                {campaignData.productName || "Product Name"}
              </h4>
              <p className="text-brand-navy font-medium mb-3 md:mb-4">
                Value: {getCurrencySymbol(campaignData.currency)}
                {campaignData.productValue || "0.00"}
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Description
                  </p>
                  <p className="text-sm text-gray-700">
                    {campaignData.contentDetails ||
                      "No product description provided."}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Product Link
                  </p>
                  {campaignData.productLink ? (
                    <a
                      href={campaignData.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-navy hover:underline break-all"
                    >
                      {campaignData.productLink}
                    </a>
                  ) : (
                    <p className="text-sm text-brand-navy">
                      No product link provided.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You Need to Deliver */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-brand-navy">
                What You Need to Deliver
              </h3>
              <p className="text-sm text-gray-500">
                {campaignData.taskDeliverables.length} deliverable
                {campaignData.taskDeliverables.length !== 1 ? "s" : ""} required
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
        <DisplayTask
          deliverables={campaignData.taskDeliverables}
          onAddClick={() => setStep(5)}
        />
      </div>

      {/* Content Guidelines - Do's and Don'ts */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-brand-navy">
              Content Guidelines
            </h3>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Do's Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-green-500">✓</span>
                <h4 className="font-semibold text-gray-900">Do&apos;s</h4>
              </div>
              <div className="space-y-3">
                {campaignData.dos.length > 0 ? (
                  campaignData.dos.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 py-2 px-3 bg-green-50 rounded-lg"
                    >
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No guidelines specified
                  </p>
                )}
              </div>
            </div>

            {/* Don'ts Column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-red-500">✗</span>
                <h4 className="font-semibold text-gray-900">Don&apos;ts</h4>
              </div>
              <div className="space-y-3">
                {campaignData.donts.length > 0 ? (
                  campaignData.donts.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 py-2 px-3 bg-red-50 rounded-lg"
                    >
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No guidelines specified
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Requirements */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#E0E0E0]">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-brand-navy">
              Additional Requirements
            </h3>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
        </div>
        <div className="p-4 md:p-6 space-y-6">
          {/* Required Hashtags */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Required Hashtags
            </p>
            <div className="flex flex-wrap gap-2">
              {campaignData.requiredHashtags.length > 0 ? (
                campaignData.requiredHashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-brand-navy text-white text-sm font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No hashtags specified
                </p>
              )}
            </div>
          </div>

          {/* Required Mentions / Tags */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Required Mentions / Tags
            </p>
            <div className="flex py-3 px-4 items-center rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD]">
              <p className="text-sm text-gray-700 break-all">
                {campaignData.mentionsTags.length > 0
                  ? campaignData.mentionsTags.join(" ")
                  : "No mentions specified"}
              </p>
            </div>
          </div>

          {/* Application Questions */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Application Questions
            </p>
            <div className="space-y-2">
              {campaignData.screeningQuestions.length > 0 ? (
                campaignData.screeningQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 py-3 px-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <span className="text-sm font-medium text-gray-500 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <span className="text-sm text-gray-700">
                      {q.question || "No question text"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No screening questions specified
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visibility & Settings */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-brand-navy">
            Visibility & Settings
          </h3>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-sm md:text-[14px] text-brand-navy-dark font-medium hover:opacity-70 transition-opacity"
          >
            Edit
          </button>
        </div>
        <div className="p-4 md:p-6">
          <VisibilitySelector
            value={campaignData.visibility}
            onChange={(value) =>
              setCampaignData({ ...campaignData, visibility: value })
            }
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Ready to publish?</p>
          <p className="text-blue-700">
            Once published, your campaign will be live and creators can start
            applying. You can edit campaign details anytime from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
