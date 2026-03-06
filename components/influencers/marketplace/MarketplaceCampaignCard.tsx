'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Bookmark, List, Briefcase } from 'lucide-react';
import type { MarketplaceCampaignExtended } from '@/types/marketplace';

const UNKNOWN_BRAND = 'Unknown Brand';

function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCurrencySymbol(currency: string): string {
  if (currency === 'ZAR') return 'R';
  if (currency === 'USD') return '$';
  return currency;
}

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDeliverableLabel(d: { platform: string; contentType: string; quantity: number }): string {
  const qty = d.quantity || 1;
  const platform = d.platform.charAt(0).toUpperCase() + d.platform.slice(1);
  const type = d.contentType.replace(/_/g, ' ');
  return `${qty} ${platform} ${type}${qty > 1 ? 's' : ''}`;
}

function getStatusBadge(status: string, invitationStatus?: string) {
  // Invitation-aware badges take priority
  if (invitationStatus === 'sent') {
    return { label: 'Invited', textColor: 'text-blue-700', bgColor: 'bg-blue-50', dotColor: 'bg-blue-500' };
  }
  if (invitationStatus === 'accepted') {
    return { label: 'Accepted', textColor: 'text-[#00A63E]', bgColor: 'bg-[#E8F8EE]', dotColor: 'bg-green-500' };
  }
  if (invitationStatus === 'declined') {
    return { label: 'Declined', textColor: 'text-gray-600', bgColor: 'bg-gray-100', dotColor: 'bg-gray-400' };
  }
  // Default campaign status badges
  if (status === 'open') {
    return { label: 'Published', textColor: 'text-[#00A63E]', bgColor: 'bg-[#E8F8EE]', dotColor: 'bg-green-500' };
  }
  if (status === 'ending-soon') {
    return { label: 'Ending Soon', textColor: 'text-amber-700', bgColor: 'bg-amber-50', dotColor: 'bg-amber-500' };
  }
  return { label: 'Closed', textColor: 'text-gray-600', bgColor: 'bg-gray-100', dotColor: 'bg-gray-400' };
}

interface MarketplaceCampaignCardProps {
  campaign: MarketplaceCampaignExtended;
  viewMode?: 'grid' | 'list';
  isSaved?: boolean;
  onToggleSave?: (campaignId: string) => void;
}

export default function MarketplaceCampaignCard({
  campaign,
  viewMode = 'grid',
  isSaved = false,
  onToggleSave,
}: MarketplaceCampaignCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/influencers/marketplace/${campaign.id}`);
  };

  const currencySymbol = formatCurrencySymbol(campaign.currency);
  const budgetAmount = campaign.budgetMin === campaign.budgetMax
    ? formatNumber(campaign.budgetMin)
    : `${formatNumber(campaign.budgetMin)} - ${formatNumber(campaign.budgetMax)}`;

  const endDateDisplay = campaign.daysRemaining > 0
    ? `Ends in ${campaign.daysRemaining} day${campaign.daysRemaining !== 1 ? 's' : ''}`
    : 'Closed';

  const endDateSuffix = campaign.applicationDeadlineDate !== 'TBD'
    ? `: ${campaign.applicationDeadlineDate}`
    : '';

  const MAX_CATEGORIES = 3;
  const rawCategories = campaign.categories.length > 0
    ? campaign.categories
    : campaign.category
      ? [campaign.category]
      : [];
  // Split entries like "Food & Beverage" into separate pills
  const allCategories = rawCategories.flatMap(
    (cat) => cat.split(/\s*[&,]\s*/).filter(Boolean)
  );
  const displayCategories = allCategories.slice(0, MAX_CATEGORIES);
  const overflowCategoryCount = allCategories.length - MAX_CATEGORIES;

  const statusBadge = getStatusBadge(campaign.status, campaign.invitationStatus);

  const renderImage = (size: 'sm' | 'md') => {
    const sizeClasses = size === 'sm'
      ? 'w-12 h-12 rounded-lg'
      : 'w-24 h-24 rounded-lg';
    const textSize = size === 'sm' ? 'text-lg' : 'text-2xl';

    return (
      <div className={`${sizeClasses} bg-gray-100 flex-shrink-0 overflow-hidden`}>
        {campaign.productImageUrl ? (
          <img
            src={campaign.productImageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        ) : campaign.brandLogo ? (
          <img
            src={campaign.brandLogo}
            alt={campaign.brandName}
            className="w-full h-full object-cover"
          />
        ) : campaign.brandName && campaign.brandName !== UNKNOWN_BRAND ? (
          <div className={`w-full h-full bg-brand-navy flex items-center justify-center text-white font-bold ${textSize}`}>
            {campaign.brandName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-full h-full bg-brand-navy flex items-center justify-center text-white">
            <Briefcase className={size === 'sm' ? 'w-5 h-5' : 'w-8 h-8'} />
          </div>
        )}
      </div>
    );
  };

  const renderStatusBadge = () => (
    <span className={`w-max inline-flex items-center px-2.5 py-1 ${statusBadge.bgColor} ${statusBadge.textColor} text-xs font-medium rounded-full`}>
      {statusBadge.label}
    </span>
  );

  const renderBookmark = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleSave?.(campaign.id);
      }}
      className={`p-1.5 transition-colors rounded-lg hover:bg-gray-50 ${
        isSaved ? 'text-brand-navy' : 'text-gray-400 hover:text-brand-navy'
      }`}
    >
      <Bookmark className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} />
    </button>
  );

  const renderCategoryPills = () => {
    if (displayCategories.length === 0) return null;
    return (
      <div className="flex gap-1.5 flex-wrap">
        {displayCategories.map((cat) => (
          <span
            key={cat}
            className="px-2.5 py-1 bg-[#F8F9FD] text-[#FF385C] text-xs font-medium rounded-full"
          >
            {cat}
          </span>
        ))}
        {overflowCategoryCount > 0 && (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            +{overflowCategoryCount}
          </span>
        )}
      </div>
    );
  };

  const MAX_DELIVERABLES = 2;
  const renderDeliverables = () => {
    if (campaign.deliverables.length === 0) return null;
    const visible = campaign.deliverables.slice(0, MAX_DELIVERABLES);
    const overflowCount = campaign.deliverables.length - MAX_DELIVERABLES;
    return (
      <div className="flex items-start gap-2">
        <List className="w-4 h-4 text-brand-navy-dark mt-0.5 flex-shrink-0" />
        <div className="flex gap-1.5 flex-wrap">
          {visible.map((d, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-gray-100 text-brand-navy-dark text-xs font-medium rounded-lg"
            >
              {formatDeliverableLabel(d)}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
              +{overflowCount}
            </span>
          )}
        </div>
      </div>
    );
  };

  // List view
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="flex items-stretch gap-5 p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Left: Image */}
        {renderImage('md')}

        {/* Middle-left: Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className='flex justify-between'>{renderStatusBadge()}
          {renderBookmark()}
            </div>
          <h3 className="text-base font-bold text-brand-navy truncate">{campaign.title}</h3>
          {campaign.brandName && campaign.brandName !== UNKNOWN_BRAND && (
            <p className="text-sm text-[#FF385C]">{campaign.brandName}</p>
          )}
          {campaign.description && (
            <p className="text-sm text-gray-500 line-clamp-1">{capitalizeFirst(campaign.description)}</p>
          )}
          {renderCategoryPills()}
        </div>

        {/* Middle-right: Budget & deliverables */}
        <div className="hidden md:flex flex-col gap-2 w-60 flex-shrink-0 border-l border-gray-100 pl-5 justify-center">
          <p className="text-base font-bold text-brand-navy">
            <span className="text-brand-navy-dark">{currencySymbol}</span> {budgetAmount}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              {endDateDisplay}
              {endDateSuffix}
            </span>
          </div>
          {renderDeliverables()}
        </div>

        {/* Far right: Bookmark + View More */}
        <div className="flex flex-col justify-center items-center flex-shrink-0">
          <button
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium hover:text-white transition-colors whitespace-nowrap text-[#666666] border border-[#E0E0E0] rounded-lg hover:bg-brand-navy"
          >
            View More
          </button>
        </div>
      </div>
    );
  }

  // Grid view (default)
  const hasBrand = campaign.brandName && campaign.brandName !== UNKNOWN_BRAND;

  return (
    <div
      onClick={handleClick}
      className="flex flex-col px-5 py-4 rounded-lg border border-2-[#E0E0E0] bg-white hover:shadow-md transition-shadow cursor-pointer h-full"
    >
      {/* Top row: image + status + bookmark */}
      <div className="flex items-start gap-3 mb-3">
        {renderImage('sm')}
        <div className="flex-1 pt-0.5">
          {renderStatusBadge()}
        </div>
        {renderBookmark()}
      </div>

      {/* Title — fixed 2-line height */}
      <h3 className="text-base font-bold text-brand-navy-dark line-clamp-2 min-h-[3rem] mb-0.5">
        {campaign.title}
      </h3>

      {/* Brand name — fixed single-line height */}
      <div className="h-5 mb-1">
        {hasBrand && (
          <p className="text-sm text-[#FF385C] truncate">{campaign.brandName}</p>
        )}
      </div>

      {/* Description — fixed 2-line height */}
      <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] mb-2">
        {campaign.description ? capitalizeFirst(campaign.description) : '\u00A0'}
      </p>

      {/* Category pills — fixed height */}
      <div className="min-h-[1.75rem] mb-3">
        {renderCategoryPills()}
      </div>

      {/* Divider */}
      <hr className="border-[#E0E0E0] mb-3" />

      {/* Budget */}
      <p className="text-lg font-bold text-[#666666] mb-2">
        <span className="text-brand-navy-dark">{currencySymbol}</span> {budgetAmount}
      </p>

      {/* Deadline */}
      <div className="flex items-center gap-1.5 text-sm text-[#666666] mb-2">
        <Clock className="w-4 h-4 text-brand-navy-dark" />
        <span>
          {campaign.daysRemaining > 0 ? (
            <>Ends in <strong>{campaign.daysRemaining} day{campaign.daysRemaining !== 1 ? 's' : ''}</strong>{endDateSuffix}</>
          ) : (
            'Closed'
          )}
        </span>
      </div>

      {/* Deliverables — fixed height */}
      <div className="min-h-[1.75rem] mb-4">
        {renderDeliverables()}
      </div>

      {/* View more button — always anchored to bottom */}
      <button
        className="w-full mt-auto py-2.5 px-6 text-sm font-bold text-[#666666] border border-[#E0E0E0] rounded-lg hover:bg-brand-navy hover:text-white transition-colors"
      >
        View more
      </button>
    </div>
  );
}
