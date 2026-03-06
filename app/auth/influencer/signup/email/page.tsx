"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function InfluencerSignupEmailPage() {
  return (
    <Suspense>
      <InfluencerSignupEmailContent />
    </Suspense>
  );
}

function InfluencerSignupEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redirectBasedOnRole } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Store redirect URL from query params on mount
  useEffect(() => {
    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl) {
      sessionStorage.setItem("authRedirect", redirectUrl);
    }
  }, [searchParams]);

  const handleSocialAuth = async (provider: string) => {
    setLoading(true);
    setError("");

    try {
      let userCredential;
      if (provider === "google") {
        userCredential = await signInWithGoogle("influencer");
      } else if (provider === "facebook") {
        userCredential = await signInWithFacebook("influencer");
      } else if (provider === "apple") {
        userCredential = await signInWithApple("influencer");
      } else {
        setError(`${provider} sign-in is not supported.`);
        setLoading(false);
        return;
      }

      // Social auth email is already verified
      // Check if there's a redirect URL stored (from shared campaign link)
      const storedRedirect = sessionStorage.getItem("authRedirect");
      if (storedRedirect) {
        // Redirect directly to the campaign
        redirectBasedOnRole("influencer");
      } else {
        // Normal flow - redirect to account completion
        sessionStorage.setItem("signupEmail", userCredential.user.email || "");
        sessionStorage.setItem("emailVerified", "true");
        sessionStorage.setItem("authProvider", provider);
        router.push("/auth/influencer/verify/social");
      }
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Create temporary Firebase account and send verification email
      const { userCredential, tempPassword } = await createTemporaryEmailAccount(email, 'influencer');

      // Store email, temp password, and uid in session for next steps
      sessionStorage.setItem("signupEmail", email);
      sessionStorage.setItem("tempPassword", tempPassword);
      sessionStorage.setItem("signupUid", userCredential.user.uid);

      // Check if there's a redirect URL stored (from shared campaign link)
      const storedRedirect = sessionStorage.getItem("authRedirect");
      if (storedRedirect) {
        // Skip verification and redirect directly to the campaign
        // Verification email was already sent, user can verify later
        redirectBasedOnRole("influencer");
      } else {
        // Normal flow - redirect to verification pending page
        router.push("/auth/influencer/signup/verify-email");
      }
    } catch (error: any) {
      console.error("Email signup error:", error);
      setError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="justify-center mb-8" />

        <AuthCard>
          <GoBackButton href="/auth/influencer/login" className="mb-4" />

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-brand-navy">
              Register as a Creator
            </h2>
          </div>

          {error && <ErrorMessage message={error} className="mb-4" />}

          <form onSubmit={handleEmailSubmit} className="space-y-4 mb-6">
            <InputField
              label="Email"
              icon={Mail}
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PrimaryButton type="submit" loading={loading}>
              Register
            </PrimaryButton>
          </form>

          <DividerWithText text="Or continue with" className="mb-6" />

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

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/influencer/login")}
                className="text-[#00A8CC] hover:text-brand-navy font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
