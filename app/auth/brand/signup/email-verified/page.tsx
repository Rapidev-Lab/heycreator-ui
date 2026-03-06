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

// Mark as dynamic page (uses URL search params)
export const dynamic = 'force-dynamic';
const verifiedIcon =  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
  <path d="M39.9963 73.3265C58.404 73.3265 73.3265 58.404 73.3265 39.9963C73.3265 21.5885 58.404 6.66602 39.9963 6.66602C21.5885 6.66602 6.66602 21.5885 6.66602 39.9963C6.66602 58.404 21.5885 73.3265 39.9963 73.3265Z" stroke="#028759" stroke-width="4.99954" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M29.9971 39.9964L36.6631 46.6624L49.9952 33.3303" stroke="#028759" stroke-width="4.99954" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

function BrandEmailVerifiedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Wait a bit for auth state to update after verification link
        await new Promise(resolve => setTimeout(resolve, 500));

        const currentUser = auth.currentUser;
        if (!currentUser) {
          // Fallback to session storage for display
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
    // Redirect to account completion page
    router.push("/auth/brand/signup/account");
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
          <PrimaryButton onClick={() => router.push("/auth/brand/signup/email")}>
            Start Over
          </PrimaryButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8 pt-12">
        <Logo size="lg" className="justify-center mb-4" />

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24  flex items-center justify-center">
              {verifiedIcon}
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h2 className="text-black mb-3">
            Email Verified!
          </h2>
          <p className="text-[#666]">
            Your email{" "}
            <span className="font-semibold text-brand-navy-dark">{email}</span> has
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

export default function BrandEmailVerifiedPage() {
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
      <BrandEmailVerifiedContent />
    </Suspense>
  );
}
