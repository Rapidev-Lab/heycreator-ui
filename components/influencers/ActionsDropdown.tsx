// @/components/influencers/ActionsDropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, PlusCircle, Tag, FileText, Mail, BarChart, Send } from 'lucide-react';

interface ActionsDropdownProps {
    selectedCount: number;
    onAction: (action: string) => void;
}

const ActionsDropdown = ({ selectedCount, onAction }: ActionsDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        if (selectedCount > 0) {
            setIsOpen(prev => !prev);
        }
    };

    const handleActionClick = (action: string) => {
        onAction(action);
        setIsOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isDisabled = selectedCount === 0;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className={`flex items-center justify-between px-4 py-2 text-sm font-medium rounded-lg shadow-sm focus:ring-offset-2 transition-colors border
                    ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}
                `}
                style={{ height: '40px', minWidth: '120px' }}
                onClick={handleToggle}
                disabled={isDisabled}
                title={isDisabled ? "Select at least one influencer to perform an action" : ""}
            >
                <span>Actions</span>
                <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && !isDisabled && (
                <div className="absolute right-0 mt-2 w-60 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="actions-menu">
                        <button
                            onClick={() => handleActionClick('add-to-campaign')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            role="menuitem"
                        >
                            <PlusCircle className="mr-3 h-4 w-4" /> Add To Campaign
                        </button>
                        <button
                            onClick={() => handleActionClick('add-tag')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            role="menuitem"
                        >
                            <Tag className="mr-3 h-4 w-4" /> Add Tag
                        </button>
                        <button
                            onClick={() => handleActionClick('create-pdf-report')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            role="menuitem"
                        >
                            <FileText className="mr-3 h-4 w-4" /> Create PDF Report
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                            onClick={() => handleActionClick('fetch-emails')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            role="menuitem"
                        >
                            <Mail className="mr-3 h-4 w-4" /> Fetch Email Addresses
                        </button>
                        <button
                            onClick={() => handleActionClick('get-tiktok-demographics')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            role="menuitem"
                        >
                            <BarChart className="mr-3 h-4 w-4" /> Get TikTok Demographics
                        </button>
                        <button
                            onClick={() => handleActionClick('send-mass-email')}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors"
                            role="menuitem"
                        >
                            <Send className="mr-3 h-4 w-4" /> Send Mass Email
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionsDropdown;
