'use client';

import {
  MapPin,
  Calendar,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

/* ───── helpers ───── */

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateSlash(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'TBD';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R' : currency === 'USD' ? '$' : currency + ' ';
  return `${symbol}${amount.toLocaleString()}`;
}

function formatProductType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPastDate(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

function formatFollowerCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(count % 1000000 === 0 ? 0 : 1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}k`;
  return count.toString();
}

/* ───── component ───── */

interface CampaignBriefTabProps {
  campaign: any;
}

export default function CampaignBriefTab({ campaign }: CampaignBriefTabProps) {
  const budget = campaign.budget || {};
  const budgetMin = budget.compensationModel === 'range' ? budget.minRangeAmount : budget.fixedAmount;
  const budgetMax = budget.compensationModel === 'range' ? budget.maxRangeAmount : budget.fixedAmount;
  const deliverables = campaign.tasks?.requiredDeliverables || [];
  const dos = campaign.tasks?.dos || [];
  const donts = campaign.tasks?.donts || [];
  const hashtags = campaign.tasks?.metaData?.requiredHashTags || [];
  const mentions = campaign.tasks?.metaData?.mentions_or_tags || [];
  const questions = campaign.tasks?.questions || [];
  const timeline = campaign.timeline || {};
  const currency = budget.currency || 'ZAR';

  // Build expanded timeline milestones (post-approval lifecycle)
  const milestones: { label: string; date: string | null; description: string }[] = [];
  if (timeline.applicationDeadline) {
    milestones.push({
      label: 'Application Deadline',
      date: timeline.applicationDeadline,
      description: isPastDate(timeline.applicationDeadline)
        ? 'Application period has ended'
        : 'Last day for influencers to apply',
    });
  }
  if (budget.contentCreationStart) {
    milestones.push({
      label: 'Content Creation',
      date: budget.contentCreationStart,
      description: 'Begin creating content for the campaign',
    });
  }
  if (budget.contentCreationEnd) {
    milestones.push({
      label: 'Content Review',
      date: budget.contentCreationEnd,
      description: 'Brand reviews submitted content',
    });
  }
  if (timeline.campaignStart) {
    milestones.push({
      label: 'Campaign Live',
      date: timeline.campaignStart,
      description: 'Content goes live on your channels',
    });
  }
  if (timeline.campaignEnd) {
    milestones.push({
      label: 'Campaign End',
      date: timeline.campaignEnd,
      description: 'Final content submissions and approvals due',
    });
  }

  return (
    <div className="space-y-6">
      {/* ===== TIMELINE CARD (Horizontal) ===== */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-8">Timeline</h3>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-[7px] left-0 right-0 h-0.5 bg-gray-200" />
            <div className="flex justify-between relative">
              {milestones.map((m, i) => {
                const past = isPastDate(m.date);
                const dotColor = past ? 'bg-amber-400' : i === 0 ? 'bg-[#FBBF24]' : 'bg-gray-300';
                return (
                  <div key={i} className="flex flex-col items-start flex-1 pr-4 last:pr-0">
                    <div className={`w-3.5 h-3.5 rounded-full ${dotColor} relative z-10 ring-4 ring-white`} />
                    <p className="text-sm font-semibold text-brand-navy mt-3">{m.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatShortDate(m.date)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== COMBINED CARD: Details + Objectives + Product + Deliverables ===== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* Details (3-col stat cards) */}
        <div>
          <h3 className="text-base font-bold text-brand-navy mb-4">Details</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Compensation</span>
              </div>
              <p className="text-lg font-bold text-brand-navy">
                {budgetMin === budgetMax
                  ? formatCurrency(budgetMin, currency)
                  : `${formatCurrency(budgetMin, currency)} - ${formatCurrency(budgetMax, currency)}`}
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Apply By</span>
              </div>
              <p className="text-lg font-bold text-brand-navy">
                {formatDateSlash(timeline.applicationDeadline)}
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-4 bg-[#F8F9FD]">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold">Location</span>
              </div>
              <p className="text-lg font-bold text-brand-navy">
                {campaign.audience?.targetLocation || 'Anywhere'}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#D1D5DB]" />

        {/* Campaign Objectives */}
        {campaign.objectives && campaign.objectives.length > 0 && (
          <>
            <div>
              <h3 className="text-base font-bold text-brand-navy mb-3">Campaign Objectives</h3>
              {campaign.kpi && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{campaign.kpi}</p>
              )}
              <div className="flex flex-wrap gap-4">
                {campaign.objectives.map((obj: string, i: number) => (
                  <span
                    key={i}
                    className="text-sm text-brand-navy-dark font-medium bg-[#F8F9FD] rounded-full px-2"
                  >
                    {obj}
                  </span>
                ))}
              </div>
            </div>
            {/* Divider */}
            <div className="w-full h-px bg-[#D1D5DB]" />
          </>
        )}

        {/* Product Details */}
        {campaign.product?.productName && (
          <>
            <div>
              <h3 className="text-base font-bold text-brand-navy mb-4">Product Details</h3>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-5">
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {campaign.product.productImagesUrls?.[0] ? (
                    <img
                      src={campaign.product.productImagesUrls[0]}
                      alt={campaign.product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-7 h-7 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-base font-semibold text-brand-navy">
                      {campaign.product.productName}
                    </h4>
                    {campaign.product.productValue ? (
                      <span className="text-sm font-bold text-brand-navy whitespace-nowrap">
                        Value: {formatCurrency(campaign.product.productValue, currency)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {campaign.product.productType ? formatProductType(campaign.product.productType) + '. ' : ''}
                    {campaign.product.keepsProduct && 'You get to keep the product. '}
                    {campaign.product.willReimburse_or_productShipped && 'Product will be shipped to you.'}
                  </p>
                  {campaign.product.productLink && (
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Product Link</p>
                      <a
                        href={campaign.product.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-navy-dark hover:underline break-all"
                      >
                        {campaign.product.productLink}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Divider */}
            <div className="w-full h-px bg-[#D1D5DB]" />
          </>
        )}

        {/* Deliverables (individual cards) */}
        {deliverables.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-brand-navy mb-4">What you need to deliver</h3>
            <div className="space-y-3">
              {deliverables.map((d: any, i: number) => {
                const resolvedType = d.type || d.contentType || '';
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                    {/* Platform + Content Type */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-4 py-1 text-xs font-bold rounded-md capitalize text-[#FF385C] bg-[#F8F9FD]">
                        {resolvedType || 'Content'}
                      </span>
                      <span className="text-sm font-semibold text-brand-navy">
                        {d.platform.charAt(0).toUpperCase() + d.platform.slice(1)}
                      </span>
                    </div>
                    {/* Number + Description */}
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-brand-navy-dark text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">
                          {(d.quantity || 1) > 1 ? `x${d.quantity} ` : ''}
                          {d.description || `${resolvedType || 'Content'} delivery`}
                        </p>
                        {budget.contentCreationEnd && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Due: {formatShortDate(budget.contentCreationEnd)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ===== CONTENT GUIDELINES CARD ===== */}
      {(dos.length > 0 || donts.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-5">Content Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dos.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  </span>
                  Do&apos;s
                </p>
                <ul className="space-y-2.5">
                  {dos.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {donts.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                  </span>
                  Don&apos;ts
                </p>
                <ul className="space-y-2.5">
                  {donts.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">&#10007;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== ADDITIONAL REQUIREMENTS CARD (hashtags + mentions + questions) ===== */}
      {(hashtags.length > 0 || mentions.length > 0 || questions.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-5">Additional Requirements</h3>
          <div className="space-y-5">
            {hashtags.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-2">
                  Required Hashtags
                </p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-brand-navy text-white text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mentions.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-2">
                  Required Mentions / Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentions.map((m: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-brand-navy text-white text-xs font-medium rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {questions.length > 0 && (
              <div>
                <p className="text-[11px] text-[#999999] uppercase tracking-wide font-semibold mb-2">
                  Application Questions
                </p>
                <ol className="space-y-2.5">
                  {questions.map((q: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="font-semibold text-[#5B6CF6] min-w-[16px]">{i + 1}</span>
                      <span className="text-[#666666]">{q.question}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== IDEAL CREATOR PROFILE CARD ===== */}
      {campaign.audience && (campaign.audience.minFollowers || campaign.audience.ageMin || campaign.audience.targetLocation || campaign.audience.gender) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-5">Ideal Creator Profile</h3>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            {/* Demographics Column */}
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-3">Demographics</p>
              <div className="space-y-2">
                {(campaign.audience.ageMin || campaign.audience.ageMax) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Age Range</span>
                    <span className="text-sm font-bold text-brand-navy">
                      {campaign.audience.ageMin || 18}-{campaign.audience.ageMax || 65}
                    </span>
                  </div>
                )}
                {campaign.audience.gender && campaign.audience.gender !== 'any' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gender</span>
                    <span className="text-sm font-bold text-brand-navy capitalize">{campaign.audience.gender}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Audience Size Column */}
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-3">Audience Size</p>
              <div className="space-y-2">
                {campaign.audience.minFollowers ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Followers</span>
                    <span className="text-sm font-bold text-brand-navy">
                      {formatFollowerCount(campaign.audience.minFollowers)}+
                    </span>
                  </div>
                ) : null}
                {campaign.audience.minEngagements ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Min Engagement</span>
                    <span className="text-sm font-bold text-brand-navy">
                      {campaign.audience.minEngagements}%
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {/* Interests */}
          {campaign.categories && campaign.categories.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[11px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Interests</p>
              <p className="text-sm text-gray-700">{campaign.categories.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
