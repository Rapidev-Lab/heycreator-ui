"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Logo from "@/components/auth/Logo";
import PrimaryButton from "@/components/auth/PrimaryButton";

const verifiedIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
  >
    <path
      d="M39.9963 73.3265C58.404 73.3265 73.3265 58.404 73.3265 39.9963C73.3265 21.5885 58.404 6.66602 39.9963 6.66602C21.5885 6.66602 6.66602 21.5885 6.66602 39.9963C6.66602 58.404 21.5885 73.3265 39.9963 73.3265Z"
      stroke="#028759"
      strokeWidth="4.99954"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M29.9971 39.9964L36.6631 46.6624L49.9952 33.3303"
      stroke="#028759"
      strokeWidth="4.99954"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function InfluencerResetSuccessPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/auth/influencer/login");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8 pt-12">
        {/* Logo */}
        <Logo size="lg" className="justify-center mb-14" />

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-24 h-24 flex items-center justify-center">
              {verifiedIcon}
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-2">
          <h2 className="text-2xl font-bold text-black mb-4">
            Password Reset Successful
          </h2>
          <p className="text-brand-navy-dark">
            Your password has been successfully reset. You can now sign in with
            your new password.
          </p>
        </div>

        {/* Sign In Button */}
        <PrimaryButton onClick={handleSignIn} className="w-full">
          Sign In
        </PrimaryButton>
      </div>
    </AuthLayout>
  );
}
