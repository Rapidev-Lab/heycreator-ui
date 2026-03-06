"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import SocialAuthButton from "@/components/auth/SocialAuthButton";
import DividerWithText from "@/components/auth/DividerWithText";
import InputField from "@/components/auth/InputField";
import PasswordInputField from "@/components/auth/PasswordInputField";
import PrimaryButton from "@/components/auth/PrimaryButton";
import OutlineButton from "@/components/auth/OutlineButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import AuthFooter from "@/components/auth/AuthFooter";
import GoBackButton from "@/components/auth/GoBackButton";
import TabSelector from "@/components/auth/TabSelector";
import PhoneNumberInput from "@/components/auth/PhoneNumberInput";
import { auth } from "@/lib/firebase/config";
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
  sendPhoneVerificationCode,
  requiresEmailVerification,
  getFriendlyErrorMessage,
  getInstagramOAuthUrl,
} from "@/lib/firebase/auth-actions";
import EmailVerificationModal from "@/components/auth/EmailVerificationModal";
import { signOut as firebaseSignOut } from "firebase/auth";
import { usePhoneAuth } from "@/lib/contexts/PhoneAuthContext";
import { useAuth } from "@/lib/firebase/auth-context";

export default function InfluencerLoginPage() {
  return (
    <Suspense>
      <InfluencerLoginContent />
    </Suspense>
  );
}

function InfluencerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setConfirmationResult } = usePhoneAuth();
  const { redirectBasedOnRole, refreshUserProfile } = useAuth();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  // Store redirect URL from query params on mount
  useEffect(() => {
    const redirectUrl = searchParams.get("redirect");
    if (redirectUrl) {
      sessionStorage.setItem("authRedirect", redirectUrl);
    }
  }, [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+27");
  const [loading, setLoading] = useState(false);

  // Separate error states for different auth methods
  const [socialAuthError, setSocialAuthError] = useState("");
  const [emailLoginError, setEmailLoginError] = useState("");
  const [phoneLoginError, setPhoneLoginError] = useState("");

  // Email verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const handleSocialAuth = async (provider: string) => {
    setLoading(true);
    setSocialAuthError("");
    setEmailLoginError("");
    setPhoneLoginError("");

    try {
      if (provider === "instagram") {
        // Instagram uses OAuth redirect flow, not popup
        const instagramOAuthUrl = getInstagramOAuthUrl();
        window.location.href = instagramOAuthUrl;
        return; // Don't set loading to false, page will redirect
      } else if (provider === "google") {
        await signInWithGoogle("influencer");
      } else if (provider === "facebook") {
        await signInWithFacebook("influencer");
      } else if (provider === "apple") {
        await signInWithApple("influencer");
      } else {
        setSocialAuthError(`${provider} sign-in is not supported.`);
        setLoading(false);
        return;
      }

      // Re-fetch profile from Firestore — on first sign-up, the onAuthStateChanged
      // callback fires before signInWithGoogle creates the user document, leaving
      // userProfile null. This ensures the context has the profile before redirecting.
      await refreshUserProfile();
      redirectBasedOnRole("influencer");
    } catch (error: any) {
      console.error("Social auth error:", error);
      setSocialAuthError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  setLoading(true);
  setEmailLoginError("");

  const sessStorage = sessionStorage.getItem("authRedirect");
  
  try {
    const userCredential = await signInWithEmail(email, password, 'influencer');
    const user = userCredential.user;
    
    // 1. CHECK REDIRECT FIRST
    // If we have a redirect URL, we ignore the verification status for now
    // and let them proceed to their destination.
    if (sessStorage) {
      console.log("Redirecting to reserved URL:", sessStorage);
      sessionStorage.removeItem("authRedirect");
      router.push(sessStorage);
      return; // Stop execution here
    }

    // 2. CHECK VERIFICATION SECOND
    // Only enforce the "Verification Modal" if there is NO redirect URL.
    if (requiresEmailVerification(user)) {
      setUnverifiedEmail(user.email || email);
      setShowVerificationModal(true);

      // Sign out because they aren't allowed on the general dashboard yet
      await firebaseSignOut(auth);
      setLoading(false);
      return;
    }

    // 3. FALLBACK: Standard dashboard redirect
    redirectBasedOnRole("influencer");
    } catch (error: any) {
      console.error("Login error:", error);

      // Check if error might be due to unverified email
      if (error.code === "auth/invalid-credential") {
        try {
          // Check if this email exists and is unverified
          const response = await fetch("/api/auth/check-email-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          const data = await response.json();

          if (data.success && data.exists && !data.emailVerified) {
            // Email exists but is not verified - show verification modal
            setUnverifiedEmail(email);
            setShowVerificationModal(true);
            setLoading(false);
            return;
          }
        } catch (checkError) {
          console.error("Error checking email status:", checkError);
        }
      }

      // Show friendly error message
      setEmailLoginError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification from modal
  const handleResendVerification = async () => {
    try {
      // Re-login temporarily to send verification (no role check — we just need to resend)
      const userCredential = await signInWithEmail(email, password);
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userCredential.user.uid }),
      });

      const data = await response.json();

      // Sign out again
      await firebaseSignOut(auth);

      if (!data.success) {
        throw new Error(data.error || "Failed to resend verification email");
      }
    } catch (error: any) {
      console.error("Error resending verification:", error);
      throw error;
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPhoneLoginError("");

    const fullPhoneNumber = `${countryCode}${phone.replace(/\s/g, "")}`;
    if (!fullPhoneNumber) {
      setPhoneLoginError("Phone number is required.");
      setLoading(false);
      return;
    }

    try {
      const confirmationResult = await sendPhoneVerificationCode(
        fullPhoneNumber,
        "recaptcha-container"
      );
      setConfirmationResult(confirmationResult);
      // Store role and phone for OTP page
      sessionStorage.setItem("phoneAuthRole", "influencer");
      sessionStorage.setItem("phoneAuthNumber", fullPhoneNumber);
      router.push("/auth/otp?role=influencer"); // Redirect to OTP page with role
    } catch (error: any) {
      console.error("Error requesting phone verification code:", error);
      setPhoneLoginError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Preserve redirect param when navigating to signup
    const redirectUrl = sessionStorage.getItem("authRedirect");
    const signupUrl = redirectUrl
      ? `/auth/influencer/signup/email?redirect=${encodeURIComponent(redirectUrl)}`
      : "/auth/influencer/signup/email";
    router.push(signupUrl);
  };

  const handleForgotPassword = () => {
    router.push("/auth/influencer/forgot-password");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="justify-center" />

        <AuthCard>
          <GoBackButton href="/" className="mb-4" />

          <div className="text-center mb-6">
            <h2 className="text-sm text-brand-navy">Login as a Creator</h2>
          </div>

          {/* Tab Selector */}
          <TabSelector
            tabs={[
              { id: "email", label: "Email", icon: Mail, width: "w-2/5" },
              {
                id: "phone",
                label: "Phone number",
                icon: Phone,
                width: "w-3/5",
              },
            ]}
            activeTab={loginMethod}
            onChange={(tab) => setLoginMethod(tab as "email" | "phone")}
            className="mb-6"
          />

          <div className="space-y-4 mb-4">
            {loginMethod === "email" ? (
              <>
                {/* Email login error - displayed at top of email form */}
                {emailLoginError && (
                  <ErrorMessage message={emailLoginError} className="mb-4" />
                )}

                <InputField
                  label="Email"
                  icon={Mail}
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <PasswordInputField
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </>
            ) : (
              <>
                {/* Phone login error - displayed at top of phone form */}
                {phoneLoginError && (
                  <ErrorMessage message={phoneLoginError} className="mb-4" />
                )}
                <PhoneNumberInput
                  label="Phone number"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  countryCode={countryCode}
                  onCountryCodeChange={setCountryCode}
                  required
                />
                <span className="text-sm">
                  We&apos;ll send you a verification code
                </span>
              </>
            )}
          </div>

          {/* Forgot password link */}
          {loginMethod === "email" && (
            <div className="text-right mb-6">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-brand-navy hover:text-[#00A8CC] font-medium transition-colors underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <PrimaryButton
            type="submit"
            loading={loading}
            className="mb-4"
            onClick={loginMethod === "phone" ? handleRequestCode : handleLogin}
          >
            {loginMethod === "phone" ? "Request Code" : "Login"}
          </PrimaryButton>

          {loginMethod === "email" ? (
            <>
              <DividerWithText text="or" className="mb-4" />
              <OutlineButton onClick={handleRegister}>Register</OutlineButton>
            </>
          ) : (
            ""
          )}

          <DividerWithText text="Or continue with" className="my-6" />

          {/* Social Auth Buttons - includes Instagram for influencers */}
          <div className="space-y-3 mb-6">
            {/* Social auth error - displayed at top of social block */}
            {socialAuthError && (
              <ErrorMessage message={socialAuthError} className="mb-3" />
            )}
            <div className="flex justify-center gap-4">
              <SocialAuthButton
                provider="facebook"
                onClick={() => handleSocialAuth("facebook")}
                iconOnly
              />
              <SocialAuthButton
                provider="google"
                onClick={() => handleSocialAuth("google")}
                iconOnly
              />
              <SocialAuthButton
                provider="apple"
                onClick={() => handleSocialAuth("apple")}
                iconOnly
              />
              {/* <SocialAuthButton
                provider="instagram"
                onClick={() => handleSocialAuth("instagram")}
                iconOnly
              /> */}
            </div>
          </div>
        </AuthCard>
        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
      <AuthFooter />
      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showVerificationModal}
        email={unverifiedEmail}
        onClose={() => setShowVerificationModal(false)}
        onResendVerification={handleResendVerification}
      />
    </AuthLayout>
  );
}
