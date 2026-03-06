"use client";

import { Info } from "lucide-react";
import { InputField } from "@/components/auth";
import { SelectField } from "@/components/auth";
import { StepProps } from "./types";

export default function Step4Budget({
  campaignData,
  setCampaignData,
  errors,
  setErrors,
}: StepProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="border-b border-[#E0E0E0]  w-100 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-brand-navy-dark">Budget & Timeline</h2>
        <p className="text-sm text-gray-500">
          Define the investment and schedule.
        </p>
      </div>

      <div>
        <div className="space-y-6">
          {/* Compensation Model */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Compensation Model
              </label>
              <div className="flex rounded-lg overflow-hidden border border-gray-300">
                <button
                  type="button"
                  onClick={() =>
                    setCampaignData({
                      ...campaignData,
                      compensationModel: "fixed",
                    })
                  }
                  className={`px-6 py-2 text-sm font-medium transition-colors ${
                    campaignData.compensationModel === "fixed"
                      ? "bg-brand-navy text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Fixed
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCampaignData({
                      ...campaignData,
                      compensationModel: "range",
                    })
                  }
                  className={`px-6 py-2 text-sm font-medium transition-colors ${
                    campaignData.compensationModel === "range"
                      ? "bg-brand-navy text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Range
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <Info className="w-4 h-4 text-gray-400" />
              <span>
                {campaignData.compensationModel === "fixed"
                  ? "You set a fixed price. Influencers cannot negotiate."
                  : "You set a price range. Influencers can negotiate within this range."}
              </span>
            </div>
          </div>

          {/* Currency */}
          <SelectField
            label="Currency"
            value={campaignData.currency}
            onChange={(value) =>
              setCampaignData({ ...campaignData, currency: value })
            }
            options={[
              { value: "ZAR", label: "ZAR" },
              { value: "USD", label: "USD" },
              { value: "EUR", label: "EUR" },
              { value: "GBP", label: "GBP" },
            ]}
            placeholder="Select currency"
          />

          {/* Fixed Amount or Range */}
          {campaignData.compensationModel === "fixed" ? (
            <InputField
              label="Fixed Amount"
              type="number"
              placeholder="2500"
              min={0}
              value={campaignData.fixedAmount}
              onChange={(e) => {
                setCampaignData({
                  ...campaignData,
                  fixedAmount: e.target.value,
                });
                if (errors.fixedAmount) setErrors({ ...errors, fixedAmount: "" });
              }}
              error={errors.fixedAmount}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Budget From"
                type="number"
                placeholder="e.g. 5000"
                min={0}
                value={campaignData.budgetFrom}
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    budgetFrom: e.target.value,
                  });
                  if (errors.budgetFrom) setErrors({ ...errors, budgetFrom: "" });
                }}
                error={errors.budgetFrom}
              />
              <InputField
                label="Budget To"
                type="number"
                placeholder="e.g. 15000"
                min={0}
                value={campaignData.budgetTo}
                onChange={(e) => {
                  setCampaignData({
                    ...campaignData,
                    budgetTo: e.target.value,
                  });
                  if (errors.budgetTo) setErrors({ ...errors, budgetTo: "" });
                }}
                error={errors.budgetTo}
              />
            </div>
          )}

          {/* Payment Terms */}
          <InputField
            label="Payment Terms"
            value={campaignData.paymentTerms}
            onChange={(e) =>
              setCampaignData({
                ...campaignData,
                paymentTerms: e.target.value,
              })
            }
            placeholder="Tell creators about your payment terms"
            isTextArea
          />

          {/* Allow Bids Marketplace Toggle */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-brand-navy uppercase">
                  Allow Bids Marketplace
                </h4>
                <p className="text-sm text-gray-500">
                  This campaign will be visible. You will Get Influencers Price
                  Quotes
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCampaignData({
                    ...campaignData,
                    allowBidsMarketplace: !campaignData.allowBidsMarketplace,
                  })
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  campaignData.allowBidsMarketplace
                    ? "bg-brand-navy"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    campaignData.allowBidsMarketplace
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Timeline - 2 rows, responsive layout */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  value={campaignData.applicationDeadline}
                  min={today}
                  onChange={(e) => {
                    setCampaignData({
                      ...campaignData,
                      applicationDeadline: e.target.value,
                    });
                    if (errors.applicationDeadline) setErrors({ ...errors, applicationDeadline: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] ${
                    errors.applicationDeadline ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.applicationDeadline ? (
                  <p className="text-xs text-red-500 mt-1">{errors.applicationDeadline}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Last day for creators to apply
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Creation Period
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={campaignData.contentCreationStart}
                    min={campaignData.applicationDeadline || today}
                    onChange={(e) =>
                      setCampaignData({
                        ...campaignData,
                        contentCreationStart: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
                  />
                  <input
                    type="date"
                    value={campaignData.contentCreationEnd}
                    min={campaignData.contentCreationStart || today}
                    onChange={(e) => {
                      setCampaignData({
                        ...campaignData,
                        contentCreationEnd: e.target.value,
                      });
                      if (errors.contentCreationEnd) setErrors({ ...errors, contentCreationEnd: "" });
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] ${
                      errors.contentCreationEnd ? "border-red-400" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.contentCreationEnd ? (
                  <p className="text-xs text-red-500 mt-1">{errors.contentCreationEnd}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Content creation and approval period
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Start *
                </label>
                <input
                  type="date"
                  value={campaignData.startDate}
                  min={campaignData.applicationDeadline || today}
                  onChange={(e) => {
                    setCampaignData({
                      ...campaignData,
                      startDate: e.target.value,
                    });
                    if (errors.startDate) setErrors({ ...errors, startDate: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] ${
                    errors.startDate ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.startDate ? (
                  <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Campaign goes live</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign End *
                </label>
                <input
                  type="date"
                  value={campaignData.endDate}
                  min={campaignData.startDate || today}
                  onChange={(e) => {
                    setCampaignData({
                      ...campaignData,
                      endDate: e.target.value,
                    });
                    if (errors.endDate) setErrors({ ...errors, endDate: "" });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A8CC] ${
                    errors.endDate ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.endDate ? (
                  <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Last day of live content
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
