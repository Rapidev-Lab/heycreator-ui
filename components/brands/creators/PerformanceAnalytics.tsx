'use client';

import { Users, TrendingUp, BarChart3, Shield } from 'lucide-react';
import type { ListAnalytics } from '@/types/creator-list';

interface PerformanceAnalyticsProps {
  analytics: ListAnalytics;
  isLoading?: boolean;
}

function formatCount(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function PerformanceAnalytics({
  analytics,
  isLoading = false,
}: PerformanceAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Performance Analytics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      icon: Users,
      label: 'Avg Views',
      value: formatCount(analytics.avgFollowers),
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Engagement Rate',
      value: analytics.avgEngagementRate > 0 ? `${analytics.avgEngagementRate}%` : '—',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
    {
      icon: BarChart3,
      label: 'Avg Growth (30 days)',
      value: analytics.avgGrowth30d > 0 ? `+${analytics.avgGrowth30d}%` : '—',
      iconColor: 'text-brand-navy',
      iconBg: 'bg-brand-navy-50',
    },
    {
      icon: Shield,
      label: 'Authenticity',
      value: analytics.avgAuthenticity > 0 ? `${analytics.avgAuthenticity}%` : '—',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Performance Analytics</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${metric.iconBg}`}>
                <Icon className={`w-4 h-4 ${metric.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-brand-navy">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{metric.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
