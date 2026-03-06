import { MarketPlaceCampaignData } from '@/components/ui/MarketPlaceCampaignCard';

/**
 * Mock marketplace campaigns data for influencer marketplace
 * This data represents campaigns available for influencers to apply to
 * Will be replaced with API calls to the backend in production
 */
export const marketplaceCampaigns: MarketPlaceCampaignData[] = [
    {
        id: 'mkt-001',
        brandName: 'GlowUp Cosmetics',
        brandLogo: 'https://ui-avatars.com/api/?name=GC&background=eab8a0&color=fff',
        title: 'Summer Skincare Launch',
        category: 'Beauty',
        platforms: ['Instagram', 'TikTok'],
        budgetMin: 500,
        budgetMax: 800,
        daysRemaining: 5,
        status: 'open',
    },
    {
        id: 'mkt-002',
        brandName: 'FitLife Pro',
        brandLogo: 'https://ui-avatars.com/api/?name=FL&background=3b82f6&color=fff',
        title: 'Fitness App Promotion',
        category: 'Health & Fitness',
        platforms: ['YouTube', 'Instagram'],
        budgetMin: 1000,
        budgetMax: 2000,
        daysRemaining: 3,
        status: 'ending-soon',
    },
    {
        id: 'mkt-003',
        brandName: 'TechNova',
        brandLogo: 'https://ui-avatars.com/api/?name=TN&background=8b5cf6&color=fff',
        title: 'Smart Watch Review',
        category: 'Tech',
        platforms: ['YouTube', 'TikTok'],
        budgetMin: 1500,
        budgetMax: 2500,
        daysRemaining: 10,
        status: 'open',
    },
    {
        id: 'mkt-004',
        brandName: 'FreshFit Nutrition',
        brandLogo: 'https://ui-avatars.com/api/?name=FF&background=22c55e&color=fff',
        title: 'Protein Shake Campaign',
        category: 'Health & Wellness',
        platforms: ['Instagram', 'TikTok'],
        budgetMin: 800,
        budgetMax: 1500,
        daysRemaining: 7,
        status: 'open',
    },
    {
        id: 'mkt-005',
        brandName: 'StyleHaven',
        brandLogo: 'https://ui-avatars.com/api/?name=SH&background=ec4899&color=fff',
        title: 'Fall Fashion Collection',
        category: 'Fashion',
        platforms: ['Instagram', 'YouTube'],
        budgetMin: 2000,
        budgetMax: 3500,
        daysRemaining: 14,
        status: 'open',
    },
    {
        id: 'mkt-006',
        brandName: 'BeanBrew Coffee',
        brandLogo: 'https://ui-avatars.com/api/?name=BB&background=78350f&color=fff',
        title: 'Morning Routine Series',
        category: 'Food & Beverage',
        platforms: ['TikTok', 'Instagram'],
        budgetMin: 400,
        budgetMax: 700,
        daysRemaining: 2,
        status: 'ending-soon',
    },
    {
        id: 'mkt-007',
        brandName: 'GameZone',
        brandLogo: 'https://ui-avatars.com/api/?name=GZ&background=ef4444&color=fff',
        title: 'Gaming Headset Launch',
        category: 'Gaming',
        platforms: ['YouTube', 'Twitch'],
        budgetMin: 1200,
        budgetMax: 2000,
        daysRemaining: 8,
        status: 'open',
    },
    {
        id: 'mkt-008',
        brandName: 'PureGlow',
        brandLogo: 'https://ui-avatars.com/api/?name=PG&background=14b8a6&color=fff',
        title: 'Organic Skincare Line',
        category: 'Beauty',
        platforms: ['Instagram'],
        budgetMin: 600,
        budgetMax: 1000,
        daysRemaining: 6,
        status: 'open',
    },
];

/**
 * Get marketplace campaigns filtered by tab
 */
export function getMarketplaceCampaignsByTab(tab: 'recommended' | 'new' | 'saved'): MarketPlaceCampaignData[] {
    switch (tab) {
        case 'recommended':
            return marketplaceCampaigns;
        case 'new':
            return marketplaceCampaigns.filter(c => c.daysRemaining >= 7);
        case 'saved':
            // For now, return empty - this would be fetched from user's saved campaigns
            return [];
        default:
            return marketplaceCampaigns;
    }
}

/**
 * Filter campaigns by search query
 */
export function searchMarketplaceCampaigns(query: string): MarketPlaceCampaignData[] {
    if (!query.trim()) return marketplaceCampaigns;

    const lowerQuery = query.toLowerCase();
    return marketplaceCampaigns.filter(campaign =>
        campaign.title.toLowerCase().includes(lowerQuery) ||
        campaign.brandName.toLowerCase().includes(lowerQuery) ||
        campaign.category.toLowerCase().includes(lowerQuery) ||
        campaign.platforms.some(p => p.toLowerCase().includes(lowerQuery))
    );
}

/**
 * Get a single campaign by ID
 */
export function getMarketplaceCampaignById(id: string): MarketPlaceCampaignData | undefined {
    return marketplaceCampaigns.find(campaign => campaign.id === id);
}
