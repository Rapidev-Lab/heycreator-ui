import { CampaignCardData } from '@/components/ui/CampaignCard';

/**
 * Mock campaign data for influencer My Campaigns page
 * This data represents campaigns the influencer is actively working on
 * Will be replaced with API calls to the backend in production
 */
export const influencerCampaigns: CampaignCardData[] = [
    {
        id: 'camp-001',
        title: 'Summer Collection Launch',
        brandName: 'FashionVista',
        brandLogo: 'https://ui-avatars.com/api/?name=FV&background=f472b6&color=fff',
        status: 'in-progress',
        payment: 3500,
        tags: ['Instagram', 'TikTok'],
        deliverables: [
            { id: 'del-001', type: 'Instagram Reel', description: 'Morning Routine', dueDate: 'Due Mar 30', completed: false },
            { id: 'del-002', type: 'Instagram Reel', description: 'Style Guide', dueDate: 'Due Mar 30', completed: false },
            { id: 'del-003', type: 'Feed Post', description: 'Product Photography', dueDate: 'Due Apr 8', completed: false },
        ],
        progress: 0,
        startDate: 'Jan 5, 2026',
        dueDate: 'Mar 30, 2026',
        daysRemaining: 3,
    },
    {
        id: 'camp-002',
        title: 'Summer Skincare Launch',
        brandName: 'GlowUp Cosmetics',
        brandLogo: 'https://ui-avatars.com/api/?name=GC&background=22c55e&color=fff',
        status: 'in-progress',
        payment: 650,
        tags: ['TikTok', 'Instagram'],
        deliverables: [
            { id: 'del-004', type: 'TikTok Video', description: 'Day in life Skincare Video', dueDate: 'Due Jan 10', completed: true },
            { id: 'del-005', type: 'Instagram Story', description: '3 frames with link', dueDate: 'Due Jan 15', completed: false },
        ],
        progress: 50,
        startDate: 'Nov 15, 2025',
        dueDate: 'Jan 15, 2026',
        daysRemaining: 2,
    },
    {
        id: 'camp-003',
        title: 'Fitness App Promotion',
        brandName: 'FitLife Pro',
        brandLogo: 'https://ui-avatars.com/api/?name=FL&background=3b82f6&color=fff',
        status: 'review',
        payment: 1200,
        tags: ['YouTube', 'Instagram'],
        deliverables: [
            { id: 'del-006', type: 'YouTube Video', description: 'App Review & Tutorial', dueDate: 'Due Feb 15', completed: true },
            { id: 'del-007', type: 'Instagram Post', description: 'Before/After Results', dueDate: 'Due Feb 20', completed: true },
        ],
        progress: 100,
        startDate: 'Jan 10, 2026',
        dueDate: 'Feb 20, 2026',
        daysRemaining: 0,
    },
    {
        id: 'camp-004',
        title: 'Tech Gadget Unboxing',
        brandName: 'TechNova',
        brandLogo: 'https://ui-avatars.com/api/?name=TN&background=8b5cf6&color=fff',
        status: 'completed',
        payment: 2000,
        tags: ['YouTube', 'TikTok'],
        deliverables: [
            { id: 'del-008', type: 'YouTube Video', description: 'Unboxing & First Impressions', dueDate: 'Completed', completed: true },
            { id: 'del-009', type: 'TikTok Video', description: 'Quick Feature Highlight', dueDate: 'Completed', completed: true },
        ],
        progress: 100,
        startDate: 'Dec 1, 2025',
        dueDate: 'Dec 20, 2025',
        daysRemaining: 0,
    },
];

/**
 * Get campaigns filtered by status
 */
export function getInfluencerCampaignsByStatus(status: 'all' | 'active' | 'review' | 'done'): CampaignCardData[] {
    if (status === 'all') return influencerCampaigns;

    const statusMap: Record<string, string[]> = {
        active: ['in-progress'],
        review: ['review'],
        done: ['completed'],
    };

    return influencerCampaigns.filter(campaign => statusMap[status]?.includes(campaign.status));
}

/**
 * Get campaign stats for the influencer dashboard
 */
export function getInfluencerCampaignStats() {
    const active = influencerCampaigns.filter(c => c.status === 'in-progress').length;
    const pending = influencerCampaigns.filter(c => c.status === 'review').length;
    const complete = influencerCampaigns.filter(c => c.status === 'completed').length;
    const earned = influencerCampaigns
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + c.payment, 0);

    return {
        active,
        pending,
        complete,
        earned,
    };
}

/**
 * Get a single campaign by ID
 */
export function getInfluencerCampaignById(id: string): CampaignCardData | undefined {
    return influencerCampaigns.find(campaign => campaign.id === id);
}
