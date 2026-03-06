"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Users, Instagram } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import PrimaryButton from "@/components/auth/PrimaryButton";

/**
 * Instagram Welcome & Profile Confirmation Page
 *
 * This page demonstrates the immediate use of instagram_business_basic permission.
 * It displays the influencer's Instagram profile data (username, profile picture,
 * follower count) that was fetched using the granted permissions.
 *
 * This is the key screen for Meta App Review screencast - it shows a clear
 * end-to-end experience of how the requested permission is used.
 */

interface InstagramWelcomeData {
  username: string;
  profilePicture?: string;
  followersCount?: number;
  isNewUser: boolean;
}

interface ProfileCompletionData {
  email: string;
  phoneNumber?: string;
}

export default function InstagramWelcomePage() {
  const router = useRouter();
  const [instagramData, setInstagramData] = useState<InstagramWelcomeData | null>(null);
  const [email, setEmail] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get Instagram data from sessionStorage
    const storedData = sessionStorage.getItem("instagram_welcome_data");

    if (!storedData) {
      // No data found, redirect back to login
      router.push("/auth/influencer/login");
      return;
    }

    try {
      const data = JSON.parse(storedData);
      setInstagramData(data);
    } catch (error) {
      console.error("Error parsing Instagram data:", error);
      router.push("/auth/influencer/login");
    }
  }, [router]);

  const handleContinue = () => {
    // For new users, show email collection form
    if (instagramData?.isNewUser) {
      setShowEmailForm(true);
    } else {
      // Existing users go straight to dashboard
      sessionStorage.removeItem("instagram_welcome_data");

      // Option 1: Dashboard (overview of everything)
      router.push("/influencers");

      // Option 2: Campaign marketplace (if they want to browse right away)
      // router.push("/influencers/marketplace");

      // Option 3: Applications (if they want to check status)
      // router.push("/influencers/campaign-applications");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get current user ID
      const userId = auth.currentUser?.uid;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      // Update user email via API
      const response = await fetch("/api/auth/update-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId, // Temporary header for development
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to update email");
      }

      // Clear welcome data and redirect to dashboard
      sessionStorage.removeItem("instagram_welcome_data");

      // Option 1: Redirect to dashboard (if implemented)
      router.push("/influencers");

      // Option 2: Redirect to campaign marketplace (for new users to browse)
      // router.push("/influencers/marketplace");

      // Option 3: Redirect to profile page (to complete profile)
      // router.push("/influencers/profiles");
    } catch (error) {
      console.error("Email update error:", error);
      setError("Failed to update email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!instagramData) {
    return (
      <AuthLayout>
        <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
          <Logo size="lg" className="text-center mb-8 flex-col" />
          <AuthCard>
            <div className="text-center py-8">
              <p className="text-gray-600">Loading...</p>
            </div>
          </AuthCard>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="text-center mb-8 flex-col" />

        <AuthCard>
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FD5949] via-[#D6249F] to-[#285AEB] rounded-full p-1 mx-auto">
                {instagramData.profilePicture ? (
                  <img
                    src={instagramData.profilePicture}
                    alt={instagramData.username}
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                    <Instagram className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-brand-navy mb-2">
              Welcome, @{instagramData.username}!
            </h1>
            <p className="text-gray-600 text-sm">
              We&apos;ve successfully connected your Instagram Business profile to Hey Creator.
            </p>
          </div>

          {/* Instagram Stats Card */}
          <div className="bg-gradient-to-br from-[#FD5949]/10 via-[#D6249F]/10 to-[#285AEB]/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-[#D6249F]" />
                <span className="font-semibold text-gray-800">
                  Instagram Profile Connected
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>

            {instagramData.followersCount !== undefined && (
              <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A8CC] to-brand-navy rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-navy">
                    {instagramData.followersCount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
              </div>
            )}
          </div>

          {/* What's Next Section */}
          <div className="bg-[#EEEDED] rounded-2xl p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-[#00A8CC]">✓</span> What&apos;s Next?
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#00A8CC] font-bold mt-0.5">1.</span>
                <span>Complete your Hey Creator profile with additional information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00A8CC] font-bold mt-0.5">2.</span>
                <span>Discover brand campaigns that match your niche</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00A8CC] font-bold mt-0.5">3.</span>
                <span>Start collaborating with brands and grow your influence</span>
              </li>
            </ul>
          </div>

          {/* Email Collection Form (for new users) */}
          {showEmailForm ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800 mb-2">
                  📧 We need your email address to send you campaign notifications and important updates.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address<span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A8CC] focus:border-transparent outline-none"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <PrimaryButton
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  Continue
                </PrimaryButton>
              </div>
            </form>
          ) : (
            <>
              {/* Continue Button */}
              <PrimaryButton onClick={handleContinue} className="mb-4">
                {instagramData.isNewUser ? "Complete My Profile" : "Go to Dashboard"}
              </PrimaryButton>

              {/* Additional Info */}
              <p className="text-xs text-center text-gray-500">
                {instagramData.isNewUser
                  ? "Your account has been created successfully."
                  : "Welcome back! Your Instagram data has been updated."}
              </p>
            </>
          )}
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
