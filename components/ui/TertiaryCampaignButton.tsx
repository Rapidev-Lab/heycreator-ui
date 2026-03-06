import React from 'react';

interface TertiaryCampaignButtonProps {
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export default function TertiaryCampaignButton({
    label,
    active = false,
    onClick
}: TertiaryCampaignButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={!active}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {label}
        </button>
    );
}
