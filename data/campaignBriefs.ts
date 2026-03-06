import { MarketPlaceCampaignData } from '@/components/ui/MarketPlaceCampaignCard';

/**
 * Structured deliverable item
 */
export interface DeliverableItem {
    type: string;
    platform: string;
    description: string;
    dueAfterBrief: string;
}

/**
 * Product details
 */
export interface ProductDetails {
    name: string;
    value: number;
    description: string;
    productUrl?: string;
}

/**
 * Content guidelines do's and don'ts
 */
export interface ContentGuidelines {
    dos: string[];
    donts: string[];
}

/**
 * Additional requirements for the campaign
 */
export interface AdditionalRequirements {
    requiredHashtags: string[];
    requiredMentions: string[];
    applicationQuestions: string[];
}

/**
 * Ideal creator profile for the campaign
 */
export interface IdealCreatorProfile {
    demographics: {
        ageRange: string;
        gender: string;
    };
    audienceSize: {
        followers: string;
        minEngagement: string;
    };
    interests: string[];
}

/**
 * Extended campaign brief data for the detail page
 */
export interface CampaignBriefData extends MarketPlaceCampaignData {
    description: string;
    features: {
        fastPayment?: boolean;
        productShipped?: boolean;
        openToBids?: boolean;
    };
    compensation: {
        min: number;
        max: number;
    };
    applyBy: string;
    location: string;
    duration: string;
    timeline: {
        applicationDeadline: { date: string; description: string };
        campaignStart: { date: string; description: string };
        campaignEnd: { date: string; description: string };
    };
    objectives: string;
    productDetails?: ProductDetails;
    structuredDeliverables?: DeliverableItem[];
    contentGuidelines?: ContentGuidelines;
    additionalRequirements?: AdditionalRequirements;
    idealCreatorProfile?: IdealCreatorProfile;
    deliverables?: string[];
}


/**
 * Mock campaign briefs data (extended)
 */
export const campaignBriefs: Record<string, CampaignBriefData> = {
    'mkt-001': {
        id: 'mkt-001',
        brandName: 'GlowUp Cosmetics',
        brandLogo: 'https://ui-avatars.com/api/?name=GC&background=eab8a0&color=fff',
        title: 'Summer Skincare Collection Launch 2026',
        category: 'Beauty & Skincare',
        platforms: ['Instagram', 'TikTok'],
        budgetMin: 500,
        budgetMax: 800,
        daysRemaining: 5,
        status: 'open',
        description: "We're launching our new eco-friendly summer skincare line and looking for beauty influencers to showcase the benefits of our natural, sustainable products. The campaign focuses on authentic content that highlights the product's effectiveness and our commitment to environmental responsibility.",
        features: {
            fastPayment: true,
            productShipped: true,
            openToBids: true,
        },
        compensation: {
            min: 2500,
            max: 5000,
        },
        applyBy: '28/02/2026',
        location: 'Anywhere, Durban',
        duration: '30 days+',
        timeline: {
            applicationDeadline: {
                date: '28/02/2026',
                description: 'Last day for influencers to apply',
            },
            campaignStart: {
                date: 'March 15, 2026',
                description: 'Content creation and approval begins',
            },
            campaignEnd: {
                date: 'May 15, 2026',
                description: 'Final content submission and approvals due',
            },
        },
        objectives: "Increase brand awareness, strengthen our sustainable brand, drive traffic to our e-commerce store, and generate content showcasing our products in real-life summer scenarios.",
        productDetails: {
            name: 'Eco-Glow SPF 50 Sunscreen',
            value: 450,
            description: "Our flagship product is a reef-safe, broad-spectrum sun SPF 50 protection. Made with natural ingredients and packaged in eco-friendly tubes. Perfect for daily use and outdoor activities.",
            productUrl: 'https://www.example.co.za/products/eco-glow-spf-50-sunscreen',
        },
        structuredDeliverables: [
            {
                type: 'Reels',
                platform: 'Instagram',
                description: 'x2 60-second Reels showing skincare routine featuring the sunscreen',
                dueAfterBrief: '15 days after brief',
            },
            {
                type: 'Story Series',
                platform: 'Instagram',
                description: '3 x story series showing product application and beach day experience',
                dueAfterBrief: '10 days after brief',
            },
            {
                type: 'Video',
                platform: 'YouTube',
                description: 'Educational video about safe sunscreen benefits (1-60 seconds)',
                dueAfterBrief: '20 days after brief',
            },
            {
                type: 'Post/Reel',
                platform: 'Twitter(X)',
                description: 'High-quality product photo with personal testimonial in caption',
                dueAfterBrief: '25 days after brief',
            },
        ],
        contentGuidelines: {
            dos: [
                'Share genuine product images in natural settings',
                'Highlight key benefits like reef-friendly and SPF 50 aspects',
                'Include before/after content comparing to past sunscreen products',
                'Tag our brand account and use campaign hashtags',
                'Share positive experience with the product',
            ],
            donts: [
                "Don't use filters that alter the product's appearance",
                'Avoid making unverified or exaggerated health claims',
                "Don't post content with competitors brand visible",
                'No stock photos or overly staged content',
            ],
        },
        additionalRequirements: {
            requiredHashtags: ['#EcoGlowSPF', '#ReefSafeSunscreen', '#SustainableSkincare', '#SummerSkincare2026'],
            requiredMentions: ['@ecoglow_skincare'],
            applicationQuestions: [
                'What is your content engagement rate on Instagram?',
                'Have you previously worked with skincare or beauty brands?',
                'Do you have experience creating educational beauty content?',
                'Are you comfortable creating low-key and daily skincare routines on camera?',
            ],
        },
        idealCreatorProfile: {
            demographics: {
                ageRange: '18-35',
                gender: 'Female',
            },
            audienceSize: {
                followers: '10k-50k',
                minEngagement: '3-5%',
            },
            interests: ['Sustainable living', 'Natural beauty', 'Skincare routines', 'Beach activities'],
        },
        deliverables: [
            '3x Instagram Reels (30-60 seconds)',
            '2x TikTok Videos',
            '5x Instagram Stories',
            '1x Blog Post (optional bonus)',
        ],
    },
    'mkt-002': {
        id: 'mkt-002',
        brandName: 'FitLife Pro',
        brandLogo: 'https://ui-avatars.com/api/?name=FL&background=3b82f6&color=fff',
        title: 'Fitness App Launch Campaign',
        category: 'Health & Fitness',
        platforms: ['YouTube', 'Instagram'],
        budgetMin: 1000,
        budgetMax: 2000,
        daysRemaining: 3,
        status: 'ending-soon',
        description: "We're launching our revolutionary fitness app and need fitness influencers to showcase the app's features, track their workouts, and share their experience with their audience.",
        features: {
            fastPayment: true,
            productShipped: false,
            openToBids: true,
        },
        compensation: {
            min: 3000,
            max: 8000,
        },
        applyBy: '15/02/2026',
        location: 'South Africa',
        duration: '45 days',
        timeline: {
            applicationDeadline: {
                date: '15/02/2026',
                description: 'Last day for influencers to apply',
            },
            campaignStart: {
                date: 'March 1, 2026',
                description: 'App access and content creation begins',
            },
            campaignEnd: {
                date: 'April 15, 2026',
                description: 'Final content submission due',
            },
        },
        objectives: "Drive app downloads, showcase key features, and build community around our fitness platform.",
    },
    'mkt-003': {
        id: 'mkt-003',
        brandName: 'TechNova',
        brandLogo: 'https://ui-avatars.com/api/?name=TN&background=8b5cf6&color=fff',
        title: 'Smart Watch Review Campaign',
        category: 'Tech & Gadgets',
        platforms: ['YouTube', 'TikTok'],
        budgetMin: 1500,
        budgetMax: 2500,
        daysRemaining: 10,
        status: 'open',
        description: "Looking for tech reviewers to create authentic unboxing and review content for our new smart watch. We want genuine first impressions and in-depth feature showcases.",
        features: {
            fastPayment: false,
            productShipped: true,
            openToBids: true,
        },
        compensation: {
            min: 4000,
            max: 10000,
        },
        applyBy: '10/03/2026',
        location: 'Worldwide',
        duration: '30 days',
        timeline: {
            applicationDeadline: {
                date: '10/03/2026',
                description: 'Last day for influencers to apply',
            },
            campaignStart: {
                date: 'March 20, 2026',
                description: 'Product shipped, content creation begins',
            },
            campaignEnd: {
                date: 'April 20, 2026',
                description: 'Final reviews published',
            },
        },
        objectives: "Generate authentic reviews, increase brand awareness among tech enthusiasts, and drive pre-orders for our smart watch launch.",
    },
    'mkt-004': {
        id: 'mkt-004',
        brandName: 'FreshFit Nutrition',
        brandLogo: 'https://ui-avatars.com/api/?name=FF&background=22c55e&color=fff',
        title: 'Protein Shake Launch Campaign',
        category: 'Health & Wellness',
        platforms: ['Instagram', 'TikTok'],
        budgetMin: 800,
        budgetMax: 1500,
        daysRemaining: 7,
        status: 'open',
        description: "Launching our new plant-based protein shake line! We need fitness and wellness influencers to try our product and create engaging content showcasing the taste and benefits.",
        features: {
            fastPayment: true,
            productShipped: true,
            openToBids: false,
        },
        compensation: {
            min: 1500,
            max: 3500,
        },
        applyBy: '05/03/2026',
        location: 'South Africa',
        duration: '21 days',
        timeline: {
            applicationDeadline: {
                date: '05/03/2026',
                description: 'Last day for influencers to apply',
            },
            campaignStart: {
                date: 'March 12, 2026',
                description: 'Products shipped and received',
            },
            campaignEnd: {
                date: 'April 2, 2026',
                description: 'All content submitted and approved',
            },
        },
        objectives: "Build awareness for our new plant-based protein line, drive sales through influencer discount codes, and generate user testimonials.",
    },
    'mkt-005': {
        id: 'mkt-005',
        brandName: 'StyleHaven',
        brandLogo: 'https://ui-avatars.com/api/?name=SH&background=ec4899&color=fff',
        title: 'Fall Fashion Collection Showcase',
        category: 'Fashion',
        platforms: ['Instagram', 'YouTube'],
        budgetMin: 2000,
        budgetMax: 3500,
        daysRemaining: 14,
        status: 'open',
        description: "We're launching our Fall 2026 collection and looking for fashion influencers to create stunning lookbook content. Style our pieces your way and inspire your audience!",
        features: {
            fastPayment: true,
            productShipped: true,
            openToBids: true,
        },
        compensation: {
            min: 5000,
            max: 12000,
        },
        applyBy: '20/03/2026',
        location: 'Johannesburg, Cape Town',
        duration: '45 days',
        timeline: {
            applicationDeadline: {
                date: '20/03/2026',
                description: 'Last day for influencers to apply',
            },
            campaignStart: {
                date: 'April 1, 2026',
                description: 'Clothing shipped, styling begins',
            },
            campaignEnd: {
                date: 'May 15, 2026',
                description: 'All lookbook content published',
            },
        },
        objectives: "Showcase our new collection through authentic styling content, drive traffic to our online store, and build brand presence among fashion-forward audiences.",
    },
    'mkt-006': {
        id: 'mkt-006',
        brandName: 'BeanBrew Coffee',
        brandLogo: 'https://ui-avatars.com/api/?name=BB&background=78350f&color=fff',
        title: 'Morning Routine Content Series',
        category: 'Food & Beverage',
        platforms: ['TikTok', 'Instagram'],
        budgetMin: 400,
        budgetMax: 700,
        daysRemaining: 2,
        status: 'ending-soon',
        description: "Share your morning routine featuring our premium coffee blends! We're looking for lifestyle influencers to create cozy, authentic morning content.",
        features: {
            fastPayment: true,
            productShipped: true,
            openToBids: false,
        },
        compensation: {
            min: 800,
            max: 1800,
        },
        applyBy: '12/02/2026',
        location: 'South Africa',
        duration: '14 days',
        timeline: {
            applicationDeadline: {
                date: '12/02/2026',
                description: 'Last day for influencers to apply',
            },
            campaignStart: {
                date: 'February 18, 2026',
                description: 'Coffee samples delivered',
            },
            campaignEnd: {
                date: 'March 4, 2026',
                description: 'Content published and campaign wrap-up',
            },
        },
        objectives: "Create warm, inviting content that positions our coffee as an essential part of the perfect morning routine.",
    },
    'mkt-007': {
        id: 'mkt-007',
        brandName: 'GameZone',
        brandLogo: 'https://ui-avatars.com/api/?name=GZ&background=ef4444&color=fff',
        title: 'Gaming Headset Launch Review',
        category: 'Gaming',
        platforms: ['YouTube', 'Twitch'],
        budgetMin: 1200,
        budgetMax: 2000,
        daysRemaining: 8,
        status: 'open',
        description: "We're launching our pro-level gaming headset and need gaming content creators to test it out during their streams and create review content.",
        features: {
            fastPayment: false,
            productShipped: true,
            openToBids: true,
        },
        compensation: {
            min: 3000,
            max: 7000,
        },
        applyBy: '08/03/2026',
        location: 'Worldwide',
        duration: '30 days',
        timeline: {
            applicationDeadline: {
                date: '08/03/2026',
                description: 'Last day for influencers to apply',
            },
            campaignStart: {
                date: 'March 15, 2026',
                description: 'Headsets shipped to selected creators',
            },
            campaignEnd: {
                date: 'April 15, 2026',
                description: 'Reviews and stream content completed',
            },
        },
        objectives: "Generate authentic reviews from real gamers, showcase audio quality and comfort during long gaming sessions, and build hype for our product launch.",
    },
    'mkt-008': {
        id: 'mkt-008',
        brandName: 'PureGlow',
        brandLogo: 'https://ui-avatars.com/api/?name=PG&background=14b8a6&color=fff',
        title: 'Organic Skincare Line Promotion',
        category: 'Beauty',
        platforms: ['Instagram'],
        budgetMin: 600,
        budgetMax: 1000,
        daysRemaining: 6,
        status: 'open',
        description: "Promote our new organic skincare line that's gentle on skin and the environment. Looking for beauty enthusiasts who value natural ingredients.",
        features: {
            fastPayment: true,
            productShipped: true,
            openToBids: false,
        },
        compensation: {
            min: 1200,
            max: 2500,
        },
        applyBy: '01/03/2026',
        location: 'South Africa',
        duration: '21 days',
        timeline: {
            applicationDeadline: {
                date: '01/03/2026',
                description: 'Last day for influencers to apply',
            },
            campaignStart: {
                date: 'March 8, 2026',
                description: 'Product kits shipped',
            },
            campaignEnd: {
                date: 'March 29, 2026',
                description: 'All content published',
            },
        },
        objectives: "Build awareness for our organic skincare line, educate audiences about the benefits of natural ingredients, and drive traffic to our website.",
    },
};

/**
 * Get campaign brief by ID
 */
export function getCampaignBriefById(id: string): CampaignBriefData | undefined {
    return campaignBriefs[id];
}
