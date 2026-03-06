'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Calendar } from 'lucide-react';

// Helper function for consistent number formatting
function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export type BiddingStatus = 'open' | 'closed' | 'ending-soon';

export interface MarketPlaceCampaignData {
    id: string;
    brandName: string;
    brandLogo: string;
    title: string;
    category: string;
    platforms: string[];
    budgetMin: number;
    budgetMax: number;
    daysRemaining: number;
    status: BiddingStatus;
}

interface MarketPlaceCampaignCardProps {
    campaign: MarketPlaceCampaignData;
    onViewBrief?: () => void;
}

export default function MarketPlaceCampaignCard({
    campaign,
    onViewBrief,
}: MarketPlaceCampaignCardProps) {
    const router = useRouter();

    const handleViewBrief = () => {
        if (onViewBrief) {
            onViewBrief();
        } else {
            router.push(`/influencers/marketplace/${campaign.id}`);
        }
    };

    return (
        <div className="flex flex-col items-start gap-4 p-5 rounded-2xl border border-[#E0E0E0] bg-white shadow-sm">
            {/* Header: Brand Info & Status */}
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    {campaign.brandLogo ? (
                        <img
                            src={campaign.brandLogo}
                            alt={campaign.brandName}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-lg">
                            {campaign.brandName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="font-semibold text-brand-navy">{campaign.brandName}</span>
                </div>
                <StatusBadge status={campaign.status} />
            </div>

            {/* Campaign Title */}
            <h3 className="text-lg font-bold text-brand-navy">{campaign.title}</h3>

            {/* Category Tag */}
            <div>
                <span className="inline-block px-3 py-1 bg-brand-accent-light text-brand-accent text-xs font-medium rounded-full">
                    {campaign.category}
                </span>
            </div>

            {/* Platform Tags */}
            <div className="flex gap-2 flex-wrap">
                {campaign.platforms.map((platform) => (
                    <span
                        key={platform}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                        {platform}
                    </span>
                ))}
            </div>

            {/* Budget Range */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>R {formatNumber(campaign.budgetMin)} - R {formatNumber(campaign.budgetMax)}</span>
            </div>

            {/* Deadline */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Ends in {campaign.daysRemaining} days</span>
            </div>

            {/* View Brief Button */}
            <button
                onClick={handleViewBrief}
                className="w-full py-3 px-6 bg-brand-navy text-white text-sm font-medium rounded-full hover:bg-brand-navy-light transition-colors mt-auto"
            >
                View Brief
            </button>
        </div>
    );
}

function StatusBadge({ status }: { status: BiddingStatus }) {
    const config: Record<BiddingStatus, { label: string; className: string }> = {
        'open': {
            label: 'Bidding Open',
            className: 'bg-green-100 text-green-700',
        },
        'closed': {
            label: 'Bidding Closed',
            className: 'bg-gray-100 text-gray-600',
        },
        'ending-soon': {
            label: 'Ending Soon',
            className: 'bg-amber-100 text-amber-700',
        },
    };

    const { label, className } = config[status];

    return (
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${className}`}>
            {label}
        </span>
    );
}
