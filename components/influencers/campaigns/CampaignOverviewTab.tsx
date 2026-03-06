'use client';

import {
  CheckCircle2,
  XCircle,
  Package,
  Gift,
  ExternalLink,
  Hash,
  AtSign,
  MapPin,
  Calendar,
  Users,
  Eye,
  Clock,
  DollarSign,
} from 'lucide-react';

interface CampaignOverviewTabProps {
  campaign: {
    title: string;
    description: string;
    categories: string[];
    status: string;
    objectives: string[];
    budget: {
      compensationModel: string;
      currency: string;
      fixedAmount: number;
      minRangeAmount: number;
      maxRangeAmount: number;
      paymentTerms: string;
      applicationDeadline: string | null;
      contentCreationStart: string | null;
      contentCreationEnd: string | null;
    };
    timeline: {
      campaignStart: string | null;
      campaignEnd: string | null;
      applicationDeadline: string | null;
    };
    product: {
      productType?: string;
      productName?: string;
      productValue?: number;
      productLink?: string;
      productImagesUrls?: string[];
      keepsProduct?: boolean;
      willReimburse_or_productShipped?: boolean;
    };
    audience: {
      ageMin?: number;
      ageMax?: number;
      gender?: string;
      targetLocation?: string;
      minFollowers?: number;
      minEngagements?: number;
    };
    tasks: {
      requiredDeliverables?: {
        platform: string;
        contentType: string;
        quantity: number;
        description: string;
      }[];
      dos?: string[];
      donts?: string[];
      metaData?: {
        requiredHashTags?: string[];
        mentions_or_tags?: string[];
      };
    };
    brandInfo: {
      id: string;
      name: string;
      logo: string | null;
      verified: boolean;
    };
  };
}

function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  const symbol = currency === 'ZAR' ? 'R ' : currency === 'USD' ? '$ ' : currency + ' ';
  return `${symbol}${amount.toLocaleString()}`;
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'TBD';
  return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDuration(start: string | null, end: string | null): string {
  if (!start || !end) return 'TBD';
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'TBD';
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'TBD';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  const weeks = Math.ceil(days / 7);
  if (days < 30) return weeks === 1 ? '1 week' : `${weeks} weeks`;
  const months = Math.ceil(days / 30);
  return months === 1 ? '1 month' : `${months} months`;
}

function formatProductType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPastDate(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

const DELIVERABLE_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-brand-navy-50', text: 'text-brand-navy' },
  { bg: 'bg-green-100', text: 'text-green-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
];

export default function CampaignOverviewTab({ campaign }: CampaignOverviewTabProps) {
  const budget = campaign.budget || {};
  const budgetMin = budget.compensationModel === 'range' ? budget.minRangeAmount : budget.fixedAmount;
  const budgetMax = budget.compensationModel === 'range' ? budget.maxRangeAmount : budget.fixedAmount;
  const currency = budget.currency || 'ZAR';
  const deliverables = campaign.tasks?.requiredDeliverables || [];
  const dos = campaign.tasks?.dos || [];
  const donts = campaign.tasks?.donts || [];
  const hashtags = campaign.tasks?.metaData?.requiredHashTags || [];
  const mentions = campaign.tasks?.metaData?.mentions_or_tags || [];
  const timeline = campaign.timeline || {};

  // Build timeline milestones
  const milestones: { label: string; date: string | null; description: string }[] = [];
  if (timeline.applicationDeadline) {
    milestones.push({
      label: 'Application Deadline',
      date: timeline.applicationDeadline,
      description: isPastDate(timeline.applicationDeadline)
        ? 'Application period has ended'
        : 'Apply before this date',
    });
  }
  if (budget.contentCreationStart) {
    milestones.push({
      label: 'Content Creation Starts',
      date: budget.contentCreationStart,
      description: 'Begin creating content for the campaign',
    });
  }
  if (timeline.campaignStart) {
    milestones.push({
      label: 'Campaign Launch',
      date: timeline.campaignStart,
      description: 'Campaign goes live and content is published',
    });
  }
  if (timeline.campaignEnd) {
    milestones.push({
      label: 'Campaign End',
      date: timeline.campaignEnd,
      description: 'Final deliverables due and campaign wraps up',
    });
  }

  // Status label
  const statusMap: Record<string, { label: string; bg: string; text: string }> = {
    PUBLISHED: { label: 'Active Campaign', bg: 'bg-green-100', text: 'text-green-700' },
    ACTIVE: { label: 'Active Campaign', bg: 'bg-green-100', text: 'text-green-700' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-700' },
    COMPLETED: { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-600' },
    CLOSED: { label: 'Closed', bg: 'bg-gray-100', text: 'text-gray-500' },
  };
  const statusStyle = statusMap[campaign.status] || statusMap.ACTIVE;

  return (
    <div className="space-y-6">
      {/* Stats row (4 gray cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">Compensation</p>
          <p className="text-sm font-bold text-brand-navy">
            {budgetMin === budgetMax
              ? formatCurrency(budgetMin, currency)
              : `${formatCurrency(budgetMin, currency)} - ${formatCurrency(budgetMax, currency)}`}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">Timeline</p>
          <p className="text-sm font-bold text-brand-navy">
            {formatShortDate(timeline.campaignStart)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">Location</p>
          <p className="text-sm font-bold text-brand-navy">
            {campaign.audience?.targetLocation || 'Any'}
          </p>                       
        </div>
        <div className="bg-white rounded-xl p-4">
          <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium mb-1">Duration</p>
          <p className="text-sm font-bold text-brand-navy">
            {getDuration(timeline.campaignStart, timeline.campaignEnd)}
          </p>
        </div>
      </div>

      {/* Campaign Description */}
      {campaign.description && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-3">Campaign Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{campaign.description}</p>
        </div>
      )}

      {/* Vertical Timeline */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-6">Timeline</h3>
          <div className="relative">
            {milestones.map((m, i) => {
              const past = isPastDate(m.date);
              const isLast = i === milestones.length - 1;
              const dotColor = past ? 'bg-purple-500' : i === 0 ? 'bg-blue-500' : 'bg-gray-300';

              return (
                <div key={i} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full ${dotColor} flex-shrink-0 mt-1 ring-4 ring-white`} />
                    {!isLast && <div className="w-0.5 bg-gray-200 flex-1 min-h-[40px]" />}
                  </div>
                  <div className={isLast ? 'pb-0' : 'pb-6'}>
                    <div className="flex items-center gap-3 mb-0.5">
                      <p className="text-sm font-semibold text-brand-navy">{m.label}</p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          past ? 'bg-brand-navy-50 text-brand-navy' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {formatShortDate(m.date)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{m.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-4">What You Need to Deliver</h3>
          <div className="space-y-4">
            {deliverables.map((d, i) => {
              const color = DELIVERABLE_COLORS[i % DELIVERABLE_COLORS.length];
              return (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className={`w-8 h-8 rounded-full ${color.bg} ${color.text} flex items-center justify-center flex-shrink-0 text-sm font-bold`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-navy">
                      {d.platform.charAt(0).toUpperCase() + d.platform.slice(1)} {d.contentType}
                      {(d.quantity || 1) > 1 && (
                        <span className="text-gray-400 font-normal ml-1">x{d.quantity}</span>
                      )}
                    </p>
                    {d.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Product Details */}
      {campaign.product?.productName && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-4">Product Details</h3>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {campaign.product.productImagesUrls?.[0] ? (
                <img
                  src={campaign.product.productImagesUrls[0]}
                  alt={campaign.product.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-base font-semibold text-brand-navy">
                  {campaign.product.productName}
                </h4>
                {campaign.product.productValue ? (
                  <span className="text-sm font-bold text-brand-navy whitespace-nowrap">
                    {formatCurrency(campaign.product.productValue, currency)}
                  </span>
                ) : null}
              </div>
              {campaign.product.productType && (
                <p className="text-xs text-gray-500 mb-2">
                  {formatProductType(campaign.product.productType)}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {campaign.product.keepsProduct && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-medium">
                    <Gift className="w-3 h-3" /> Keep as gift
                  </span>
                )}
                {campaign.product.willReimburse_or_productShipped && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full font-medium">
                    <Package className="w-3 h-3" /> Shipped to you
                  </span>
                )}
              </div>
              {campaign.product.productLink && (
                <a
                  href={campaign.product.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-navy hover:underline font-medium"
                >
                  View product <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Guidelines */}
      {(dos.length > 0 || donts.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-4">Content Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dos.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Do&apos;s
                </p>
                <ul className="space-y-2">
                  {dos.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-green-800">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">&#10003;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {donts.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Don&apos;ts
                </p>
                <ul className="space-y-2">
                  {donts.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-red-800">
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

      {/* Additional Requirements (Hashtags & Mentions) */}
      {(hashtags.length > 0 || mentions.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-brand-navy mb-4">Additional Requirements</h3>
          <div className="space-y-4">
            {hashtags.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Required Hashtags
                </p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {mentions.length > 0 && (
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold mb-2 flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5" /> Required Mentions / Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {mentions.map((m, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                    >
                      @{m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
