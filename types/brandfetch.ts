// ===== BRANDFETCH API TYPES =====

/** Search result from Brand Search API: GET /v2/search/{name} */
export interface BrandfetchSearchResult {
  /** Brand icon URL (small square logo) */
  icon: string | null;
  /** Brand display name */
  name: string | null;
  /** Brand website domain (e.g. "nike.com") */
  domain: string;
  /** Whether the brand owner claimed their Brandfetch profile */
  claimed: boolean;
  /** Unique Brandfetch brand identifier */
  brandId: string;
}

/** Full brand data from Brand API: GET /v2/brands/{domain} */
export interface BrandfetchBrandData {
  id: string;
  name: string;
  domain: string;
  description: string | null;
  longDescription: string | null;
  logos: BrandfetchLogo[];
  colors: BrandfetchColor[];
  fonts: BrandfetchFont[];
  images: BrandfetchImage[];
  links: BrandfetchLink[];
  company: BrandfetchCompany;
  qualityScore: number;
  isNsfw: boolean;
}

export interface BrandfetchLogo {
  type: 'icon' | 'logo' | 'symbol' | 'other';
  theme: 'light' | 'dark';
  formats: BrandfetchFormat[];
}

export interface BrandfetchImage {
  type: string;
  formats: BrandfetchFormat[];
}

export interface BrandfetchFormat {
  src: string;
  format: string;
  width?: number;
  height?: number;
  size?: number;
  background?: string;
}

export interface BrandfetchColor {
  hex: string;
  type: 'accent' | 'dark' | 'light' | 'vibrant' | 'custom';
  brightness: number;
}

export interface BrandfetchFont {
  name: string;
  type: 'title' | 'body';
  origin: 'google' | 'custom' | 'system';
  originId?: string;
  weights: number[];
}

export interface BrandfetchLink {
  name: string;
  url: string;
}

export interface BrandfetchCompany {
  employees?: { range?: string };
  foundedYear?: number;
  industries?: { name: string; emoji?: string; slug?: string }[];
  kind?: string;
  location?: { city?: string; state?: string; country?: string };
}

// ===== SIMPLIFIED TYPES FOR INTERNAL USE =====

/** Simplified brand data stored in form state */
export interface BrandCIData {
  name: string;
  domain: string;
  logoUrl: string | null;
  colors: { hex: string; type: string }[];
  fonts: { name: string; type: string }[];
  industries: string[];
}

// ===== HELPER: Extract best logo URL from Brandfetch response =====

/**
 * Picks the best logo URL from Brandfetch logo array.
 * Priority: icon > logo > symbol, theme: light > dark, format: svg > png > webp
 */
export function pickBestLogoUrl(logos: BrandfetchLogo[]): string | null {
  const typePriority: BrandfetchLogo['type'][] = ['icon', 'logo', 'symbol', 'other'];
  const themePriority: BrandfetchLogo['theme'][] = ['light', 'dark'];
  const formatPriority = ['svg', 'png', 'webp', 'jpeg', 'jpg'];

  for (const type of typePriority) {
    for (const theme of themePriority) {
      const match = logos.find((l) => l.type === type && l.theme === theme);
      if (match && match.formats.length > 0) {
        // Sort formats by priority
        const sorted = [...match.formats].sort((a, b) => {
          const aIdx = formatPriority.indexOf(a.format);
          const bIdx = formatPriority.indexOf(b.format);
          return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
        });
        return sorted[0].src;
      }
    }
  }

  // Fallback: return any available format from any logo
  for (const logo of logos) {
    if (logo.formats.length > 0) {
      return logo.formats[0].src;
    }
  }

  return null;
}
