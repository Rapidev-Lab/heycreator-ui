/**
 * Custom hook for making authenticated API calls
 *
 * This hook automatically includes the Firebase auth token
 * in all API requests, making it easy to call authenticated endpoints.
 *
 * Usage:
 * ```typescript
 * const authFetch = useAuthFetch();
 * const data = await authFetch('/api/profiles');
 * ```
 */

import { useAuth } from '@/lib/firebase/auth-context';
import { useRouter, usePathname } from 'next/navigation';

export interface AuthFetchOptions extends RequestInit {
  // All standard fetch options are supported
  // The Authorization header will be added automatically
}

export interface AuthFetchResponse<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

export function useAuthFetch() {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Make an authenticated fetch request
   * Automatically includes Authorization header with Firebase ID token
   *
   * @param url - API endpoint URL
   * @param options - Fetch options (method, body, headers, etc.)
   * @returns Response data or null if error occurred
   */
  const authFetch = async <T = any>(
    url: string,
    options: AuthFetchOptions = {}
  ): Promise<AuthFetchResponse<T>> => {
    try {
      // Check authentication
      if (!firebaseUser) {
        return {
          data: null,
          error: 'Not authenticated. Please log in.',
          status: 401
        };
      }

      // Get fresh Firebase ID token
      const token = await firebaseUser.getIdToken();

      // Merge headers with auth token
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);

      // If sending JSON, set content type
      if (options.body && typeof options.body === 'string') {
        headers.set('Content-Type', 'application/json');
      }

      // Make the request
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - redirect to role-appropriate login
      if (response.status === 401) {
        const isBrandContext = pathname?.startsWith('/brands');
        const loginPath = isBrandContext ? '/auth/brand/login' : '/auth/influencer/login';
        console.warn(`Unauthorized request, redirecting to ${loginPath}`);
        router.push(loginPath);
        return {
          data: null,
          error: 'Session expired. Please log in again.',
          status: 401
        };
      }

      // Parse response
      const data = await response.json();

      // Handle non-OK responses
      if (!response.ok) {
        return {
          data: null,
          error: data.error || data.message || `Request failed with status ${response.status}`,
          status: response.status
        };
      }

      return {
        data,
        error: null,
        status: response.status
      };

    } catch (error) {
      console.error('Auth fetch error:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 0
      };
    }
  };

  /**
   * Convenience method for GET requests
   */
  const get = <T = any>(url: string, options?: AuthFetchOptions) => {
    return authFetch<T>(url, { ...options, method: 'GET' });
  };

  /**
   * Convenience method for POST requests
   */
  const post = <T = any>(url: string, body: any, options?: AuthFetchOptions) => {
    return authFetch<T>(url, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  };

  /**
   * Convenience method for PUT requests
   */
  const put = <T = any>(url: string, body: any, options?: AuthFetchOptions) => {
    return authFetch<T>(url, {
      ...options,
      method: 'PUT',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  };

  /**
   * Convenience method for PATCH requests
   */
  const patch = <T = any>(url: string, body: any, options?: AuthFetchOptions) => {
    return authFetch<T>(url, {
      ...options,
      method: 'PATCH',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    });
  };

  /**
   * Convenience method for DELETE requests
   */
  const del = <T = any>(url: string, options?: AuthFetchOptions) => {
    return authFetch<T>(url, { ...options, method: 'DELETE' });
  };

  return {
    authFetch,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}

// ===== USAGE EXAMPLES =====

/*

1. Simple GET request:
```typescript
const BrandDashboard = () => {
  const { get } = useAuthFetch();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await get('/api/brands/campaigns');
      if (error) {
        console.error('Error:', error);
      } else {
        setCampaigns(data.campaigns);
      }
    };
    fetchCampaigns();
  }, []);
};
```

2. POST request with body:
```typescript
const createCampaign = async () => {
  const { post } = useAuthFetch();

  const { data, error } = await post('/api/brands/campaigns', {
    name: 'Summer Campaign',
    budget: 10000,
    influencers: ['id1', 'id2']
  });

  if (error) {
    alert('Failed to create campaign: ' + error);
  } else {
    console.log('Created campaign:', data);
  }
};
```

3. With loading state:
```typescript
const [loading, setLoading] = useState(false);
const { authFetch } = useAuthFetch();

const saveProfile = async () => {
  setLoading(true);
  const { data, error, status } = await authFetch('/api/profiles', {
    method: 'POST',
    body: JSON.stringify({ selectedProfiles })
  });
  setLoading(false);

  if (error) {
    setError(error);
  } else {
    setSuccess(true);
  }
};
```

4. Type-safe responses:
```typescript
interface Campaign {
  id: string;
  name: string;
  status: string;
}

const { get } = useAuthFetch();
const { data, error } = await get<{ campaigns: Campaign[] }>('/api/brands/campaigns');

if (data) {
  // TypeScript knows data.campaigns is Campaign[]
  data.campaigns.forEach(campaign => {
    console.log(campaign.name);
  });
}
```

*/
