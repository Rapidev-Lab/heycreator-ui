"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import GoBackButton from "@/components/auth/GoBackButton";
import SocialAuthButton from "@/components/auth/SocialAuthButton";
import DividerWithText from "@/components/auth/DividerWithText";
import InputField from "@/components/auth/InputField";
import PrimaryButton from "@/components/auth/PrimaryButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import {
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
  getFriendlyErrorMessage,
  createTemporaryEmailAccount,
} from "@/lib/firebase/auth-actions";
import { useAuth } from "@/lib/firebase/auth-context";

export default function BrandSignupEmailPage() {
  const router = useRouter();
  const { redirectBasedOnRole } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSocialAuth = async (provider: string) => {
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (provider === "google") {
        userCredential = await signInWithGoogle("brand");
      } else if (provider === "facebook") {
        userCredential = await signInWithFacebook("brand");
      } else if (provider === "apple") {
        userCredential = await signInWithApple("brand");
      } else {
        setError(`${provider} sign-in is not supported.`);
        setLoading(false);
        return;
      }

      // Social auth email is already verified
      // Store email and redirect to account completion
      sessionStorage.setItem("signupEmail", userCredential.user.email || "");
      sessionStorage.setItem("emailVerified", "true");
      sessionStorage.setItem("authProvider", provider);
      router.push("/auth/brand/signup/account");
    } catch (error: any) {
      console.error("Social auth error:", error);
      setError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Create temporary Firebase account and send verification email
      const { userCredential, tempPassword } = await createTemporaryEmailAccount(email, 'brand');

      // Store email and temp password in session for next steps
      sessionStorage.setItem("signupEmail", email);
      sessionStorage.setItem("tempPassword", tempPassword);
      sessionStorage.setItem("signupUid", userCredential.user.uid);

      // Redirect to verification pending page
      router.push("/auth/brand/signup/verify-email");
    } catch (error: any) {
      console.error("Email signup error:", error);
      setError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8 pt-12">
        <Logo size="lg" className="justify-center" />

        <AuthCard>
          <GoBackButton href="/auth/brand/login" className="mb-4" />

          <div className="text-center mb-6">
            <h2 className="text-sm text-brand-navy-dark">
              Register as a Brand
            </h2>
          </div>

          {/* Error Message */}
          {error && <ErrorMessage message={error} className="mb-4" />}

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4 mb-6">
            <InputField
              label="Email"
              icon={Mail}
              type="email"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PrimaryButton type="submit" loading={loading}>
              Register
            </PrimaryButton>
          </form>

          {/* Divider */}
          <DividerWithText text="Or continue with" className="mb-6" />

          {/* Social Auth Buttons */}
          <div className="space-y-3">
            <div className="flex justify-center gap-4">
              <SocialAuthButton
                provider="facebook"
                onClick={() => handleSocialAuth("facebook")}
                disabled={loading}
                iconOnly
              />
              <SocialAuthButton
                provider="google"
                onClick={() => handleSocialAuth("google")}
                disabled={loading}
                iconOnly
              />
              <SocialAuthButton
                provider="apple"
                onClick={() => handleSocialAuth("apple")}
                disabled={loading}
                iconOnly
              />
            </div>
          </div>

          {/* Sign In Link */}
          {/* <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/brand/login")}
                className="text-[#00A8CC] hover:text-brand-navy font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div> */}
        </AuthCard>
      </div>
      <div></div>
    </AuthLayout>
  );
}
