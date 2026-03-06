"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import ProgressDots from "@/components/auth/ProgressDots";
import GoBackButton from "@/components/auth/GoBackButton";
import PrimaryButton from "@/components/auth/PrimaryButton";
import { AuthFooter } from "@/components/auth";

export default function VerifySuccessPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/influencers");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        {/* <Logo size="lg" className="text-center mb-8" /> */}

        <AuthCard>
          <div className="relative mb-14">
            {/* Go back button on the left */}
            <GoBackButton href="/auth/influencer/verify/social" className="absolute left-0 top-1/2 transform -translate-y-1/2" />
            {/* ProgressDots centered horizontally */}
            <div className="flex justify-center">
              <ProgressDots total={3} current={3} />
            </div>
          </div>

          <div className="text-center mb-12 bg-[#EEEDED] p-3 rounded-3xl space-y-4 ">
            <p>Verified by HeyCreator</p>
            {/* Success illustration */}
            <div className="flex justify-center mb-6">
              <Image
                src="/verify-success.svg"
                alt="Verification Success"
                width={400}
                height={300}
                className="w-full max-w-sm"
              />
            </div>
            <p className="text-xs">Congrats! Your YouTube is verified by HeyCreator successfully</p>

            {/* Verified Account Box */}
            <div className="bg-white rounded-3xl py-2 px-3 shadow-sm border border-gray-100 mb-6">
              <p className=" font-medium text-gray-900">
                @VerifiedAccount
              </p>
            </div>
          </div>

          <PrimaryButton onClick={handleContinue}>Let&apos;s go!</PrimaryButton>
        </AuthCard>
        <AuthFooter />
      </div>
    </AuthLayout>
  );
}
