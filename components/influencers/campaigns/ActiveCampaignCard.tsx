'use client';

import React from 'react';
import { Clock, Bookmark, List, Briefcase, MessageSquare, ArrowRight, CheckCircle2, Target } from 'lucide-react';
import {
  formatNumber,
  formatCurrencySymbol,
  capitalizeFirst,
  formatDeliverableLabel,
} from '@/lib/utils/campaign-card-helpers';
import type { ActiveCampaignCardData } from '@/types/active-campaign';

const UNKNOWN_BRAND = 'Unknown Brand';

interface ActiveCampaignCardProps {
  campaign: ActiveCampaignCardData;
  viewMode?: 'grid' | 'list';
  onToggleSave?: (campaignId: string) => void;
  onChat?: (campaignId: string) => void;
  onViewTasks?: (campaignId: string, applicationId: string) => void;
  onCardClick?: (campaignId: string) => void;
}

export default function ActiveCampaignCard({
  campaign,
  viewMode = 'grid',
  onToggleSave,
  onChat,
  onViewTasks,
  onCardClick,
}: ActiveCampaignCardProps) {
  const currencySymbol = formatCurrencySymbol(campaign.currency);
  const budgetDisplay = formatNumber(campaign.budgetAmount);

  const MAX_CATEGORIES = 3;
  const rawCategories = campaign.categories.length > 0
    ? campaign.categories
    : campaign.category
      ? [campaign.category]
      : [];
  const allCategories = rawCategories.flatMap(
    (cat) => cat.split(/\s*[&,]\s*/).filter(Boolean)
  );
  const displayCategories = allCategories.slice(0, MAX_CATEGORIES);
  const overflowCategoryCount = allCategories.length - MAX_CATEGORIES;

  const handleCardClick = () => {
    onCardClick?.(campaign.id);
  };

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

  const renderActiveBadge = () => (
    <span className="w-max inline-flex items-center px-2.5 py-1 bg-[#E8F8EE] text-[#00A63E] text-xs font-medium rounded-full">
      Active
    </span>
  );

  const renderBookmark = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggleSave?.(campaign.id);
      }}
      className={`p-1.5 transition-colors rounded-lg hover:bg-gray-50 ${
        campaign.isSaved ? 'text-brand-navy' : 'text-gray-400 hover:text-brand-navy'
      }`}
    >
      <Bookmark className="w-5 h-5" fill={campaign.isSaved ? 'currentColor' : 'none'} />
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

  const renderObjectives = () => {
    if (!campaign.campaignObjectives || campaign.campaignObjectives.length === 0) return null;
    return (
      <div className="flex items-start gap-2 mb-2">
        <Target className="w-4 h-4 text-brand-navy-dark mt-0.5 flex-shrink-0" />
        <p className="text-xs text-gray-500 line-clamp-1">
          {campaign.campaignObjectives.join(', ')}
        </p>
      </div>
    );
  };

  const renderProgressBar = () => {
    if (!campaign.progress) return null;
    const { total, completed, percentage } = campaign.progress;
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-gray-600">
            Progress: {completed}/{total} completed
          </span>
          <span className="text-sm font-semibold text-brand-navy">{percentage}%</span>
        </div>
        <div className="w-full bg-[#E5E7EB] rounded-full h-2">
          <div
            className="bg-brand-navy h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderDeliverablePills = () => {
    if (campaign.deliverables.length === 0) return null;
    return (
      <div className="flex items-start gap-2">
        <List className="w-4 h-4 text-brand-navy-dark mt-0.5 flex-shrink-0" />
        <div className="flex gap-1.5 flex-wrap">
          {campaign.deliverables.map((d, i) => {
            const label = formatDeliverableLabel(d);
            if (d.completed) {
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E8F8EE] text-[#00A63E] text-xs font-medium rounded-lg"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {label}
                </span>
              );
            }
            return (
              <span
                key={i}
                className="px-2.5 py-1 bg-[#F0F4F8] text-brand-navy-dark text-xs font-medium rounded-lg"
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="flex items-center justify-between mt-auto pt-2">
      <button
        disabled
        className="p-2 text-gray-300 border border-gray-200 rounded-lg cursor-not-allowed"
        title="Chat (coming soon)"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewTasks?.(campaign.id, campaign.applicationId);
        }}
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#666666] border border-[#E0E0E0] rounded-lg hover:bg-brand-navy hover:text-white transition-colors"
      >
        View tasks
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );

  // List view
  if (viewMode === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="flex items-stretch gap-5 p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Left: Image */}
        {renderImage('md')}

        {/* Middle-left: Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex justify-between">
            {renderActiveBadge()}
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

        {/* Middle-right: Budget, timeline, progress, deliverables */}
        <div className="hidden md:flex flex-col gap-2 w-72 flex-shrink-0 border-l border-gray-100 pl-5 justify-center">
          <p className="text-base font-bold text-brand-navy">
            <span className="text-brand-navy-dark">{currencySymbol}</span> {budgetDisplay}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              Tasks due in <strong>{campaign.tasksDueDays} day{campaign.tasksDueDays !== 1 ? 's' : ''}</strong>: {campaign.tasksDueDate}
            </span>
          </div>
          {renderProgressBar()}
          {renderDeliverablePills()}
        </div>

        {/* Far right: Actions */}
        <div className="flex flex-col justify-center items-center gap-2 flex-shrink-0">
          <button
            disabled
            className="p-2 text-gray-300 border border-gray-200 rounded-lg cursor-not-allowed"
            title="Chat (coming soon)"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewTasks?.(campaign.id, campaign.applicationId);
            }}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#666666] border border-[#E0E0E0] rounded-lg hover:bg-brand-navy hover:text-white transition-colors whitespace-nowrap"
          >
            View tasks
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid view (default)
  const hasBrand = campaign.brandName && campaign.brandName !== UNKNOWN_BRAND;

  return (
    <div
      onClick={handleCardClick}
      className="flex flex-col px-5 py-4 rounded-lg border border-[#E0E0E0] bg-white hover:shadow-md transition-shadow cursor-pointer h-full"
    >
      {/* Top row: image + status + bookmark */}
      <div className="flex items-start gap-3 mb-3">
        {renderImage('sm')}
        <div className="flex-1 pt-0.5">
          {renderActiveBadge()}
        </div>
        {renderBookmark()}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-brand-navy-dark line-clamp-2 min-h-[3rem] mb-0.5">
        {campaign.title}
      </h3>

      {/* Brand name */}
      <div className="h-5 mb-1">
        {hasBrand && (
          <p className="text-sm text-[#FF385C] truncate">{campaign.brandName}</p>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem] mb-2">
        {campaign.description ? capitalizeFirst(campaign.description) : '\u00A0'}
      </p>

      {/* Category pills */}
      <div className="min-h-[1.75rem] mb-2">
        {renderCategoryPills()}
      </div>

      {/* Campaign objectives */}
      {renderObjectives()}

      {/* Divider */}
      <hr className="border-[#E0E0E0] mb-3" />

      {/* Budget */}
      <p className="text-lg font-bold text-[#666666] mb-2">
        <span className="text-brand-navy-dark">{currencySymbol}</span> {budgetDisplay}
      </p>

      {/* Tasks due */}
      <div className="flex items-center gap-1.5 text-sm text-[#666666] mb-3">
        <Clock className="w-4 h-4 text-brand-navy-dark" />
        <span>
          Tasks due in <strong>{campaign.tasksDueDays} day{campaign.tasksDueDays !== 1 ? 's' : ''}</strong>: {campaign.tasksDueDate}
        </span>
      </div>

      {/* Progress bar */}
      {renderProgressBar()}

      {/* Deliverable pills */}
      <div className="min-h-[1.75rem] mb-3">
        {renderDeliverablePills()}
      </div>

      {/* Action buttons */}
      {renderActionButtons()}
    </div>
  );
}
