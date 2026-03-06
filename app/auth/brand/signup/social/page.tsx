"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Instagram, Facebook, Twitter, Linkedin, Link } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import SteppedProgressIndicator from "@/components/auth/SteppedProgressIndicator";
import LinearProgressBar from "@/components/auth/LinearProgressBar";
import PrimaryButton from "@/components/auth/PrimaryButton";
import OutlineButton from "@/components/auth/OutlineButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { useBrandSignup } from "@/lib/contexts/BrandSignupContext";
import {
  completeBrandSignupAfterVerification,
  getFriendlyErrorMessage,
} from "@/lib/firebase/auth-actions";
import { BrandSignupData } from "@/types/firebase";
import { useAuth } from "@/lib/firebase/auth-context";

// TikTok SVG icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function BrandSignupSocialPage() {
  const router = useRouter();
  const { signupData, clearSignupData } = useBrandSignup();
  const { firebaseUser, loading: authLoading, refreshUserProfile } = useAuth();

  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Load existing data from context
  useEffect(() => {
    if (signupData.instagram) setInstagram(signupData.instagram);
    if (signupData.tiktok) setTiktok(signupData.tiktok);
    if (signupData.facebook) setFacebook(signupData.facebook);
    if (signupData.twitter) setTwitter(signupData.twitter);
    if (signupData.linkedin) setLinkedin(signupData.linkedin);
  }, [signupData]);

  const createBrandAccount = async () => {
    // Detect social auth - password is not required for social auth users
    const authProvider = typeof window !== 'undefined'
      ? sessionStorage.getItem('authProvider') || ''
      : '';
    const isSocialAuth = ['google', 'facebook', 'apple'].includes(authProvider);

    // Validate required fields from previous steps
    if (!signupData.fullName || !signupData.email || (!isSocialAuth && !signupData.password)) {
      setGeneralError(
        "Missing account information. Please go back and complete all steps."
      );
      return;
    }

    if (
      !signupData.companyName ||
      !signupData.industry ||
      !signupData.companySize
    ) {
      setGeneralError(
        "Missing company information. Please go back and complete all steps."
      );
      return;
    }

    setLoading(true);
    setGeneralError("");

    try {
      if (!firebaseUser) {
        setGeneralError(
          "Authentication session expired. Please sign in again."
        );
        router.push("/auth/brand/login");
        return;
      }

      // Combine all data from the 3 steps
      const completeData: BrandSignupData = {
        fullName: signupData.fullName,
        email: signupData.email,
        ...(isSocialAuth ? {} : {
          password: signupData.password!,
          confirmPassword: signupData.confirmPassword || signupData.password!,
        }),
        phoneNumber: signupData.phoneNumber,
        companyName: signupData.companyName,
        website: signupData.website,
        industry: signupData.industry!,
        companySize: signupData.companySize!,
        instagram,
        tiktok,
        facebook,
        twitter,
        linkedin,
      };

      // Complete brand signup (creates Firestore profile)
      await completeBrandSignupAfterVerification(firebaseUser.uid, completeData);

      // Clear signup data from context and session
      clearSignupData(); // This now also clears brandSignupData from sessionStorage
      sessionStorage.removeItem("signupEmail");
      sessionStorage.removeItem("tempPassword");
      sessionStorage.removeItem("signupUid");
      sessionStorage.removeItem("emailVerified");

      // Refresh auth context so dashboard has the complete profile
      await refreshUserProfile();

      // Navigate to dashboard
      router.push("/brands/dashboard");
    } catch (error: any) {
      console.error("Brand signup error:", error);
      setGeneralError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBrandAccount();
  };

  const handleSkip = async () => {
    await createBrandAccount();
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
            <LinearProgressBar current={3} total={3} label="Social Media" />
          </div>

          {/* Desktop Progress - SteppedProgressIndicator */}
          <div className="hidden md:block">
            <SteppedProgressIndicator
              currentStep={3}
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
            <h3 className="text-lg font-semibold text-brand-navy-dark mb-1">
              Connect Social Media
            </h3>
            <p className="text-sm text-gray-600">
              Connect your social media platforms to track campaign performance
              in real-time
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {generalError && (
              <ErrorMessage message={generalError} className="mb-4" />
            )}

            <div className="space-y-2 mb-6">
              {/* Instagram */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Instagram className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="@username or profile URL"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
                  />
                </div>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center hover:bg-brand-navy-light transition-colors"
                >
                  <Link className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* TikTok */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TikTok
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <TikTokIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="@username or profile URL"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
                  />
                </div>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center hover:bg-brand-navy-light transition-colors"
                >
                  <Link className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Facebook */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Facebook className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="@username or profile URL"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
                  />
                </div>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center hover:bg-brand-navy-light transition-colors"
                >
                  <Link className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Twitter / X */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter / X
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Twitter className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="@username or profile URL"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
                  />
                </div>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center hover:bg-brand-navy-light transition-colors"
                >
                  <Link className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* LinkedIn */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Linkedin className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="@username or profile URL"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00A8CC]"
                  />
                </div>
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center hover:bg-brand-navy-light transition-colors"
                >
                  <Link className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <PrimaryButton
                type="submit"
                loading={loading}
              >
                Save and Continue
              </PrimaryButton>

              <OutlineButton
                onClick={handleSkip}
                type="button"
                disabled={loading}
              >
                Skip for Now
              </OutlineButton>

              <button
                onClick={() => router.push("/auth/brand/signup/company")}
                type="button"
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
              >
                Back
              </button>
            </div>
          </form>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
