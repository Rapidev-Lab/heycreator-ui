'use client';

import React from 'react';
import { Eye, Loader2, XCircle } from 'lucide-react';

// Helper function for consistent number formatting
function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export type ApplicationStatus = 'pending' | 'counter-offer' | 'accepted' | 'declined' | 'expired';

export interface CampaignApplicationData {
    id: string;
    campaignId: string;
    title: string;
    brandName: string;
    brandLogo: string;
    category: string;
    categories?: string[];
    tags: string[];
    yourBid: number;
    budgetMin: number;
    budgetMax: number;
    currency?: string;
    status: ApplicationStatus;
    counterOffer?: number;
    daysRemaining: number;
    startDate: string;
    endDate: string;
    pitchMessage?: string;
    campaignStatus?: string;
    productImageUrl?: string;
    appliedAt?: string;
    reviewedAt?: string;
    applicationDeadlineDate?: string;
    campaignEndDate?: string;
    platforms?: string[];
    description?: string;
    campaignObjectives?: string[];
    deliverables?: { platform: string; contentType: string; quantity: number }[];
}

interface CampaignApplicationCardProps {
    application: CampaignApplicationData;
    onView?: () => void;
    onWithdraw?: () => void;
    isWithdrawing?: boolean;
}

export default function CampaignApplicationCard({
    application,
    onView,
    onWithdraw,
    isWithdrawing,
}: CampaignApplicationCardProps) {
    return (
        <div className="flex flex-col items-start gap-3 p-[21px] rounded-2xl border border-[#E0E0E0] bg-white">
            {/* Header Row */}
            <div className="flex items-start gap-3 w-full">
                {application.brandLogo ? (
                    <img
                        src={application.brandLogo}
                        alt={application.brandName}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {application.brandName.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-brand-navy">{application.title}</h3>
                        <StatusBadge status={application.status} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{application.category}</span>
                        <span>•</span>
                        <span>{application.brandName}</span>
                    </div>
                    {/* Tags */}
                    <div className="flex gap-2 mt-2">
                        {application.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bid & Budget Info */}
            <div className="text-sm">
                <span className="text-gray-600">Your Bid: </span>
                <span className="font-semibold text-brand-navy">R {formatNumber(application.yourBid)}</span>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-gray-600">Budget: </span>
                <span className="font-medium text-gray-700">
                    R {formatNumber(application.budgetMin)} - R {formatNumber(application.budgetMax)}
                </span>
            </div>

            {/* Date Range */}
            <div className="text-xs text-gray-500">
                {application.startDate} - {application.endDate}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full justify-end">
                {onWithdraw && (
                    <button
                        onClick={onWithdraw}
                        disabled={isWithdrawing}
                        className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isWithdrawing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <XCircle className="w-4 h-4" />
                        )}
                        Withdraw
                    </button>
                )}
                <button
                    onClick={onView}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                        application.status === 'accepted'
                            ? 'text-brand-navy font-medium hover:text-brand-navy-light'
                            : 'text-gray-600 hover:text-brand-navy'
                    }`}
                >
                    <Eye className="w-4 h-4" />
                    {application.status === 'accepted' ? 'Manage' : 'View'}
                </button>
                {application.status === 'pending' && (
                    <span className="text-sm text-gray-400 italic">Awaiting response</span>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
    const config: Record<ApplicationStatus, { label: string; className: string }> = {
        'pending': {
            label: 'Pending',
            className: 'bg-gray-100 text-gray-700',
        },
        'counter-offer': {
            label: 'Counter-Offer',
            className: 'bg-amber-100 text-amber-700',
        },
        'accepted': {
            label: 'Accepted',
            className: 'bg-green-100 text-green-700',
        },
        'declined': {
            label: 'Declined',
            className: 'bg-red-100 text-red-700',
        },
        'expired': {
            label: 'Withdrawn',
            className: 'bg-gray-100 text-gray-500',
        },
    };

    const { label, className } = config[status];

    return (
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>
            {label}
        </span>
    );
}
