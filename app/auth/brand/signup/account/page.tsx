"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone } from "lucide-react";
import { updatePassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import Logo from "@/components/auth/Logo";
import SteppedProgressIndicator from "@/components/auth/SteppedProgressIndicator";
import LinearProgressBar from "@/components/auth/LinearProgressBar";
import InputField from "@/components/auth/InputField";
import PasswordInputField from "@/components/auth/PasswordInputField";
import PhoneNumberInput from "@/components/auth/PhoneNumberInput";
import PrimaryButton from "@/components/auth/PrimaryButton";
import OutlineButton from "@/components/auth/OutlineButton";
import ErrorMessage from "@/components/auth/ErrorMessage";
import { useBrandSignup } from "@/lib/contexts/BrandSignupContext";
import { getFriendlyErrorMessage } from "@/lib/firebase/auth-actions";

export default function BrandSignupAccountPage() {
  const router = useRouter();
  const { signupData, updateSignupData } = useBrandSignup();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+27");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLocked, setEmailLocked] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSocialAuth, setIsSocialAuth] = useState(false);

  // Load verified email from session storage
  useEffect(() => {
    const signupEmail = sessionStorage.getItem("signupEmail");
    const emailVerified = sessionStorage.getItem("emailVerified");
    const signupUid = sessionStorage.getItem("signupUid");
    const authProvider = sessionStorage.getItem("authProvider") || "";

    // Detect social auth (Google, Facebook, Apple)
    const socialProviders = ["google", "facebook", "apple"];
    const socialAuth = socialProviders.includes(authProvider);
    setIsSocialAuth(socialAuth);

    if (signupEmail && emailVerified === "true") {
      setEmail(signupEmail);
      setEmailLocked(true);
      setIsEmailVerified(true);
    } else if (!signupEmail || !signupUid) {
      // No email or UID in session, redirect to email signup
      router.push("/auth/brand/signup/email");
      return;
    } else {
      setEmail(signupEmail);
      setEmailLocked(true);
    }

    // Pre-fill display name from Firebase user (social auth provides it)
    if (socialAuth && auth.currentUser?.displayName) {
      setFullName(auth.currentUser.displayName);
    }

    // Load existing data from context
    if (signupData.fullName) setFullName(signupData.fullName);
    if (signupData.phoneNumber) setPhoneNumber(signupData.phoneNumber);
    if (!socialAuth) {
      if (signupData.password) setPassword(signupData.password);
      if (signupData.confirmPassword) setConfirmPassword(signupData.confirmPassword);
    }
  }, [signupData, router]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    // Only validate password fields for email signup (not social auth)
    if (!isSocialAuth) {
      if (!password) {
        newErrors.password = "Password is required";
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      // If email signup with verified email, update the temporary password to the user's chosen password
      if (!isSocialAuth && isEmailVerified) {
        const tempPassword = sessionStorage.getItem("tempPassword");

        if (tempPassword) {
          // Sign in with temp password first
          await signInWithEmailAndPassword(auth, email, tempPassword);

          // Update to user's chosen password
          if (auth.currentUser) {
            await updatePassword(auth.currentUser, password);
          }
        }
      }

      // Save to context
      updateSignupData({
        fullName,
        email,
        phoneNumber: phoneNumber || "",
        ...(isSocialAuth ? {} : { password, confirmPassword }),
      });

      // Navigate to next step
      router.push("/auth/brand/signup/company");
    } catch (error: any) {
      console.error("Error updating account:", error);
      setGeneralError(getFriendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <Logo size="lg" className="justify-center mb-6" />

        <AuthCard>
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-brand-navy-dark mb-2">
              Create Your Brand Account
            </h2>
            <p className="text-sm text-gray-600">
              Join heycreator to manage campaigns and connect with influencers
            </p>
          </div>

          {/* Mobile Progress - LinearProgressBar */}
          <div className="block md:hidden mb-6">
            <LinearProgressBar current={1} total={3} label="Account" />
          </div>

          {/* Desktop Progress - SteppedProgressIndicator */}
          <div className="hidden md:block">
            <SteppedProgressIndicator
              currentStep={1}
              steps={[
                { number: 1, label: "Account" },
                { number: 2, label: "Brand Info" },
                { number: 3, label: "Social Media" },
              ]}
              className="mb-8"
            />
          </div>

          {/* Section Title */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-brand-navy mb-1">
              Account Information
            </h3>
            <p className="text-sm text-gray-600">
              Let&apos;s get you set up in under 2 minutes
            </p>
          </div>

          {generalError && <ErrorMessage message={generalError} className="mb-4" />}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <InputField
                label="Full Name"
                icon={User}
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                required
              />

              <InputField
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                disabled={emailLocked}
                required
              />

              <PhoneNumberInput
                label="Phone Number"
                placeholder="+27 123 456 7890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
              />

              {!isSocialAuth && (
                <>
                  <PasswordInputField
                    label="Password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    required
                  />

                  <PasswordInputField
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                    required
                  />
                </>
              )}
            </div>

            <div className="space-y-3">
              <PrimaryButton type="submit" loading={loading}>
                Continue
              </PrimaryButton>

              <OutlineButton
                onClick={() => router.push("/auth/brand/signup/email")}
                type="button"
              >
                Back
              </OutlineButton>
            </div>
          </form>
        </AuthCard>
      </div>
    </AuthLayout>
  );
}
