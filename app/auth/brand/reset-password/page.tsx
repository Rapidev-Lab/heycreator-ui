"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Circle } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import PasswordInputField from "@/components/auth/PasswordInputField";
import PrimaryButton from "@/components/auth/PrimaryButton";
import ErrorMessage from '@/components/auth/ErrorMessage';
import { auth } from '@/lib/firebase/config';
import { confirmPasswordReset } from 'firebase/auth';
import { getFriendlyErrorMessage } from '@/lib/firebase/auth-actions';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(true);

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    if (!oobCode) {
      setIsCodeValid(false);
      setFirebaseError("No password reset code found.");
    }
  }, [oobCode]);

  // Update password validation on password change
  useEffect(() => {
    setPasswordValidation({
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordValidation).every((v) => v);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    setFirebaseError(null);

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCodeValid) {
      setFirebaseError("Invalid or missing password reset code.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, newPassword);
        router.push("/auth/brand/reset-success");
      } else {
        setFirebaseError("Password reset code is missing.");
      }
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setFirebaseError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
        <AuthCard>
          
          <h2 className="text-xl font-medium *:text-[#101828] mb-4 text-center">
            Create New Password
          </h2>
          <p className="text-gray-700 mb-6 text-left">
            Create a strong password for your account. Make sure it meets all the requirements below.
          </p>

          {firebaseError && <ErrorMessage message={firebaseError} className="mb-4" />}

          {!isCodeValid && !firebaseError && (
            <ErrorMessage message="Invalid or expired password reset link. Please try again." className="mb-4" />
          )}

          {isCodeValid && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 mb-6">
                <PasswordInputField
                  label="New Password"
                  placeholder="Create a strong password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              </div>

              {/* Password Requirements */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Password must contain:
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {passwordValidation.minLength ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.minLength ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordValidation.hasUppercase ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.hasUppercase ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordValidation.hasLowercase ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.hasLowercase ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordValidation.hasNumber ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.hasNumber ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                      One number
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordValidation.hasSpecialChar ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.hasSpecialChar ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                      One special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>

              <PrimaryButton
                type="submit"
                loading={loading}
                disabled={!isPasswordValid || !confirmPassword}
              >
                Reset Password
              </PrimaryButton>
            </form>
          )}
        </AuthCard>
      </div>
    </AuthLayout>
  );
}

export default function BrandResetPasswordPage() {
  return (
    <Suspense fallback={
      <AuthLayout>
        <div className="w-full max-w-xl px-4 md:px-6 lg:px-8">
          <AuthCard>
            <div className="text-center text-gray-600">Loading...</div>
          </AuthCard>
        </div>
      </AuthLayout>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
