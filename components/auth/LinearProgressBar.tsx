import React from 'react';

interface LinearProgressBarProps {
  current: number;
  total: number;
  label: string;
  className?: string;
}

export default function LinearProgressBar({
  current,
  total,
  label,
  className = ''
}: LinearProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      {/* Step indicator text */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {current} of {total}
        </span>
        <span className="text-sm font-semibold text-[#666]">
          {label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-navy-dark transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
