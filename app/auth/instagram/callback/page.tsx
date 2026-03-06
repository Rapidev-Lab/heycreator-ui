"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import ErrorMessage from "@/components/auth/ErrorMessage";

/**
 * Instagram OAuth Callback Page
 *
 * This page handles the OAuth redirect from Instagram Business Login.
 * It receives the authorization code, exchanges it for a Firebase token,
 * and redirects to the welcome page with Instagram data.
 */

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

function InstagramCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    handleInstagramCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstagramCallback = async () => {
    try {
      // Get authorization code and state from URL
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorReason = searchParams.get("error_reason");
      const errorDescription = searchParams.get("error_description");
      console.log({ code, state });
      console.log(typeof code);
      // Check if user cancelled the authorization
      if (errorParam === "access_denied") {
        setError(
          errorDescription?.replace(/\+/g, " ") ||
            "You cancelled the Instagram login. Please try again."
        );
        setIsProcessing(false);
        return;
      }

      // Validate required parameters
      if (!code) {
        setError("Missing authorization code. Please try logging in again.");
        setIsProcessing(false);
        return;
      }

      // Verify state for CSRF protection (optional but recommended)
      const storedState = sessionStorage.getItem("instagram_oauth_state");
      if (storedState && state !== storedState) {
        setError("Invalid state parameter. Possible security issue detected.");
        setIsProcessing(false);
        return;
      }

      // Clear stored state
      sessionStorage.removeItem("instagram_oauth_state");

      console.log("Processing Instagram authorization code...");

      // Send authorization code to our API
      const response = await fetch("/api/auth/instagram/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, state }),
      });

      const data = await response.json();
      console.log({ POST_RESPONSE: data });

      if (!data.success) {
        throw new Error(data.error || "Failed to authenticate with Instagram");
      }

      const { customToken, instagramData, isNewUser } = data.data;

      console.log(
        "Instagram authentication successful:",
        instagramData.username
      );

      // Sign in to Firebase with custom token
      await signInWithCustomToken(auth, customToken);

      console.log("Firebase sign-in successful");

      // Store Instagram data in sessionStorage for welcome page
      sessionStorage.setItem(
        "instagram_welcome_data",
        JSON.stringify({
          username: instagramData.username,
          profilePicture: instagramData.profile_picture_url,
          followersCount: instagramData.followers_count,
          isNewUser,
        })
      );

      // Redirect to welcome page
      router.push("/auth/influencer/instagram-welcome");
    } catch (error: any) {
      console.error("Instagram callback error:", error);
      setError(
        error.message ||
          "An unexpected error occurred. Please try again or contact support."
      );
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    router.push("/auth/influencer/login");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="text-center mb-8 flex-col" />

        <AuthCard>
          <div className="text-center py-8">
            {isProcessing ? (
              <>
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#00A8CC]" />
                <h2 className="text-xl font-semibold mb-2">
                  Connecting your Instagram account...
                </h2>
                <p className="text-gray-600 text-sm">
                  Please wait while we set up your account.
                </p>
              </>
            ) : error ? (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">
                    Instagram Login Failed
                  </h2>
                </div>

                <ErrorMessage message={error} className="mb-6" />

                <button
                  onClick={handleRetry}
                  className="w-full bg-brand-navy text-white py-3 rounded-full font-medium hover:bg-brand-navy-light transition-colors"
                >
                  Back to Login
                </button>
              </>
            ) : null}
          </div>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}

export default function InstagramCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
            <Logo size="lg" className="text-center mb-8 flex-col" />
            <AuthCard>
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[#00A8CC]" />
                <h2 className="text-xl font-semibold mb-2">Loading...</h2>
              </div>
            </AuthCard>
          </div>
        </AuthLayout>
      }
    >
      <InstagramCallbackContent />
    </Suspense>
  );
}
