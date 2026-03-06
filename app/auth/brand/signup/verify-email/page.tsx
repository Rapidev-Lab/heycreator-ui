"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { auth } from "@/lib/firebase/config";
import { sendEmailVerification } from "firebase/auth";

export default function BrandVerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from session storage
    const signupEmail = sessionStorage.getItem("signupEmail");
    if (!signupEmail) {
      // No email found, redirect back to signup
      router.push("/auth/brand/signup/email");
      return;
    }
    setEmail(signupEmail);
  }, [router]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        setError("Session expired. Please start the signup process again.");
        setTimeout(() => router.push("/auth/brand/signup/email"), 2000);
        return;
      }

      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/brand/signup/email-verified`,
        handleCodeInApp: false,
      });

      setSuccessMessage("Verification email sent! Please check your inbox.");
      setCanResend(false);
      setCountdown(60); // 60 seconds cooldown
    } catch (error: any) {
      console.error("Resend error:", error);
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/auth/brand/signup/email");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-brand-navy hover:text-[#00A8CC] mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="font-medium">Back</span>
        </button>

        <Logo size="lg" className="justify-center" />

        <AuthCard>
          <div className="text-center mb-4">
            <p className="text-sm text-brand-navy-dark mb-10">Register as a Brand</p>
            <h2 className="text-2xl font-bold text-brand-navy-dark mb-4">
              Verify your Email
            </h2>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-brand-navy-dark">
              Please check your email{" "}
              <span className="font-semibold">{email}</span> and
              click the verification link to continue.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 text-center">
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && <ErrorMessage message={error} className="mb-4" />}

          {/* Resend Link */}
          <div className="text-center mb-1">
            <p className="text-sm text-[#666]">
              Didn&apos;t receive the link?{" "}
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-brand-navy-dark hover:text-brand-navy font-medium transition-colors underline disabled:opacity-50"
                >
                  Resend
                </button>
              ) : (
                <span className="text-gray-400">
                  Resend in {countdown}s
                </span>
              )}
            </p>
          </div>

          {/* Spam Folder Hint */}
          <div className="text-center">
            <p className="text-sm text-[#666]">Or check your spam folder</p>
          </div>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
