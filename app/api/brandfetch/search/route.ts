import { NextResponse } from 'next/server';
import type { BrandfetchSearchResult } from '@/types/brandfetch';

// ===== MOCK DATA =====

const MOCK_BRANDS: Record<string, BrandfetchSearchResult[]> = {
  nike: [
    { icon: 'https://asset.brandfetch.io/idR1IJv3kn/idSHlxjjBn.svg', name: 'Nike', domain: 'nike.com', claimed: true, brandId: 'nike-1' },
    { icon: 'https://asset.brandfetch.io/idR1IJv3kn/idSHlxjjBn.svg', name: 'Nike South Africa', domain: 'nike.com/za', claimed: false, brandId: 'nike-za' },
  ],
  adidas: [
    { icon: 'https://asset.brandfetch.io/id5ebHU3qZ/idSBUoXWfv.svg', name: 'Adidas', domain: 'adidas.com', claimed: true, brandId: 'adidas-1' },
    { icon: 'https://asset.brandfetch.io/id5ebHU3qZ/idSBUoXWfv.svg', name: 'Adidas Originals', domain: 'adidas.com/originals', claimed: false, brandId: 'adidas-2' },
  ],
  apple: [
    { icon: 'https://asset.brandfetch.io/idnrCPuv87/idts3kFVrR.svg', name: 'Apple', domain: 'apple.com', claimed: true, brandId: 'apple-1' },
  ],
  google: [
    { icon: 'https://asset.brandfetch.io/id6O2oGzv-/idQfZFH03V.svg', name: 'Google', domain: 'google.com', claimed: true, brandId: 'google-1' },
    { icon: null, name: 'Google Cloud', domain: 'cloud.google.com', claimed: true, brandId: 'google-cloud' },
  ],
  coca: [
    { icon: 'https://asset.brandfetch.io/idawLo-85E/id9MdCgZAq.svg', name: 'Coca-Cola', domain: 'coca-cola.com', claimed: true, brandId: 'coke-1' },
  ],
  microsoft: [
    { icon: 'https://asset.brandfetch.io/idchmboHEZ/idYoMEh-O_.svg', name: 'Microsoft', domain: 'microsoft.com', claimed: true, brandId: 'ms-1' },
  ],
  spotify: [
    { icon: 'https://asset.brandfetch.io/id20mQyGeY/idXaY5YXGP.svg', name: 'Spotify', domain: 'spotify.com', claimed: true, brandId: 'spotify-1' },
  ],
  amazon: [
    { icon: 'https://asset.brandfetch.io/idawLp-8Sa/id-4Gj0V3B.svg', name: 'Amazon', domain: 'amazon.com', claimed: true, brandId: 'amazon-1' },
  ],
  tesla: [
    { icon: 'https://asset.brandfetch.io/idHUoSM1Sw/idciOhlwmL.svg', name: 'Tesla', domain: 'tesla.com', claimed: true, brandId: 'tesla-1' },
  ],
  meta: [
    { icon: 'https://asset.brandfetch.io/idSUrLOa_G/idS7u9NJDE.svg', name: 'Meta', domain: 'meta.com', claimed: true, brandId: 'meta-1' },
    { icon: null, name: 'Meta Quest', domain: 'meta.com/quest', claimed: false, brandId: 'meta-quest' },
  ],
};

function getMockResults(query: string): BrandfetchSearchResult[] {
  const q = query.toLowerCase().trim();
  // Search across all mock brand keys
  const matches: BrandfetchSearchResult[] = [];
  for (const [key, brands] of Object.entries(MOCK_BRANDS)) {
    if (key.includes(q) || brands.some((b) => b.name?.toLowerCase().includes(q))) {
      matches.push(...brands);
    }
  }
  return matches.slice(0, 5);
}

// ===== ROUTE HANDLER =====

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Mock mode — return hardcoded results
    // Fallback: if BRANDFETCH_CLIENT_ID is missing, treat as mock mode
    const isMock =
      process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
      !process.env.BRANDFETCH_CLIENT_ID;
    if (isMock) {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 300));
      const results = getMockResults(query);
      return NextResponse.json({
        success: true,
        data: results,
        source: 'mock',
      });
    }

    // Live mode — call Brandfetch Search API
    const clientId = process.env.BRANDFETCH_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'Brandfetch client ID not configured' },
        { status: 500 }
      );
    }

    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.brandfetch.io/v2/search/${encodedQuery}?c=${clientId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) {
      console.error(`[Brandfetch Search] ${response.status}: ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: `Brandfetch API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: BrandfetchSearchResult[] = await response.json();

    return NextResponse.json({
      success: true,
      data: data.slice(0, 8), // Limit to 8 results
      source: 'live',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Brandfetch Search] Error:', message);
    return NextResponse.json(
      { success: false, error: 'Failed to search brands' },
      { status: 500 }
    );
  }
}
