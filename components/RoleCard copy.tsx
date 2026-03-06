import React from 'react';
import { LucideIcon } from 'lucide-react';

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
  className = ''
}: RoleCardProps) {

  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full p-8 bg-[#EDF7FD] rounded-2xl border-2 border-[#E0E0E0]
        hover:border-[#00A8CC] hover:shadow-lg transition-all duration-300
        text-left focus:outline-none focus:ring-2 focus:ring-[#00A8CC] focus:ring-offset-2
        ${className}
      `}
    >
      {/* Icon */}
      <div className="mb-6 inline-flex items-center justify-center w-16 h-16 group-hover:bg-[#00A8CC]/10 transition-colors">
        <Icon className="w-8 h-8 text-gray-600 group-hover:text-[#00A8CC] transition-colors" />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-navy transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* Arrow indicator */}
      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg
          className="w-6 h-6 text-[#00A8CC]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
