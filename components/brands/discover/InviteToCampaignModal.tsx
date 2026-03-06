'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { proxyImage } from '@/lib/utils';

interface CreatorInfo {
  name: string;
  handle: string;
  avatarUrl: string;
  instagramFollowers?: string; // Example of specific platform metrics
  tiktokFollowers?: string;
}

interface InviteToCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: CreatorInfo;
}

export default function InviteToCampaignModal({ isOpen, onClose, creator }: InviteToCampaignModalProps) {
  // Hooks must be called before any conditional returns
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [personalMessage, setPersonalMessage] = useState(`Hi ${creator.name}, we'd love to collaborate with you on our upcoming campaign please review and let me know if you have any comments.`);
  const [avatarError, setAvatarError] = useState(false);

  // Dummy data for campaigns
  const campaigns = [
    { id: '1', name: 'Summer Fashion Campaign' },
    { id: '2', name: 'Winter Skincare Launch' },
    { id: '3', name: 'Tech Gadget Review' },
  ];

  if (!isOpen) return null;

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  const proxiedAvatar = proxyImage(creator.avatarUrl);

  const handleSubmit = () => {
    console.log('Invite sent:', {
      creator: creator.name,
      campaignId: selectedCampaign,
      message: personalMessage,
    });
    onClose();
    alert(`Invitation sent to ${creator.name} for ${campaigns.find(c => c.id === selectedCampaign)?.name || 'a campaign'}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Invite to Campaign</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Creator Info */}
        <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            {proxiedAvatar && !avatarError ? (
              <Image src={proxiedAvatar} alt={creator.name} fill className="object-cover" onError={() => setAvatarError(true)} />
            ) : (
              <div className="w-full h-full bg-brand-navy flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(creator.name)}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{creator.name}</p>
            <p className="text-sm text-gray-500">{creator.handle}</p>
            {/* Display platform followers if available */}
            {creator.instagramFollowers && <p className="text-xs text-gray-400">Instagram: {creator.instagramFollowers}</p>}
            {creator.tiktokFollowers && <p className="text-xs text-gray-400">TikTok: {creator.tiktokFollowers}</p>}
          </div>
        </div>

        {/* Campaign Selection */}
        <div>
          <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-2">Select Campaign <span className="text-red-500">*</span></label>
          <select
            id="campaign"
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Choose a campaign</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
        </div>

        {/* Personal Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Personal Message <span className="text-red-500">*</span></label>
          <textarea
            id="message"
            rows={4}
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-navy rounded-md hover:bg-brand-navy-light"
            disabled={!selectedCampaign}
          >
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}
