'use client';

import {
  DollarSign,
  Calendar,
  Users,
  Star,
  CheckCircle2,
  XCircle,
  Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface CampaignMarketplaceCardProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    productCategory: string;
    budget: {
      amount: number;
      currency: string;
    };
    timeline: {
      duration: string;
      applicationDeadline?: Date | any;
    };
    requirements: {
      minFollowers?: number;
      platforms?: string[];
    };
    stats: {
      views: number;
      applications: number;
    };
    brandInfo: {
      name: string;
      logo?: string | null;
      verified?: boolean;
    };
    qualifies: boolean;
    hasApplied?: boolean;
    createdAt?: Date | any;
  };
}

export default function CampaignMarketplaceCard({ campaign }: CampaignMarketplaceCardProps) {
  const router = useRouter();

  const getDeadlineDays = () => {
    if (!campaign.timeline.applicationDeadline) return null;
    const deadline =
      campaign.timeline.applicationDeadline instanceof Date
        ? campaign.timeline.applicationDeadline
        : campaign.timeline.applicationDeadline?.toDate?.()
        || new Date(campaign.timeline.applicationDeadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const deadlineDays = getDeadlineDays();
  const isUrgent = deadlineDays !== null && deadlineDays <= 3 && deadlineDays > 0;

  return (
    <div
      onClick={() => router.push(`/influencers/marketplace/${campaign.id}`)}
      className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100 hover:border-brand-navy/20"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {campaign.brandInfo.logo ? (
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={campaign.brandInfo.logo}
                    alt={campaign.brandInfo.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {campaign.brandInfo.name}
                </span>
                {campaign.brandInfo.verified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-1">
              {campaign.title}
            </h3>
            <p className="text-sm text-gray-600">{campaign.productCategory}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-col gap-2 items-end flex-shrink-0">
            {campaign.stats.views > 100 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                <Star className="w-3 h-3 mr-1" />
                Popular
              </span>
            )}
            {campaign.hasApplied && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Applied
              </span>
            )}
            {campaign.qualifies ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Qualified
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                <XCircle className="w-3 h-3 mr-1" />
                Not Qualified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
          {campaign.description}
        </p>

        {/* Budget */}
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="font-semibold text-gray-900">
            {campaign.budget.currency === 'ZAR' ? 'R' : campaign.budget.currency}
            {campaign.budget.amount.toLocaleString('en-ZA')}
          </span>
          <span className="text-xs text-gray-500">budget</span>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-600">{campaign.timeline.duration}</span>
          {deadlineDays !== null && deadlineDays > 0 && (
            <span
              className={`ml-auto text-xs font-medium ${
                isUrgent ? 'text-red-600' : 'text-orange-600'
              }`}
            >
              {deadlineDays} {deadlineDays === 1 ? 'day' : 'days'} left
            </span>
          )}
        </div>

        {/* Requirements */}
        {campaign.requirements.platforms && campaign.requirements.platforms.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {campaign.requirements.platforms.map((platform, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium"
              >
                {platform}
              </span>
            ))}
            {campaign.requirements.minFollowers && (
              <span className="inline-flex items-center px-2 py-1 rounded bg-brand-navy-50 text-brand-navy text-xs font-medium">
                {(campaign.requirements.minFollowers / 1000).toFixed(0)}K+ followers
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {campaign.stats.applications} {campaign.stats.applications === 1 ? 'application' : 'applications'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          className={`w-full px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
            campaign.qualifies
              ? 'bg-brand-navy text-white hover:bg-brand-navy-light shadow-sm hover:shadow'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (!campaign.qualifies) {
              e.stopPropagation();
            }
          }}
        >
          {campaign.qualifies ? (campaign.hasApplied ? 'View Details' : 'View Details & Apply') : 'Requirements Not Met'}
        </button>
      </div>
    </div>
  );
}
