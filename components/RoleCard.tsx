import React from "react";
import { LucideIcon } from "lucide-react";

interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export default function RoleCard({
  icon: Icon,
  title,
  description,
  onClick,
  className = "",
}: RoleCardProps) {
  return (
    <button
      onClick={onClick}
      aria-label={title}
      className={`
        group relative w-full p-5 sm:p-6 md:p-8 bg-[#EDF7FD] rounded-2xl border-[0.5px] border-[#E0E0E0]
        hover:border-[#00A8CC] hover:shadow-lg transition-all duration-300
        text-left
        ${className}
      `}
    >
      {/* Icon */}
      <div className="mb-4 sm:mb-6 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
        <Icon className="w-6 h-6" color="#666666"/>
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1A1A1A] mb-2 sm:mb-3 group-hover:text-brand-navy transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#666666] leading-relaxed">{description}</p>

      {/* Arrow indicator */}
      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          className="w-6 h-6 text-[#00A8CC]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
