"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Logo from "@/components/auth/Logo";
import PrimaryButton from "@/components/auth/PrimaryButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { auth } from "@/lib/firebase/config";
import { syncEmailVerification } from "@/lib/firebase/auth-actions";
import { useAuth } from "@/lib/firebase/auth-context";

// Mark as dynamic page (uses URL search params)
export const dynamic = 'force-dynamic';

function InfluencerEmailVerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Brief wait for auth state to propagate after verification link
        await new Promise(resolve => setTimeout(resolve, 500));

        const currentUser = auth.currentUser;
        if (!currentUser) {
          const storedEmail = sessionStorage.getItem("signupEmail");
          if (!storedEmail) {
            setError("No email found. Please start the signup process again.");
            setLoading(false);
            return;
          }
          setEmail(storedEmail);
          setLoading(false);
          return;
        }

        // Reload Firebase user to pick up emailVerified = true from server
        await currentUser.reload();

        const userEmail = currentUser.email || sessionStorage.getItem("signupEmail") || "";
        if (!userEmail) {
          setError("No email found. Please start the signup process again.");
          setLoading(false);
          return;
        }

        setEmail(userEmail);
        sessionStorage.setItem("signupEmail", userEmail);
        sessionStorage.setItem("emailVerified", "true");

        // Sync emailVerified = true to Firestore users doc
        await syncEmailVerification(currentUser.uid, true);

        // Update auth context so EmailVerificationGuard sees emailVerified = true
        await refreshUserProfile();

        setLoading(false);
      } catch (error: any) {
        console.error("Verification error:", error);
        setError("Failed to verify email. Please try again.");
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    // Email is verified, go to profile completion
    router.push("/auth/influencer/complete-profile");
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout>
        <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
          <Logo size="lg" className="justify-center mb-8" />
          <ErrorMessage message={error} className="mb-4" />
          <PrimaryButton onClick={() => router.push("/auth/influencer/signup/email")}>
            Start Over
          </PrimaryButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="justify-center mb-4" />

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-brand-navy mb-3">
            Email Verified!
          </h2>
          <p className="text-gray-700">
            Your email{" "}
            <span className="font-semibold text-brand-navy">{email}</span> has
            been successfully verified.
          </p>
        </div>

        {/* Continue Button */}
        <PrimaryButton onClick={handleContinue} className="w-full">
          Complete Your Profile
        </PrimaryButton>
      </div>
    </AuthLayout>
  );
}

export default function InfluencerEmailVerifiedPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </AuthLayout>
    }>
      <InfluencerEmailVerifiedContent />
    </Suspense>
  );
}
