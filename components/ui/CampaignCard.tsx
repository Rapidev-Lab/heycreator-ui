'use client';

import React from 'react';
import Image from 'next/image';
import { Calendar, MessageSquare, Check } from 'lucide-react';
import CampaignPrimaryButton from '@/components/ui/CampaignPrimaryButton';
import SecondaryOutlinedButton from '@/components/ui/SecondaryOutlinedButton';

// Helper function for consistent number formatting
function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export interface Deliverable {
    id: string;
    type: string;
    description: string;
    dueDate: string;
    completed: boolean;
}

export interface CampaignCardData {
    id: string;
    title: string;
    brandName: string;
    brandLogo: string;
    status: 'in-progress' | 'review' | 'completed' | string;
    payment: number;
    tags: string[];
    deliverables: Deliverable[];
    progress: number;
    startDate: string;
    dueDate: string;
    daysRemaining: number;
}

interface CampaignCardProps {
    campaign: CampaignCardData;
    onMessageBrand?: () => void;
    onSubmitWork?: () => void;
}

export default function CampaignCard({
    campaign,
    onMessageBrand,
    onSubmitWork,
}: CampaignCardProps) {
    return (
        <div className="flex flex-col items-start gap-3 p-[21px] rounded-2xl border border-[#E0E0E0] bg-white">
            {/* Header */}
            <div className="flex items-start justify-between w-full">
                <div className="flex items-center gap-3">
                    <Image
                        src={campaign.brandLogo}
                        alt={campaign.brandName}
                        width={48}
                        height={48}
                        className="rounded-full"
                    />
                    <div>
                        <h3 className="font-semibold text-brand-navy">{campaign.title}</h3>
                        <p className="text-sm text-gray-500">{campaign.brandName}</p>
                    </div>
                </div>
                <div className="text-right">
                    <StatusBadge status={campaign.status} />
                    <p className="text-lg font-bold text-brand-navy mt-1">
                        R {formatNumber(campaign.payment)}
                    </p>
                    <p className="text-xs text-gray-500">{campaign.daysRemaining} days</p>
                </div>
            </div>

            {/* Tags */}
            <div className="flex gap-2">
                {campaign.tags.map((tag) => (
                    <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* Deliverables */}
            <div className="space-y-2 w-full">
                {campaign.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${deliverable.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300'
                                    }`}
                            >
                                {deliverable.completed && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">{deliverable.type}</p>
                                <p className="text-xs text-gray-400">{deliverable.description}</p>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500">{deliverable.dueDate}</span>
                    </div>
                ))}
            </div>

            {/* Progress */}
            <div className="w-full">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>
                        Progress: {campaign.progress === 0
                            ? `0/${campaign.deliverables.length} completed`
                            : `${campaign.progress}% completed`}
                    </span>
                    <span>{campaign.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-brand-navy h-2 rounded-full transition-all"
                        style={{ width: `${campaign.progress}%` }}
                    />
                </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Started: {campaign.startDate}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {campaign.dueDate}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full">
                <SecondaryOutlinedButton
                    label="Message Brand"
                    onClick={onMessageBrand}
                    icon={MessageSquare}
                    className="flex-1"
                />
                <CampaignPrimaryButton
                    label="Submit Work"
                    onClick={onSubmitWork}
                    className="flex-1"
                />
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        'in-progress': {
            label: 'In Progress',
            className: 'bg-blue-100 text-blue-700',
        },
        review: {
            label: 'In Review',
            className: 'bg-amber-100 text-amber-700',
        },
        completed: {
            label: 'Completed',
            className: 'bg-green-100 text-green-700',
        },
    };

    const { label, className } = config[status] || config['in-progress'];

    return (
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>
            {label}
        </span>
    );
}
