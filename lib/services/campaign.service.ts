import { Campaign } from '@/types/campaign';
import { auth } from '@/lib/firebase/config';

/**
 * Fetch a public campaign by ID (no authentication required)
 * Only works for published/active campaigns
 */
export const getPublicCampaignById = async (id: string): Promise<Campaign | null> => {
    try {
        const response = await fetch(`/api/campaigns/${id}/public`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch campaign: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data?.campaign) {
            return data.data.campaign as Campaign;
        }

        return null;
    } catch (error) {
        console.error('Error fetching public campaign:', error);
        throw error;
    }
};

/**
 * Fetch a campaign by ID (requires authentication)
 * @param id Campaign ID
 * @param token Optional pre-fetched auth token (useful in mock mode where auth.currentUser is null)
 */
export const getCampaignById = async (id: string, token?: string): Promise<Campaign | null> => {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Use provided token or try to get from auth.currentUser
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    const t = await currentUser.getIdToken();
                    headers['Authorization'] = `Bearer ${t}`;
                } catch (error) {
                    console.warn('Failed to get ID token:', error);
                }
            }
        }

        const response = await fetch(`/api/campaigns/${id}`, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch campaign: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.data?.campaign) {
            return data.data.campaign as Campaign;
        }

        return null;
    } catch (error) {
        console.error('Error fetching campaign:', error);
        throw error;
    }
};
