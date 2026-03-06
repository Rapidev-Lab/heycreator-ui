"use client";

import styles from "@/components/campaigns/visibility.module.css";
import CampaignInputField from "@/components/campaigns/CampaignInputField";
import CampaignSelectField from "@/components/campaigns/CampaignSelectField";
import CampaignMultiSelectField from "@/components/campaigns/CampaignMultiSelectField";
import FileUploadField from "@/components/campaigns/FileUploadField";
import { StepProps, categoryOptions } from "./types";

export default function Step1Details({
  campaignData,
  setCampaignData,
  errors,
  setErrors,
}: StepProps) {
  const handleCategoryToggle = (categoryValue: string) => {
    setCampaignData((prev) => {
      const currentCategories = prev.campaignCategories || [];
      const isSelected = currentCategories.includes(categoryValue);

      const newCategories = isSelected
        ? currentCategories.filter((cat) => cat !== categoryValue)
        : [...currentCategories, categoryValue];

      return {
        ...prev,
        campaignCategories: newCategories,
      };
    });
    if (errors.campaignCategories) setErrors({ ...errors, campaignCategories: "" });
  };

  // Handlers for removing existing uploaded files
  const removeExistingCampaignAsset = (index: number) => {
    setCampaignData((prev) => ({
      ...prev,
      uploadedCampaignAssets: prev.uploadedCampaignAssets.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const removeExistingMoodBoard = (index: number) => {
    setCampaignData((prev) => ({
      ...prev,
      uploadedMoodBoard: prev.uploadedMoodBoard.filter((_, i) => i !== index),
    }));
  };

  const removeExistingCampaignBrief = (index: number) => {
    setCampaignData((prev) => ({
      ...prev,
      uploadedCampaignBrief: prev.uploadedCampaignBrief.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const removeExistingContractNDA = (index: number) => {
    setCampaignData((prev) => ({
      ...prev,
      uploadedContractNDA: prev.uploadedContractNDA.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  return (
    <>
    <div className="space-y-10">
      {/* Section Header */}
      <div className="border-b border-[#E0E0E0]  w-100 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-brand-navy-dark">Campaign Details</h2>
        <p className="text-sm text-gray-500">
          Basic information about your campaign.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-8">
        {/* Campaign Title */}
        <CampaignInputField
          label="Campaign Title *"
          value={campaignData.title}
          onChange={(e) => {
            setCampaignData({ ...campaignData, title: e.target.value });
            if (errors.title) setErrors({ ...errors, title: "" });
          }}
          placeholder="e.g. Summer Collection Launch 2025"
          error={errors.title}
        />

        {/* Campaign Visibility Section */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-brand-navy-dark">
            Campaign Visibility
          </label>
          {/* Row on desktop, Stacked on mobile */}
          <div className="flex flex-col md:flex-row gap-4">
            <VisibilityOption
              type="public"
              active={campaignData.visibility === "public"}
              onClick={() =>
                setCampaignData({ ...campaignData, visibility: "public" })
              }
            />
            <VisibilityOption
              type="private"
              active={campaignData.visibility === "private"}
              onClick={() =>
                setCampaignData({ ...campaignData, visibility: "private" })
              }
            />
          </div>
        </div>

        {/* Campaign Objectives */}
        <CampaignSelectField
          label="Campaign Objective"
          value={campaignData.objectives}
          onChange={(value) => {
            setCampaignData({ ...campaignData, objectives: value });
            if (errors.objectives) setErrors({ ...errors, objectives: "" });
          }}
          options={[
            { value: "brand_awareness", label: "Brand Awareness" },
            { value: "engagement", label: "Engagement" },
            { value: "sales", label: "Sales / Conversions" },
            { value: "traffic", label: "Website Traffic" },
          ]}
          placeholder="Select campaign objective"
          error={errors.objectives}
        />

        {/* Campaign Category - Multi-select */}
        <div className="space-y-3">
          {campaignData.campaignCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {campaignData.campaignCategories.map((catValue) => {
                const label = categoryOptions.find(
                  (o) => o.value === catValue,
                )?.label;
                return (
                  <span
                    key={catValue}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-navy text-white rounded-full text-sm font-medium"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(catValue)}
                      className="hover:text-gray-300 transition-colors text-lg leading-none"
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          <CampaignMultiSelectField
            label="Campaign Category"
            selectedValues={campaignData.campaignCategories}
            onToggle={handleCategoryToggle}
            options={categoryOptions}
            placeholder="Select category"
            error={errors.campaignCategories}
            required
          />
        </div>

        {/* Key Performance Indicators */}
        <CampaignInputField
          label="Key Performance Indicators (KPIs)"
          value={campaignData.KPIs}
          onChange={(e) => {
            setCampaignData({ ...campaignData, KPIs: e.target.value });
            if (errors.KPIs) setErrors({ ...errors, KPIs: "" });
          }}
          placeholder="e.g. Reach 500K impressions, Generate 10K+ engagements, Drive 2K+ website visits"
          error={errors.KPIs}
        />

        {/* Description */}
        <CampaignInputField
          label="Description *"
          value={campaignData.description}
          onChange={(e) => {
            setCampaignData({
              ...campaignData,
              description: e.target.value,
            });
            if (errors.description) setErrors({ ...errors, description: "" });
          }}
          placeholder="Describe your campaign, target audience, and key messages"
          isTextArea
          error={errors.description}
        />

        {/* Campaign Assets & Mood Board */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploadField
            id="campaign-assets-upload"
            label="Campaign Assets"
            subLabel="PNG, JPG, PDF up to 10MB"
            buttonText="Upload Campaign Assets"
            acceptedFileTypes="image/*,.pdf,.doc,.docx,.ppt,.pptx,.zip"
            multiple={true}
            showImagePreviews={true}
            value={campaignData.campaignAssets}
            onChange={(files) =>
              setCampaignData({ ...campaignData, campaignAssets: files })
            }
            existingFiles={campaignData.uploadedCampaignAssets}
            onRemoveExisting={removeExistingCampaignAsset}
          />

          <FileUploadField
            id="mood-board-upload"
            label="Mood Board"
            subLabel="PPT, PDF, Word or images up to 10MB"
            buttonText="Upload Mood Board"
            acceptedFileTypes="image/*,.pdf,.doc,.docx,.ppt,.pptx"
            multiple={true}
            showImagePreviews={true}
            value={campaignData.moodBoard}
            onChange={(files) =>
              setCampaignData({ ...campaignData, moodBoard: files })
            }
            existingFiles={campaignData.uploadedMoodBoard}
            onRemoveExisting={removeExistingMoodBoard}
          />
        </div>

        {/* Documents & Contracts */}
        <div className="mt-12">
          <h3 className="text-lg font-bold text-brand-navy-dark mb-6">
            Documents & Contracts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploadField
              id="campaign-brief-upload"
              label="Campaign Brief"
              subLabel="PDF, DOCX (Optional)"
              buttonText="Upload Campaign Brief"
              acceptedFileTypes=".pdf,.doc,.docx"
              multiple={true}
              showImagePreviews={false}
              value={campaignData.campaignBrief}
              onChange={(files) =>
                setCampaignData({ ...campaignData, campaignBrief: files })
              }
              existingFiles={campaignData.uploadedCampaignBrief}
              onRemoveExisting={removeExistingCampaignBrief}
            />

            <FileUploadField
              id="contract-nda-upload"
              label="Contract / NDA"
              subLabel="PDF Only"
              buttonText="Upload Contract / NDA"
              acceptedFileTypes=".pdf"
              multiple={true}
              showImagePreviews={false}
              value={campaignData.contractNDA}
              onChange={(files) =>
                setCampaignData({ ...campaignData, contractNDA: files })
              }
              existingFiles={campaignData.uploadedContractNDA}
              onRemoveExisting={removeExistingContractNDA}
            />
          </div>
        </div>
      </div>
    </div>
    </>

    
  );

  interface VisibilityOptionProps {
    type: "public" | "private";
    active: boolean;
    onClick: () => void;
  }

  function VisibilityOption({ type, active, onClick }: VisibilityOptionProps) {
    return (
      <div
        onClick={onClick}
        className={`flex-1 flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          active ? "border-brand-navy-dark bg-blue-50/30" : "border-gray-100 bg-white"
        }`}
      >
        {/* Custom Radio Circle */}
        <div
          className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full border-2 ${
            active ? "border-brand-navy-dark" : "border-gray-300"
          }`}
        >
          {active && <div className="w-2.5 h-2.5 rounded-full bg-brand-navy-dark" />}
        </div>

        {/* Text Content */}
        <div className="flex flex-col">
          <span className="font-bold text-brand-navy-dark text-base">
            {type === "public" ? "Public" : "Private"}
          </span>
          <span className="text-xs text-gray-500 leading-tight">
            {type === "public"
              ? "Visible to all influencers on the marketplace"
              : "Only visible to invited influencers"}
          </span>
        </div>
      </div>
    );
  }
}
