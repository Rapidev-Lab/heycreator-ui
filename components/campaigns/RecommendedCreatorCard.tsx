'use client';

import { useState } from 'react';
import {
    MessageSquare,
    Plus,
    Instagram,
    Linkedin,
    Youtube
} from 'lucide-react';
import { proxyImage } from '@/lib/utils';

interface RecommendedCreatorCardProps {
    creator: {
        id: string;
        name: string;
        handle: string;
        avatar?: string;
        bio: string;
        metrics: {
            followers: string;
            engagement: string;
            reach: string;
        };
        tags: string[];
        isVerified?: boolean;
        isTop?: boolean;
        location?: string;
        rating?: number;
    };
    onChat?: () => void;
    onAdd?: () => void;
    onToggleBookmark?: () => void;
    isBookmarked?: boolean;
    className?: string;
    isMobile?: boolean; // To switch layout based on view context
}

export default function RecommendedCreatorCard({
    creator,
    onChat,
    onAdd,
    onToggleBookmark,
    isBookmarked = false,
    className = '',
    isMobile = false,
}: RecommendedCreatorCardProps) {

    const colors = ['bg-red-500', 'bg-blue-600', 'bg-green-500', 'bg-brand-navy', 'bg-yellow-500', 'bg-pink-500'];
    const colorIndex = creator.name.length % colors.length;
    const avatarColor = colors[colorIndex];
    const [imageError, setImageError] = useState(false);

    // Get initials from name (first + last)
    const getInitials = (name: string) => {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className={`bg-white rounded-[32px] border-2 border-gray-200 p-6 flex flex-col h-full hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500 relative ${className}`}>
            {/* Bookmark Icon (Top Right) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark?.();
                }}
                className={`absolute top-6 right-6 transition-colors z-10 ${isBookmarked ? 'text-brand-navy' : 'text-gray-300 hover:text-brand-blue'}`}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isBookmarked ? "fill-brand-navy" : ""}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
            </button>

            {/* Top Section: Avatar & Stats */}
            <div className="flex items-center gap-5 mb-6">
                <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-50 shadow-sm">
                        {creator.avatar && !imageError ? (
                            <img
                                src={proxyImage(creator.avatar)}
                                alt={creator.name}
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className={`w-full h-full ${avatarColor} flex items-center justify-center text-white text-xl font-bold`}>
                                {getInitials(creator.name)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 grid grid-cols-3 divide-x divide-gray-50 bg-gray-50/30 rounded-2xl py-2">
                    <div className="text-center px-1">
                        <p className="text-[14px] font-black text-brand-blue">{creator.metrics.followers}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Followers</p>
                    </div>
                    <div className="text-center px-1">
                        <p className="text-[14px] font-black text-brand-blue">{creator.metrics.engagement}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Engagement</p>
                    </div>
                    <div className="text-center px-1">
                        <p className="text-[14px] font-black text-brand-blue">{creator.metrics.reach || 'N/A'}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">True Reach</p>
                    </div>
                </div>
            </div>

            {/* Name Section */}
            <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-black text-brand-blue text-[17px] leading-tight">{creator.name}</h3>
                <div className="flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L14.5 5.5H18.5L18.5 9.5L22 12L18.5 14.5V18.5H14.5L12 22L9.5 18.5H5.5V14.5L2 12L5.5 9.5V5.5H9.5L12 2Z" fill={creator.isTop ? "#FF3B30" : "#E5E7EB"} />
                        <circle cx="12" cy="12" r="5" fill={creator.isTop ? "#FF3B30" : "#E5E7EB"} stroke="white" strokeWidth="1" />
                        <path d="M10 12L11.5 13.5L14.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Handle */}
            <p className="text-[13px] text-gray-400 mb-5 font-bold tracking-tight">@@{creator.handle}</p>

            {/* Social Icons */}
            <div className="flex gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white cursor-pointer hover:bg-opacity-90 transition-all shadow-sm">
                    <Instagram size={14} strokeWidth={2.5} />
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white cursor-pointer hover:bg-opacity-90 transition-all shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.58-1.01V15.5c0 1.93-.65 3.84-1.85 5.37-1.2 1.53-2.93 2.57-4.8 2.93-1.87.36-3.83.05-5.5-.88-1.67-.93-2.92-2.48-3.51-4.3-.59-1.82-.48-3.84.3-5.58.78-1.74 2.21-3.12 3.97-3.87 1.76-.75 3.74-.75 5.5.01V11.2c-1.07-.44-2.28-.48-3.41-.09-1.13.39-2.06 1.18-2.58 2.23-.52 1.05-.62 2.29-.27 3.42.35 1.13 1.11 2.1 2.1 2.71a4.842 4.842 0 0 0 5.48-.02c1.38-.97 2.13-2.61 2.05-4.31V.02z" /></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white cursor-pointer hover:bg-opacity-90 transition-all shadow-sm">
                    <Youtube size={14} strokeWidth={2.5} />
                </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-300 mb-5" />

            {/* Bio */}
            <div className="text-[13px] font-medium text-gray-400 mb-6 line-clamp-2 min-h-[40px] leading-relaxed">
                {creator.bio || 'No bio provided.'}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8 h-[24px]">
                {creator.tags && creator.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#fff0f0] text-brand-accent rounded-full text-[10px] font-black uppercase tracking-wider">
                        {tag}
                    </span>
                ))}
            </div>

            {/* Actions */}
            <div className="mt-auto flex items-center gap-3">
                <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-[13px] font-black cursor-not-allowed opacity-60"
                    title="Chat coming soon"
                >
                    <MessageSquare size={14} className="text-gray-300" />
                    Chat
                </button>
                <button
                    onClick={onAdd}
                    className="flex-[1.4] flex items-center justify-center gap-2 px-3 py-3 bg-white border border-gray-200 rounded-xl text-brand-blue text-[13px] font-black hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
                >
                    <Plus size={14} className="text-gray-300" />
                    Add to Campaign
                </button>
            </div>
        </div>
    );
}
