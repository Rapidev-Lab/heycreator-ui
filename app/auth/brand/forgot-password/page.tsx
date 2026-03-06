"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, X } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import PrimaryButton from "@/components/auth/PrimaryButton";
import { auth } from "@/lib/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFriendlyErrorMessage } from "@/lib/firebase/auth-actions";
import ErrorMessage from "@/components/auth/ErrorMessage";
import SuccessMessage from "@/components/auth/SuccessMessage";

export default function BrandForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setSuccess(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");

      setTimeout(() => {
        router.push("/auth/brand/login");
      }, 2000);
    } catch (err: any) {
      console.error("Error sending password reset email:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <AuthCard>
          {/* Header with title and close button on same line */}
          <div className="relative mb-8">
            <h2 className="text-xl font-semibold text-[#000000] text-center">
              Reset Password
            </h2>
            <button
              onClick={() => router.push("/auth/brand/login")}
              className="absolute right-0 top-0 text-black hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-brand-navy-dark mb-6 text-left leading-relaxed font-normal p-0">
            Enter the email address associated with your account, and we&apos;ll
            email you a link to reset your password
          </p>

          {error && <ErrorMessage message={error} className="mb-4" />}
          {success && <SuccessMessage message={success} className="mb-4" />}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <InputField
                label="Email"
                icon={Mail}
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <PrimaryButton type="submit" loading={loading}>
              Send reset link
            </PrimaryButton>
          </form>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
