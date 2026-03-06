"use client";

import { InputField } from "@/components/auth";
import CampaignSelectField from "@/components/campaigns/CampaignSelectField";
import FileUploadField from "@/components/campaigns/FileUploadField";
import { StepProps } from "./types";

const productTypeOptions = [
  { value: "Beauty and Skincare", label: "Beauty and Skincare" },
  { value: "Fashion & Apparel", label: "Fashion & Apparel" },
  { value: "Health & Wellness", label: "Health & Wellness" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Technology", label: "Technology" },
  { value: "Travel & Lifestyle", label: "Travel & Lifestyle" },
  { value: "physical_product", label: "Physical Product" },
  { value: "digital_product", label: "Digital Product" },
  { value: "service", label: "Service" },
  { value: "event_experience", label: "Event / Experience" },
  { value: "voucher_product", label: "Voucher Product" },
  { value: "brand_repost", label: "Brand Repost" },
];

export default function Step2Product({
  campaignData,
  setCampaignData,
  errors,
  setErrors,
}: StepProps) {
  const removeExistingProductImage = (index: number) => {
    setCampaignData((prev) => ({
      ...prev,
      uploadedProductImages: prev.uploadedProductImages.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const getProductLabel = () => {
    switch (campaignData.productType) {
      case "service":
        return "Service Name";
      case "event_experience":
        return "Event Name";
      case "brand_repost":
        return "Campaign Name";
      default:
        return "Product Name";
    }
  };

  const getProductPlaceholder = () => {
    switch (campaignData.productType) {
      case "service":
        return "e.g. Premium Subscription Plan";
      case "event_experience":
        return "e.g. Summer Music Festival 2026";
      case "brand_repost":
        return "e.g. Summer Sale Campaign";
      default:
        return "Eco-Glow SPF 50 Sunscreen";
    }
  };

  const getValueLabel = () => {
    switch (campaignData.productType) {
      case "service":
        return "Subscription Value";
      case "event_experience":
        return "Ticket Value";
      case "brand_repost":
        return "Campaign Value";
      case "voucher_product":
        return "Retail Price";
      default:
        return "Product Value";
    }
  };

  const getLinkLabel = () => {
    switch (campaignData.productType) {
      case "service":
        return "Service Link";
      case "event_experience":
        return "Event Link";
      case "brand_repost":
        return "Brand Link (Optional)";
      default:
        return "Product Link";
    }
  };

  const getLinkPlaceholder = () => {
    switch (campaignData.productType) {
      case "service":
        return "https://www.yourservice.com";
      case "event_experience":
        return "https://www.yourevent.com";
      case "brand_repost":
        return "https://www.yourbrand.com";
      default:
        return "https://www.ecoglow.co.za/products/spf-50-sunscreen";
    }
  };

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div className="border-b border-[#E0E0E0]  w-100 mx-[-1.5rem] md:mx-[-2rem] lg:mx-[-2.5rem] lg:mt-[-2.5rem] px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-6">
        <h2 className="text-xl font-bold text-brand-navy-dark">Product Details</h2>
        <p className="text-sm text-gray-500">
          What will the influencers be promoting?
        </p>
      </div>

      <div>
        <div className="space-y-6">
          {/* Product Type */}
          <CampaignSelectField
            label="Product Type *"
            value={campaignData.productType}
            onChange={(value) => {
              setCampaignData({ ...campaignData, productType: value });
              if (errors.productType) setErrors({ ...errors, productType: "" });
            }}
            options={productTypeOptions}
            placeholder="Select product type"
            error={errors.productType}
          />

          {/* Product Name */}
          <InputField
            label={`${getProductLabel()} *`}
            value={campaignData.productName}
            onChange={(e) => {
              setCampaignData({
                ...campaignData,
                productName: e.target.value,
              });
              if (errors.productName) setErrors({ ...errors, productName: "" });
            }}
            placeholder={getProductPlaceholder()}
            error={errors.productName}
          />

          {/* Content Details - Only for Brand Repost */}
          {campaignData.productType === "brand_repost" && (
            <InputField
              label="Content Details *"
              value={campaignData.contentDetails}
              onChange={(e) => {
                setCampaignData({
                  ...campaignData,
                  contentDetails: e.target.value,
                });
                if (errors.contentDetails) setErrors({ ...errors, contentDetails: "" });
              }}
              placeholder="Describe the content you want influencers to repost (e.g., product launch announcement, promotional graphics, brand message)"
              isTextArea
              error={errors.contentDetails}
            />
          )}

          {/* Access Instructions - For Service and Digital Product */}
          {(campaignData.productType === "service" ||
            campaignData.productType === "digital_product") && (
            <InputField
              label="Access Instructions *"
              value={campaignData.accessInstructions}
              onChange={(e) => {
                setCampaignData({
                  ...campaignData,
                  accessInstructions: e.target.value,
                });
                if (errors.accessInstructions) setErrors({ ...errors, accessInstructions: "" });
              }}
              placeholder="Describe how influencers will access the service (e.g., login details, coupon codes, trial setup instructions)"
              isTextArea
              error={errors.accessInstructions}
            />
          )}

          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <FileUploadField
              id="product-images-upload"
              label=""
              subLabel="Drag & drop or click to upload one or more images"
              buttonText="Upload Product Photos"
              acceptedFileTypes="image/*"
              showImagePreviews={true}
              value={campaignData.productImages}
              onChange={(files) =>
                setCampaignData((prev) => ({ ...prev, productImages: files }))
              }
              existingFiles={campaignData.uploadedProductImages}
              onRemoveExisting={removeExistingProductImage}
            />
          </div>

          {/* Product Value and Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label={getValueLabel()}
              type="number"
              min={0}
              step="1"
              value={campaignData.productValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || Number(val) >= 0) {
                  setCampaignData((prev) => ({
                    ...prev,
                    productValue: val,
                  }));
                }
                if (errors.productValue)
                  setErrors((prev) => ({ ...prev, productValue: "" }));
              }}
              placeholder="450"
              error={errors.productValue}
              className="h-[50px] px-4 py-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD]"
            />
            <InputField
              label={getLinkLabel()}
              value={campaignData.productLink}
              onChange={(e) => {
                setCampaignData((prev) => ({
                  ...prev,
                  productLink: e.target.value,
                }));
                if (errors.productLink)
                  setErrors((prev) => ({ ...prev, productLink: "" }));
              }}
              placeholder={getLinkPlaceholder()}
              error={errors.productLink}
              className="h-[50px] px-4 py-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD]"
            />
          </div>

          {/* Voucher Product Options */}
          {campaignData.productType === "voucher_product" && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-4 p-3 bg-white border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="reimburseWithVoucher"
                      checked={campaignData.reimburseWithVoucher}
                      onChange={(e) =>
                        setCampaignData({
                          ...campaignData,
                          reimburseWithVoucher: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-[#00A8CC] focus:ring-[#00A8CC] cursor-pointer"
                    />
                    <label
                      htmlFor="reimburseWithVoucher"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Will reimburse influencer for purchase (with a voucher)
                    </label>
                  </div>
                  {campaignData.reimburseWithVoucher && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reimbursement Amount *
                      </label>
                      <input
                        type="text"
                        value={campaignData.reimbursementAmount || ""}
                        onChange={(e) => {
                          setCampaignData({
                            ...campaignData,
                            reimbursementAmount: e.target.value,
                          });
                          if (errors.reimbursementAmount) setErrors({ ...errors, reimbursementAmount: "" });
                        }}
                        placeholder="e.g. R1,500 (full cost) or R1,000 (partial)"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent ${
                          errors.reimbursementAmount ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      {errors.reimbursementAmount && (
                        <p className="text-xs text-red-500 mt-1">{errors.reimbursementAmount}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center px-4 py-3 gap-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD]">
                <input
                  type="checkbox"
                  id="keepProductAsGiftVoucher"
                  checked={campaignData.keepProductAsGift}
                  onChange={(e) =>
                    setCampaignData({
                      ...campaignData,
                      keepProductAsGift: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-[#00A8CC] focus:ring-[#00A8CC] cursor-pointer"
                />
                <label
                  htmlFor="keepProductAsGiftVoucher"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Influencer keeps product after campaign
                </label>
              </div>
            </div>
          )}

          {/* Keep Product As Gift - For Physical Product */}
          {campaignData.productType === "physical_product" && (
            <div className="flex items-center px-4 py-3 gap-3 rounded-[10px] border border-[#E0E0E0] bg-[#F8F9FD]">
              <input
                type="checkbox"
                id="keepProductAsGift"
                checked={campaignData.keepProductAsGift}
                onChange={(e) =>
                  setCampaignData({
                    ...campaignData,
                    keepProductAsGift: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-gray-300 text-[#00A8CC] focus:ring-[#00A8CC] cursor-pointer"
              />
              <label
                htmlFor="keepProductAsGift"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Keeps product as gift
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
