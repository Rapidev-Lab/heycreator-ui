"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe, Briefcase, Users } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import SteppedProgressIndicator from "@/components/auth/SteppedProgressIndicator";
import LinearProgressBar from "@/components/auth/LinearProgressBar";
import InputField from "@/components/auth/InputField";
import SelectField from "@/components/auth/SelectField";
import PrimaryButton from "@/components/auth/PrimaryButton";
import OutlineButton from "@/components/auth/OutlineButton";
import { useBrandSignup } from "@/lib/contexts/BrandSignupContext";
import { IndustryType, CompanySize } from "@/types/firebase";

const INDUSTRY_OPTIONS = [
  { value: "Automotive", label: "Automotive" },
  { value: "Beauty & Cosmetics", label: "Beauty & Cosmetics" },
  { value: "Education", label: "Education" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "Fashion & Apparel", label: "Fashion & Apparel" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Finance", label: "Finance" },
  { value: "Gaming", label: "Gaming" },
  { value: "Health & Wellness", label: "Health & Wellness" },
  { value: "Home & Garden", label: "Home & Garden" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Sports & Fitness", label: "Sports & Fitness" },
  { value: "Technology", label: "Technology" },
  { value: "Travel & Hospitality", label: "Travel & Hospitality" },
  { value: "Other", label: "Other" },
];

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export default function BrandSignupCompanyPage() {
  const router = useRouter();
  const { signupData, updateSignupData } = useBrandSignup();

  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validate session and load existing data from context
  useEffect(() => {
    const signupEmail = sessionStorage.getItem("signupEmail");
    if (!signupEmail) {
      router.push("/auth/brand/signup/email");
      return;
    }

    if (signupData.companyName) setCompanyName(signupData.companyName);
    if (signupData.website) setCompanyWebsite(signupData.website);
    if (signupData.industry) setIndustry(signupData.industry);
    if (signupData.companySize) setCompanySize(signupData.companySize);
  }, [signupData, router]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    // Very lenient URL validation - accepts almost any format
    if (companyWebsite && companyWebsite.trim()) {
      const trimmedUrl = companyWebsite.trim();
      // Accepts: example.com, www.example.com, https://example.com, example, www.*, sitename, etc.
      // Just check for basic characters - allow letters, numbers, dots, hyphens, slashes, colons
      // Minimum 2 characters
      if (trimmedUrl.length < 2 || !/^[\w.-]+([:\/][\w./-]*)?$/i.test(trimmedUrl)) {
        newErrors.companyWebsite = "Please enter a valid website or company name";
      }
    }

    if (!industry) {
      newErrors.industry = "Please select an industry";
    }

    if (!companySize) {
      newErrors.companySize = "Please select company size";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Save to context
    updateSignupData({
      companyName,
      website: companyWebsite,
      industry: industry as IndustryType,
      companySize: companySize as CompanySize,
    });

    // Navigate to next step
    router.push("/auth/brand/signup/social");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="justify-center mb-6" />

        <AuthCard>
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-brand-navy-dark mb-2">
              Create Your Brand Account
            </h2>
            <p className="text-sm text-gray-600">
              Join heycreator to manage campaigns and connect with influencers
            </p>
          </div>

          {/* Mobile Progress - LinearProgressBar */}
          <div className="block md:hidden mb-6">
            <LinearProgressBar current={2} total={3} label="Brand Info" />
          </div>

          {/* Desktop Progress - SteppedProgressIndicator */}
          <div className="hidden md:block">
            <SteppedProgressIndicator
              currentStep={2}
              steps={[
                { number: 1, label: "Account" },
                { number: 2, label: "Brand Info" },
                { number: 3, label: "Social Media" },
              ]}
              className="mb-8"
            />
          </div>

          {/* Section Title */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-navy mb-1">
              Brand Information
            </h3>
            <p className="text-sm text-gray-600">
              Tell us about your brand or company
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <InputField
                label="Brand/Company Name"
                icon={Building2}
                type="text"
                placeholder="Your brand name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                error={errors.companyName}
                required
              />

              <InputField
                label="Website (Optional)"
                icon={Globe}
                type="text"
                placeholder="https://www.yourbrand.com"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                error={errors.companyWebsite}
              />

              <SelectField
                label="Industry"
                icon={Briefcase}
                value={industry}
                onChange={setIndustry}
                options={INDUSTRY_OPTIONS}
                placeholder="Select your industry"
                error={errors.industry}
                required
              />

              <SelectField
                label="Company Size"
                icon={Users}
                value={companySize}
                onChange={setCompanySize}
                options={COMPANY_SIZE_OPTIONS}
                placeholder="Select company size"
                error={errors.companySize}
                required
              />
            </div>

            <div className="space-y-3">
              <PrimaryButton type="submit">
                Continue
              </PrimaryButton>

              <OutlineButton
                onClick={() => router.push("/auth/brand/signup/account")}
                type="button"
              >
                Back
              </OutlineButton>
            </div>
          </form>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
