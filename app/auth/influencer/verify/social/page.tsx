"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import ProgressDots from "@/components/auth/ProgressDots";
import GoBackButton from "@/components/auth/GoBackButton";
import SocialVerifyButton from "@/components/auth/SocialVerifyButton";
import PrimaryButton from "@/components/auth/PrimaryButton";
import Image from "next/image";
import { AuthFooter } from "@/components/auth";

export default function SocialVerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  // Load email from session storage
  useEffect(() => {
    const signupEmail = sessionStorage.getItem("signupEmail");
    const emailVerified = sessionStorage.getItem("emailVerified");

    if (!signupEmail || emailVerified !== "true") {
      // No verified email, redirect back to email signup
      router.push("/auth/influencer/signup/email");
      return;
    }

    setEmail(signupEmail);
  }, [router]);

  const handleSocialVerify = (_provider: string) => {
    // Social verification not yet available
  };

  const handleHeyCreatorVerify = () => {
    // HeyCreator verification not yet available
  };

  const handleSkip = () => {
    // Clear signup data from session
    sessionStorage.removeItem("signupEmail");
    sessionStorage.removeItem("tempPassword");
    sessionStorage.removeItem("signupUid");
    sessionStorage.removeItem("emailVerified");
    sessionStorage.removeItem("authProvider");

    // Navigate directly to influencer dashboard
    router.push("/influencers");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        {/* <Logo size="lg" className="text-center mb-8 flex-col" /> */}

        <AuthCard>
          <div className="relative mb-8">
            {/* Go back button on the left */}
            <GoBackButton href="/auth/influencer/signup/email" className="absolute left-0 top-1/2 transform -translate-y-1/2" />
            {/* ProgressDots centered horizontally */}
            <div className="flex justify-center">
              <ProgressDots total={3} current={2} />
            </div>
          </div>

          <button
            onClick={handleHeyCreatorVerify}
            disabled
            className="w-full bg-[#EDF7FD] text-[#1AA3D8] font-medium py-3.5 px-4 rounded-3xl transition-colors duration-200 flex items-center relative mb-4 opacity-50 cursor-not-allowed"
          >
            {/* Icon on the left */}
            <div className="absolute left-4 flex items-center justify-center w-7 h-7">
              <Image
                src="/verified-icon.svg"
                alt="Verified"
                width={28}
                height={28}
                className="w-7 h-7"
              />
            </div>

            {/* Centered text */}
            <span className="text-sm flex-1 text-center pl-6 whitespace-nowrap">
              Get verified by HeyCreator
            </span>
          </button>

          <div className="space-y-4 mb-6 bg-[#EEEDED] p-4 rounded-3xl">
            <SocialVerifyButton
              provider="instagram"
              onClick={() => handleSocialVerify("Instagram")}
              disabled
            />
            <SocialVerifyButton
              provider="twitter"
              onClick={() => handleSocialVerify("X")}
              disabled
            />
            <SocialVerifyButton
              provider="tiktok"
              onClick={() => handleSocialVerify("TikTok")}
              disabled
            />
            <SocialVerifyButton
              provider="youtube"
              onClick={() => handleSocialVerify("Youtube")}
              disabled
            />
          </div>

          <PrimaryButton onClick={handleSkip}>
            Skip
          </PrimaryButton>
        </AuthCard>
        <AuthFooter />
      </div>
    </AuthLayout>
  );
}
