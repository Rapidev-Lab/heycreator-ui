"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface SocialAuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider:
    | "facebook"
    | "google"
    | "apple"
    | "instagram"
    | "twitter"
    | "tiktok";
  children?: React.ReactNode;
  loading?: boolean;
  iconOnly?: boolean;
}

const defaultLabels = {
  facebook: "Facebook",
  google: "Google",
  apple: "Apple",
  instagram: "Instagram",
  twitter: "Connect Twitter",
  tiktok: "Connect TikTok",
};

const providerIcons = {
  facebook: (
    <svg
      className="scale-[0.5]"
      width="40"
      height="40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="prefix__a"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="40"
        height="40"
      >
        <path d="M39.02 0H0v39.02h39.02V0z" fill="#fff" />
      </mask>

      <g mask="url(#prefix__a)">
        <path
          d="M39.02 19.51C39.02 8.74 30.29 0 19.51 0 8.73 0 0 8.73 0 19.51c0 9.15 6.3 16.83 14.8 18.93V25.47h-4.02v-5.96h4.02v-2.57c0-6.64 3.01-9.72 9.52-9.72 1.24 0 3.37.24 4.24.48v5.4c-.46-.05-1.26-.07-2.25-.07-3.2 0-4.43 1.21-4.43 4.36v2.11h6.37l-1.09 5.96h-5.28v13.4c9.66-1.17 17.15-9.39 17.15-19.37l-.01.02z"
          fill="#0866FF"
        />
        <path
          d="M27.15 25.47l1.09-5.96h-6.37V17.4c0-3.15 1.24-4.36 4.43-4.36.99 0 1.79.02 2.25.07v-5.4c-.87-.24-3.01-.48-4.24-.48-6.52 0-9.52 3.08-9.52 9.72v2.57h-4.02v5.96h4.02v12.97a19.786 19.786 0 007.07.43v-13.4h5.28l.01-.01z"
          fill="#fff"
        />
      </g>
    </svg>
  ),
  google: (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  ),
  apple: (
    <svg
      className="w-8 h-7 text-black"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  ),
  instagram: (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="url(#instagram-gradient)"
    >
      <defs>
        <linearGradient
          id="instagram-gradient"
          x1="0%"
          y1="100%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" style={{ stopColor: "#FD5949" }} />
          <stop offset="50%" style={{ stopColor: "#D6249F" }} />
          <stop offset="100%" style={{ stopColor: "#285AEB" }} />
        </linearGradient>
      </defs>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  tiktok: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  ),
};

const providerColors = {
  facebook: "bg-[#EDF7FD] text-black gap-0 pl-0 pr-2.5",
  google: "bg-[#EDF7FD]  text-black pr-0",
  apple: "bg-[#EDF7FD]  text-black pl-1",
  instagram: "bg-[#EDF7FD] text-black px-2.5 w-max py-2.5",
  twitter: "bg-black hover:bg-gray-100 text-white",
  tiktok: "bg-black hover:bg-gray-100 text-white",
};

export default function SocialAuthButton({
  provider,
  children,
  loading = false,
  iconOnly = false,
  className = "",
  disabled,
  ...props
}: SocialAuthButtonProps) {
  if (iconOnly) {
    return (
      <button
        type="button"
        className={`
          w-12 h-12 rounded-full
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center
          bg-[#EDF7FD] hover:bg-[#D8EFFA]
          ${className}
        `}
        disabled={disabled || loading}
        aria-label={`Sign in with ${defaultLabels[provider]}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          providerIcons[provider]
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`
        w-full text-xs px-2.5 py-2.5 rounded-3xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-1
        ${providerColors[provider]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        providerIcons[provider]
      )}
      {children || defaultLabels[provider]}
    </button>
  );
}
