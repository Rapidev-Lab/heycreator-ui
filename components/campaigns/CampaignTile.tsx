'use client';

import {
    Eye,
    Pencil,
    Users,
    Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Campaign, CampaignStatus } from '@/types/campaign';
import { Timestamp } from 'firebase/firestore';

interface CampaignTileProps {
    campaign: Campaign;
    onView: (id: string) => void;
}

export default function CampaignTile({ campaign, onView }: CampaignTileProps) {
    const router = useRouter();

    const getStatusStyle = (status: CampaignStatus) => {
        switch (status) {
            case CampaignStatus.ACTIVE:
                return 'bg-green-100 text-green-700';
            case CampaignStatus.PUBLISHED:
                return 'bg-blue-50 text-blue-600';
            case CampaignStatus.DRAFT:
                return 'bg-yellow-50 text-yellow-700';
            case CampaignStatus.COMPLETED:
                return 'bg-gray-100 text-gray-700';
            case CampaignStatus.IN_PROGRESS:
                return 'bg-orange-50 text-orange-700';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    const getStatusLabel = (status: CampaignStatus) => {
        if (status === CampaignStatus.IN_PROGRESS) return 'Paused';
        return status?.charAt(0) + status?.slice(1).toLowerCase();
    };

    const formatDate = (date: Date | Timestamp | string | null | undefined) => {
        if (!date) return 'No deadline';

        let dateObj: Date;
        if (date instanceof Timestamp) {
            dateObj = date.toDate();
        } else if (typeof date === 'string') {
            dateObj = new Date(date);
        } else {
            dateObj = date;
        }

        return dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get budget amount based on compensation model
    const getBudgetAmount = (): number => {
        const budget = campaign.budget;
        if (budget?.compensationModel === 'fixed') {
            return budget.fixedAmount || 0;
        }
        return budget?.maxRangeAmount || budget?.fixedAmount || 0;
    };

    return (
        <tr
            className="group hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onView(campaign.id)}
        >
            {/* Campaign Name */}
            <td className="py-4 px-6">
                <div className="font-semibold text-brand-navy text-sm">
                    {campaign.campaignTitle || ''}
                </div>
            </td>

            {/* Status */}
            <td className="py-4 px-6">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(campaign.status)}`}>
                    {getStatusLabel(campaign.status)}
                </span>
            </td>

            {/* Influencers */}
            <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">{campaign.stats?.acceptedApplications || 0}</span>
                </div>
            </td>

            {/* Budget */}
            <td className="py-4 px-6">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-brand-navy">
                        {formatCurrency(getBudgetAmount())}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                        Spent: {formatCurrency(0)}
                    </span>
                </div>
            </td>

            {/* Deadline */}
            <td className="py-4 px-6">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{formatDate(campaign.budget?.applicationDeadline)}</span>
                </div>
            </td>

            {/* Actions */}
            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => onView(campaign.id)}
                        className="p-2 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Campaign"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => router.push(`/brands/campaigns/create?id=${campaign.id}`)}
                        className="p-2 text-gray-400 hover:text-brand-navy hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit Campaign"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}
