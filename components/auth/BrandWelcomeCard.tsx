import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BrandWelcomeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  className?: string;
}

export default function BrandWelcomeCard({
  icon: Icon,
  title,
  description,
  iconColor = 'text-primary',
  className = ''
}: BrandWelcomeCardProps) {
  return (
    <div className={`bg-white p-5 flex items-start gap-4 ${className}`}>
      {/* Icon */}
      <div className="flex-shrink-0">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>

      {/* Text Content */}
      <div>
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
