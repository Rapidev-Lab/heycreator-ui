import { NextResponse } from 'next/server';
import type { BrandfetchBrandData } from '@/types/brandfetch';

// ===== MOCK DATA =====

const MOCK_BRANDS: Record<string, BrandfetchBrandData> = {
  'nike.com': {
    id: 'nike-brand-id',
    name: 'Nike',
    domain: 'nike.com',
    description: 'Just Do It. Nike delivers innovative products, experiences and services to inspire athletes.',
    longDescription: null,
    logos: [
      {
        type: 'icon',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/idR1IJv3kn/idSHlxjjBn.svg', format: 'svg' },
          { src: 'https://asset.brandfetch.io/idR1IJv3kn/id1MbPQ3Ai.png', format: 'png', width: 400, height: 400 },
        ],
      },
      {
        type: 'logo',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/idR1IJv3kn/idNBlSzPjU.svg', format: 'svg' },
          { src: 'https://asset.brandfetch.io/idR1IJv3kn/idD79D6mBp.png', format: 'png', width: 800, height: 240 },
        ],
      },
      {
        type: 'symbol',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/idR1IJv3kn/idKjD0HQca.svg', format: 'svg' },
        ],
      },
    ],
    colors: [
      { hex: '#111111', type: 'dark', brightness: 17 },
      { hex: '#FFFFFF', type: 'light', brightness: 255 },
      { hex: '#FF6B35', type: 'accent', brightness: 148 },
    ],
    fonts: [
      { name: 'Futura', type: 'title', origin: 'custom', weights: [500, 700, 900] },
      { name: 'Helvetica Neue', type: 'body', origin: 'system', weights: [400, 500, 700] },
    ],
    images: [],
    links: [
      { name: 'twitter', url: 'https://twitter.com/Nike' },
      { name: 'instagram', url: 'https://instagram.com/nike' },
      { name: 'facebook', url: 'https://facebook.com/nike' },
    ],
    company: {
      employees: { range: '10001+' },
      foundedYear: 1964,
      industries: [
        { name: 'Apparel & Fashion', emoji: '👕', slug: 'apparel-fashion' },
        { name: 'Sporting Goods', emoji: '⚽', slug: 'sporting-goods' },
      ],
      kind: 'public',
      location: { city: 'Beaverton', state: 'Oregon', country: 'US' },
    },
    qualityScore: 0.95,
    isNsfw: false,
  },
  'adidas.com': {
    id: 'adidas-brand-id',
    name: 'Adidas',
    domain: 'adidas.com',
    description: 'Through sport, we have the power to change lives. Adidas is a global leader in the sporting goods industry.',
    longDescription: null,
    logos: [
      {
        type: 'icon',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/id5ebHU3qZ/idSBUoXWfv.svg', format: 'svg' },
          { src: 'https://asset.brandfetch.io/id5ebHU3qZ/id6c_CrMRY.png', format: 'png', width: 400, height: 400 },
        ],
      },
      {
        type: 'logo',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/id5ebHU3qZ/idSBUoXWfv.svg', format: 'svg' },
        ],
      },
    ],
    colors: [
      { hex: '#000000', type: 'dark', brightness: 0 },
      { hex: '#FFFFFF', type: 'light', brightness: 255 },
    ],
    fonts: [
      { name: 'adineue PRO', type: 'title', origin: 'custom', weights: [700, 900] },
      { name: 'Helvetica', type: 'body', origin: 'system', weights: [400, 700] },
    ],
    images: [],
    links: [
      { name: 'twitter', url: 'https://twitter.com/adidas' },
      { name: 'instagram', url: 'https://instagram.com/adidas' },
    ],
    company: {
      employees: { range: '10001+' },
      foundedYear: 1949,
      industries: [
        { name: 'Sporting Goods', emoji: '⚽', slug: 'sporting-goods' },
        { name: 'Apparel & Fashion', emoji: '👕', slug: 'apparel-fashion' },
      ],
      kind: 'public',
      location: { city: 'Herzogenaurach', country: 'DE' },
    },
    qualityScore: 0.93,
    isNsfw: false,
  },
  'apple.com': {
    id: 'apple-brand-id',
    name: 'Apple',
    domain: 'apple.com',
    description: 'Apple designs, manufactures and markets smartphones, personal computers, tablets and more.',
    longDescription: null,
    logos: [
      {
        type: 'icon',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/idnrCPuv87/idts3kFVrR.svg', format: 'svg' },
          { src: 'https://asset.brandfetch.io/idnrCPuv87/idJeOVkLVi.png', format: 'png', width: 400, height: 400 },
        ],
      },
      {
        type: 'symbol',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/idnrCPuv87/id-9PMGbXz.svg', format: 'svg' },
        ],
      },
    ],
    colors: [
      { hex: '#000000', type: 'dark', brightness: 0 },
      { hex: '#FFFFFF', type: 'light', brightness: 255 },
      { hex: '#555555', type: 'accent', brightness: 85 },
    ],
    fonts: [
      { name: 'SF Pro Display', type: 'title', origin: 'custom', weights: [400, 500, 600, 700] },
      { name: 'SF Pro Text', type: 'body', origin: 'custom', weights: [400, 500, 600] },
    ],
    images: [],
    links: [
      { name: 'twitter', url: 'https://twitter.com/Apple' },
      { name: 'instagram', url: 'https://instagram.com/apple' },
      { name: 'youtube', url: 'https://youtube.com/apple' },
    ],
    company: {
      employees: { range: '10001+' },
      foundedYear: 1976,
      industries: [
        { name: 'Technology', emoji: '💻', slug: 'technology' },
        { name: 'Consumer Electronics', emoji: '📱', slug: 'consumer-electronics' },
      ],
      kind: 'public',
      location: { city: 'Cupertino', state: 'California', country: 'US' },
    },
    qualityScore: 0.98,
    isNsfw: false,
  },
  'google.com': {
    id: 'google-brand-id',
    name: 'Google',
    domain: 'google.com',
    description: "Google's mission is to organize the world's information and make it universally accessible and useful.",
    longDescription: null,
    logos: [
      {
        type: 'icon',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/id6O2oGzv-/idQfZFH03V.svg', format: 'svg' },
          { src: 'https://asset.brandfetch.io/id6O2oGzv-/id2SdSN-5i.png', format: 'png', width: 400, height: 400 },
        ],
      },
    ],
    colors: [
      { hex: '#4285F4', type: 'accent', brightness: 153 },
      { hex: '#EA4335', type: 'custom', brightness: 115 },
      { hex: '#FBBC04', type: 'custom', brightness: 195 },
      { hex: '#34A853', type: 'custom', brightness: 140 },
    ],
    fonts: [
      { name: 'Google Sans', type: 'title', origin: 'custom', weights: [400, 500, 700] },
      { name: 'Roboto', type: 'body', origin: 'google', weights: [400, 500, 700] },
    ],
    images: [],
    links: [
      { name: 'twitter', url: 'https://twitter.com/Google' },
      { name: 'youtube', url: 'https://youtube.com/google' },
    ],
    company: {
      employees: { range: '10001+' },
      foundedYear: 1998,
      industries: [
        { name: 'Technology', emoji: '💻', slug: 'technology' },
        { name: 'Internet', emoji: '🌐', slug: 'internet' },
      ],
      kind: 'public',
      location: { city: 'Mountain View', state: 'California', country: 'US' },
    },
    qualityScore: 0.97,
    isNsfw: false,
  },
  'spotify.com': {
    id: 'spotify-brand-id',
    name: 'Spotify',
    domain: 'spotify.com',
    description: 'Spotify is a digital music, podcast, and video service that gives you access to millions of songs.',
    longDescription: null,
    logos: [
      {
        type: 'icon',
        theme: 'light',
        formats: [
          { src: 'https://asset.brandfetch.io/id20mQyGeY/idXaY5YXGP.svg', format: 'svg' },
          { src: 'https://asset.brandfetch.io/id20mQyGeY/idFhg7JiGb.png', format: 'png', width: 400, height: 400 },
        ],
      },
    ],
    colors: [
      { hex: '#1DB954', type: 'accent', brightness: 145 },
      { hex: '#191414', type: 'dark', brightness: 17 },
      { hex: '#FFFFFF', type: 'light', brightness: 255 },
    ],
    fonts: [
      { name: 'Circular', type: 'title', origin: 'custom', weights: [400, 500, 700, 900] },
      { name: 'Circular', type: 'body', origin: 'custom', weights: [400, 500] },
    ],
    images: [],
    links: [
      { name: 'twitter', url: 'https://twitter.com/Spotify' },
      { name: 'instagram', url: 'https://instagram.com/spotify' },
    ],
    company: {
      employees: { range: '5001-10000' },
      foundedYear: 2006,
      industries: [
        { name: 'Music', emoji: '🎵', slug: 'music' },
        { name: 'Technology', emoji: '💻', slug: 'technology' },
      ],
      kind: 'public',
      location: { city: 'Stockholm', country: 'SE' },
    },
    qualityScore: 0.94,
    isNsfw: false,
  },
};

function getMockBrand(domain: string): BrandfetchBrandData | null {
  // Exact match
  if (MOCK_BRANDS[domain]) return MOCK_BRANDS[domain];
  // Strip subpath
  const base = domain.split('/')[0];
  if (MOCK_BRANDS[base]) return MOCK_BRANDS[base];
  return null;
}

// ===== ROUTE HANDLER =====

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain')?.trim();

    if (!domain) {
      return NextResponse.json(
        { success: false, error: 'Domain parameter is required' },
        { status: 400 }
      );
    }

    // Mock mode
    // Fallback: if BRANDFETCH_API_KEY is missing, treat as mock mode
    const isMock =
      process.env.NEXT_PUBLIC_MOCK_MODE === 'true' ||
      !process.env.BRANDFETCH_API_KEY;
    if (isMock) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const brand = getMockBrand(domain);
      if (!brand) {
        return NextResponse.json(
          { success: false, error: `No mock data for domain: ${domain}` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: brand,
        source: 'mock',
      });
    }

    // Live mode — call Brandfetch Brand API
    const apiKey = process.env.BRANDFETCH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Brandfetch API key not configured' },
        { status: 500 }
      );
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const response = await fetch(
      `https://api.brandfetch.io/v2/brands/${encodeURIComponent(cleanDomain)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error(`[Brandfetch Brand] ${response.status}: ${response.statusText}`);
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Brand not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Brandfetch API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data: BrandfetchBrandData = await response.json();

    return NextResponse.json({
      success: true,
      data,
      source: 'live',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Brandfetch Brand] Error:', message);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brand data' },
      { status: 500 }
    );
  }
}
