// @/components/influencers/FilterSidebar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

// Placeholder data - to be replaced with API data
const tags = [
  { name: 'Conference', count: 5, color: 'bg-green-500' },
  { name: 'potential', count: 1, color: 'bg-red-500' },
];

const campaigns = [
  { name: 'Panarottis VAC 2', count: 0 },
  { name: 'Campmaster Spring Unlocked', count: 10 },
  { name: 'Eiger: Nicholas', count: 1 },
];

const customVariables = [
    { name: 'https://www.mazda.co.za/cars/mazda-cx-60/?utm...', count: 19, children: [
        { name: 'https://bit.ly/CX-60-inf1', count: 1 },
        { name: 'https://www.mazda.co.za/cars/mazda-cx-60/?utm_campaign=...', count: 1 },
    ]},
];

const activityOptions = [
  { name: 'Recently Viewed', count: 60 },
  { name: 'In Active Campaigns', count: 75 },
  { name: 'Accepted Campaign Invite', count: 532 },
];

const savedFilters = [
    // Placeholder for saved filter cards
];


const FilterSection = ({ title, children, onToggle, isOpen }: { title: string; children: React.ReactNode; onToggle: () => void; isOpen: boolean }) => {
    return (
        <div className="border-b border-gray-200">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full py-3 px-4 text-sm font-medium text-left text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
            >
                <span>{title}</span>
                <ChevronDown
                    className={`w-5 h-5 transform transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>
            {isOpen && <div className="px-4 pb-4 bg-gray-50/50">{children}</div>}
        </div>
    );
};

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterSidebar = ({ isOpen, onClose }: FilterSidebarProps) => {
    const [openSections, setOpenSections] = useState({
        tags: true,
        campaigns: false,
        customVariables: false,
        activity: false,
        savedFilters: false,
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<string[]>([]);

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const toggleTag = (tagName: string) => {
        setSelectedTags(prev =>
            prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
        );
    };

    const toggleCampaign = (campaignName: string) => {
        setSelectedCampaigns(prev =>
            prev.includes(campaignName) ? prev.filter(c => c !== campaignName) : [...prev, campaignName]
        );
    };

    const toggleActivity = (activityName: string) => {
        setSelectedActivity(prev =>
            prev.includes(activityName) ? prev.filter(a => a !== activityName) : [...prev, activityName]
        );
    };

    const clearAllFilters = () => {
        setSelectedTags([]);
        setSelectedCampaigns([]);
        setSelectedActivity([]);
    };

    const applyFilters = () => {
        // Apply filters logic here
        console.log('Applying filters:', { selectedTags, selectedCampaigns, selectedActivity });
        onClose();
    };

    const filteredCampaigns = campaigns.filter(campaign =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close filters"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Filter Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <FilterSection title="Tags" isOpen={openSections.tags} onToggle={() => toggleSection('tags')}>
                        <div className="space-y-2 py-3">
                            {tags.map(tag => (
                                <button
                                    key={tag.name}
                                    onClick={() => toggleTag(tag.name)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        selectedTags.includes(tag.name)
                                            ? 'bg-primary/10 border-l-2 border-primary'
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${tag.color}`}></span>
                                        <span className="text-sm text-gray-700">{tag.name}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">({tag.count})</span>
                                </button>
                            ))}
                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary-dark transition-colors">
                                <span>Manage Tags</span>
                            </button>
                        </div>
                    </FilterSection>

                    <FilterSection title="Active Campaigns" isOpen={openSections.campaigns} onToggle={() => toggleSection('campaigns')}>
                        <div className="py-3 space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search Campaign"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                            <div className="space-y-1 max-h-[300px] overflow-y-auto">
                                {filteredCampaigns.map(campaign => (
                                    <button
                                        key={campaign.name}
                                        onClick={() => toggleCampaign(campaign.name)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                                            selectedCampaigns.includes(campaign.name)
                                                ? 'bg-primary/10 border-l-2 border-primary font-medium'
                                                : 'hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="text-sm text-gray-700 truncate">{campaign.name}</span>
                                        {campaign.count > 0 && (
                                            <span className="text-sm text-gray-500 ml-2">({campaign.count})</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </FilterSection>

                    <FilterSection title="Custom Variables" isOpen={openSections.customVariables} onToggle={() => toggleSection('customVariables')}>
                        <div className="py-3 space-y-2">
                            {customVariables.map(variable => (
                                <button
                                    key={variable.name}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                                >
                                    <span className="text-sm text-gray-700 truncate">{variable.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">({variable.count})</span>
                                </button>
                            ))}
                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary-dark transition-colors">
                                <span>Manage Custom Variables</span>
                            </button>
                        </div>
                    </FilterSection>

                    <FilterSection title="Activity" isOpen={openSections.activity} onToggle={() => toggleSection('activity')}>
                        <div className="space-y-1 py-3">
                            {activityOptions.map(option => (
                                <button
                                    key={option.name}
                                    onClick={() => toggleActivity(option.name)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                        selectedActivity.includes(option.name)
                                            ? 'bg-primary/10 border-l-2 border-primary font-medium'
                                            : 'hover:bg-gray-100'
                                    }`}
                                >
                                    <span className="text-sm text-gray-700">{option.name}</span>
                                    <span className="text-sm text-gray-500">({option.count})</span>
                                </button>
                            ))}
                        </div>
                    </FilterSection>

                    <FilterSection title="Saved Filters" isOpen={openSections.savedFilters} onToggle={() => toggleSection('savedFilters')}>
                        <div className="py-3">
                            <p className="text-sm text-gray-500 text-center py-4">You have no saved filters.</p>
                            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary-dark transition-colors">
                                <span>Manage Saved Filters</span>
                            </button>
                        </div>
                    </FilterSection>
                </div>

                {/* Footer - Action Buttons */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white">
                    <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        Clear All
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;
