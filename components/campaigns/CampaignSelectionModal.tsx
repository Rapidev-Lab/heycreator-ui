'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { Campaign } from '@/types/campaign';

interface CampaignSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaigns: Campaign[];
    creatorName: string;
    onSelect: (campaignId: string, message: string) => Promise<void>;
    loading?: boolean;
}

export default function CampaignSelectionModal({
    isOpen,
    onClose,
    campaigns,
    creatorName,
    onSelect,
    loading = false,
}: CampaignSelectionModalProps) {
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedCampaignId) return;
        await onSelect(selectedCampaignId, message);
        setSelectedCampaignId('');
        setMessage('');
    };

    const activeCampaigns = campaigns.filter(
        (c) => c.status === 'PUBLISHED' || c.status === 'ACTIVE'
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-brand-navy">Add to Campaign</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Invite {creatorName} to collaborate
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {activeCampaigns.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No active campaigns available</p>
                            <p className="text-sm text-gray-400">
                                Create a campaign first to invite creators
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Campaign Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Campaign
                                </label>
                                <div className="space-y-2">
                                    {activeCampaigns.map((campaign) => (
                                        <button
                                            key={campaign.id}
                                            onClick={() => setSelectedCampaignId(campaign.id)}
                                            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedCampaignId === campaign.id
                                                    ? 'border-brand-navy bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            disabled={loading}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {campaign.campaignTitle}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Status: {campaign.status}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCampaignId === campaign.id
                                                            ? 'border-brand-navy bg-brand-navy'
                                                            : 'border-gray-300'
                                                        }`}
                                                >
                                                    {selectedCampaignId === campaign.id && (
                                                        <div className="w-2 h-2 bg-white rounded-full" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Optional Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Add a personal message to your invitation..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent resize-none"
                                    rows={3}
                                    disabled={loading}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {activeCampaigns.length > 0 && (
                    <div className="flex items-center gap-3 p-6 border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedCampaignId || loading}
                            className="flex-1 px-4 py-2.5 bg-brand-navy text-white rounded-lg font-medium hover:bg-brand-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send Invitation'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
