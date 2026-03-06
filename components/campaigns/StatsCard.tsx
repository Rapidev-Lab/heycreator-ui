"use client";

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  iconBgColor: string; // Tailored for the specific light background
  className?: string;
}

export default function StatsCard({
  icon,
  title,
  value,
  iconBgColor,
  className = "",
}: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-6 flex flex-col justify-between h-[160px] shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        {/* Title: Grey, Uppercase, specific tracking */}
        <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </p>
        
        {/* Icon Container: Small, circular, specific light background */}
        <div
          className={`${iconBgColor} h-9 w-9 rounded-full flex items-center justify-center shadow-sm`}
        >
          {icon}
        </div>
      </div>

      {/* Value: Large, Navy Blue */}
      <div>
        <p className="text-3xl font-bold text-brand-navy-dark tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}
