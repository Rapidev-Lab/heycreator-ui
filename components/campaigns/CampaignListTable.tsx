'use client';

import { Campaign } from '@/types/campaign';
import CampaignTile from './CampaignTile';

interface CampaignListTableProps {
    campaigns: Campaign[];
    onView: (id: string) => void;
}

export default function CampaignListTable({ campaigns, onView }: CampaignListTableProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="bg-[#F0F4F8] border-b border-gray-100">
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                                Campaign Name
                            </th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Influencers
                            </th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Budget
                            </th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Deadline
                            </th>
                            <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E0E0E0]">
                        {campaigns.map((campaign) => (
                            <CampaignTile
                                key={campaign.id}
                                campaign={campaign}
                                onView={onView}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
