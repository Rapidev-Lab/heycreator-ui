"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "tertiary";
  fullWidth?: boolean;
}

export default function PrimaryButton({
  children,
  loading = false,
  variant = "primary",
  fullWidth = true,
  className = "",
  disabled,
  ...props
}: PrimaryButtonProps) {
  const variantClasses = {
    primary: "bg-brand-navy-dark text-white hover:bg-brand-navy-light active:bg-brand-navy",
    secondary: "bg-[#00A8CC] text-white hover:bg-[#0090B0] active:bg-[#007A94]",
    tertiary: "bg-white text-black hover:bg-gray-100",
  };

  return (
    <button
      className={`
        px-6 py-3 rounded-3xl font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${fullWidth ? "w-full" : ""}
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}
