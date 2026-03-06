import React from "react";
import Image from "next/image";

interface SocialVerifyButtonProps {
  provider: "instagram" | "twitter" | "tiktok" | "youtube";
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

const providerConfig = {
  instagram: {
    icon: "/instagram-verify.svg",
    label: "Instagram",
    displayName: "Instagram",
  },
  twitter: {
    icon: "/x-verify.svg",
    label: "X (Twitter)",
    displayName: "X",
  },
  tiktok: {
    icon: "/tiktok-verify.svg",
    label: "TikTok",
    displayName: "TikTok",
  },
  youtube: {
    icon: "/youtube-verify.svg",
    label: "Youtube",
    displayName: "Google",
  },
};

export default function SocialVerifyButton({
  provider,
  onClick,
  loading = false,
  disabled = false,
  className = "",
}: SocialVerifyButtonProps) {
  const config = providerConfig[provider];

  return (
    <div className={className}>
      <button
        onClick={onClick}
        disabled={loading || disabled}
        className="w-full bg-white hover:bg-gray-50 text-black font-medium py-3.5 px-4 rounded-3xl transition-colors duration-200 flex items-center relative disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-gray-100"
      >
        {/* Icon on the left */}
        <div className="absolute left-4 flex items-center justify-center w-7 h-7">
          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          ) : (
            <Image
              src={config.icon}
              alt={config.label}
              width={28}
              height={28}
              className="w-7 h-7"
            />
          )}
        </div>

        {/* Centered text - padding ensures it doesn't overlap with icon */}
        <span className="text-sm flex-1 text-center pl-6 whitespace-nowrap">
          Continue with {config.displayName}
        </span>
      </button>

      {/* Label below button */}
      <p className="text-sm text-gray-400 mt-2 ml-1">{config.label}</p>
    </div>
  );
}
