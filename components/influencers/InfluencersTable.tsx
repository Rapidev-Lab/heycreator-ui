// @/components/influencers/InfluencersTable.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Influencer, SortOption } from '@/types/influencer';
import { ChevronDown, Heart, Users } from 'lucide-react';

interface InfluencersTableProps {
    influencers: Influencer[];
    sortBy: SortOption;
    sortDirection: 'asc' | 'desc';
    onSort: (column: SortOption) => void;
    bulkSelectMode: boolean;
    selectedInfluencers: string[];
    onToggleSelect: (id: string) => void;
    onSelectAll: (allSelected: boolean) => void;
    onRowClick?: (influencer: Influencer) => void; // Navigate / save on row click
    basePath?: string; // Fallback: navigate to basePath/id if onRowClick not provided
}

const InfluencersTable = ({ influencers, sortBy, sortDirection, onSort, bulkSelectMode, selectedInfluencers, onToggleSelect, onSelectAll, onRowClick, basePath = '/brands/influencers' }: InfluencersTableProps) => {
    const getSortIcon = (column: SortOption) => {
        if (sortBy === column) {
            return sortDirection === 'asc' ? <ChevronDown className="w-3 h-3 rotate-180" /> : <ChevronDown className="w-3 h-3" />;
        }
        return null;
    };

    const TableHeader = () => {
        const isAllSelected = influencers.length > 0 && selectedInfluencers.length === influencers.length;
        const isIndeterminate = selectedInfluencers.length > 0 && selectedInfluencers.length < influencers.length;
        const checkboxRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (checkboxRef.current) {
                checkboxRef.current.indeterminate = isIndeterminate;
            }
        }, [isIndeterminate]);

        return (
            <thead className="bg-gray-50">
                <tr>
                    {bulkSelectMode && (
                        <th scope="col" className="px-3 py-2 text-left">
                            <input
                                ref={checkboxRef}
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                checked={isAllSelected}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                        </th>
                    )}
                    <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('name')}
                    >
                        <div className="flex items-center gap-1">
                            Influencer
                            {getSortIcon('name')}
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('name')}
                    >
                        <div className="flex items-center gap-1">
                            Name
                            {getSortIcon('name')}
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('dateViewed')}
                    >
                        <div className="flex items-center gap-1">
                            Date viewed
                            {getSortIcon('dateViewed')}
                        </div>
                    </th>
                    <th
                        scope="col"
                        className="px-3 py-2 text-left text-xs font-medium text-gray-600 cursor-pointer hover:bg-gray-100"
                        onClick={() => onSort('influenceScore')}
                    >
                        <div className="flex items-center gap-1">
                            Influence
                            {getSortIcon('influenceScore')}
                        </div>
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                        Skills
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                        Location
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                        Contact info
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                        Email
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                        Custom variables
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                        Tags
                    </th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                        Campaigns
                    </th>
                </tr>
            </thead>
        );
    };

    const TableRow = ({ influencer }: { influencer: Influencer }) => {
        const router = useRouter();
        const isSelected = influencer.id ? selectedInfluencers.includes(influencer.id) : false;
        const handleRowClick = () => {
            if (bulkSelectMode && influencer.id) {
                onToggleSelect(influencer.id);
            } else if (onRowClick) {
                onRowClick(influencer);
            } else if (influencer.id) {
                router.push(`${basePath}/${influencer.id}`);
            }
        };

        return (
            <tr
                className={`border-b ${isSelected && bulkSelectMode ? 'bg-primary/5' : 'bg-white hover:bg-gray-50'} cursor-pointer transition-colors`}
                onClick={handleRowClick}
            >
                {bulkSelectMode && influencer.id && (
                    <td className="px-3 py-2.5">
                        <input
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            checked={isSelected}
                            onChange={() => onToggleSelect(influencer.id!)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </td>
                )}
                <td className="px-3 py-2.5 whitespace-nowrap">
                    <img className="h-8 w-8 rounded-full object-cover" src={influencer.avatar} alt={influencer.displayName} />
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">{influencer.displayName}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">01/26/26</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-sm font-medium text-primary">{influencer.influenceScore}</span>
                    </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">Sports, Music</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">{influencer.location || '-'}</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">+</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">-</td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">-</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 inline-flex text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Conference
                    </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-500">-</td>
            </tr>
        );
    };

    return (
        <div className="flex flex-col w-full">
            <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                        {influencers.length === 0 ? (
                            <div className="text-center py-12 px-4 bg-gray-50">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers to display</h3>
                                <p className="text-gray-600 text-sm">Adjust your filters or search terms.</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <TableHeader />
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {influencers.map((influencer) => (
                                        <TableRow key={influencer.id} influencer={influencer} />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfluencersTable;
