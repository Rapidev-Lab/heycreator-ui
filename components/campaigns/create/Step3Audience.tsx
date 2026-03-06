"use client";

import { InputField } from "@/components/auth";
import StyledSelect from "@/components/auth/StyledSelect";
import { StepProps, genderOptions } from "./types";

export default function Step3Audience({
  campaignData,
  setCampaignData,
  errors,
  setErrors,
}: StepProps) {
  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="border-b border-[#E0E0E0]  w-100 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-brand-navy-dark">Target Audience</h2>
        <p className="text-sm text-gray-500">
          Who are we trying to reach?
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Demographics */}
        <div>
          <h3 className="text-base font-semibold text-brand-navy mb-4">
            Demographics
          </h3>
          <div className="space-y-6">
            {/* Age Min and Age Max */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Age Min"
                type="number"
                placeholder="18"
                min={0}
                value={campaignData.ageRangeFrom}
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    ageRangeFrom: e.target.value,
                  });
                  if (errors.ageRangeFrom) setErrors({ ...errors, ageRangeFrom: "" });
                }}
                className="h-[50px] px-4 py-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD] flex items-center"
                error={errors.ageRangeFrom}
              />
              <InputField
                label="Age Max"
                type="number"
                placeholder="35"
                min={0}
                value={campaignData.ageRangeTo}
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    ageRangeTo: e.target.value,
                  });
                  if (errors.ageRangeTo) setErrors({ ...errors, ageRangeTo: "" });
                }}
                className="h-[50px] px-4 py-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD] flex items-center"
                error={errors.ageRangeTo}
              />
            </div>
            {/* Gender */}
            <StyledSelect
              label="Gender"
              value={campaignData.gender}
              onChange={(value) =>
                setCampaignData({ ...campaignData, gender: value })
              }
              options={genderOptions}
              placeholder="Select Gender"
              variant="A"
            />
            {/* Target Location */}
            <div>
              <InputField
                label="Target Location"
                placeholder="e.g. Western Cape, Johannesburg"
                value={campaignData.location}
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    location: e.target.value,
                  });
                  if (errors.location) setErrors({ ...errors, location: "" });
                }}
                className="h-[50px] px-4 py-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD] flex items-center"
                error={errors.location}
              />
              <p className="text-xs text-gray-500 mt-1">
                Where should the audience be located?
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Influencer Criteria & Interests */}
        <div>
          <h3 className="text-base font-semibold text-brand-navy mb-4">
            Influencer Criteria & Interests
          </h3>
          <div className="space-y-6">
            {/* Interests & Affinities */}
            <InputField
              label="Interests & Affinities"
              placeholder="e.g. Sustainability, Tech, Vegan Food"
              value={campaignData.interests}
              onChange={(e) => {
                setCampaignData({
                  ...campaignData,
                  interests: e.target.value,
                });
                if (errors.interests) setErrors({ ...errors, interests: "" });
              }}
              className="h-[50px] px-4 py-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD] flex items-center"
              error={errors.interests}
            />
            {/* Min Followers and Min Engagement */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Min Followers"
                type="number"
                placeholder="5000"
                min={0}
                value={campaignData.minFollowers}
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    minFollowers: e.target.value,
                  });
                  if (errors.minFollowers) setErrors({ ...errors, minFollowers: "" });
                }}
                className="h-[50px] px-4 py-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD] flex items-center"
                error={errors.minFollowers}
              />
              <InputField
                label="Min Engagement (%)"
                type="number"
                placeholder="2.5"
                min={0}
                step={0.1}
                value={campaignData.minEngagementRate}
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    minEngagementRate: e.target.value,
                  });
                  if (errors.minEngagementRate) setErrors({ ...errors, minEngagementRate: "" });
                }}
                className="h-[50px] px-4 py-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD] flex items-center"
                error={errors.minEngagementRate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
