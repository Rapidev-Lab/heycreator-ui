"use client";

interface InfluencerStatsCardProps {
  title: string;
  value: string | number;
  className?: string | null;
}

export function InfluencerStatsCard({
  title,
  value,
  className = "",
}: InfluencerStatsCardProps) {
  return (
    <div className="bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col justify-between h-[120px] shadow-sm">
      <div className="flex items-start justify-between">
        {/* Title: Grey, Uppercase, Small */}
        <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </p>
      </div>

      {/* Value: Large, Navy Blue */}
      <div>
        <p
          className={`text-3xl font-bold tracking-tight ${value === 0 || value === "0%" || value === "R 0" ? "text-gray-300" : "text-brand-navy-dark"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
