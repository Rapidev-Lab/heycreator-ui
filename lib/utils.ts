// lib/utils.ts

/**
 * Creates a proxied image URL to bypass client-side CORS issues.
 * @param originalUrl The original URL of the image.
 * @returns A local API route URL that will proxy the image.
 *          Returns the original URL if it's not a valid absolute URL.
 */
export function proxyImage(originalUrl: string | undefined | null): string {
  if (!originalUrl || !originalUrl.startsWith('http')) {
    return '';
  }

  // Firebase Storage URLs are publicly accessible and don't need proxying
  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    return originalUrl;
  }

  // Use encodeURIComponent for UTF-8 safety (btoa fails on non-Latin1 chars)
  const encodedUrl = encodeURIComponent(originalUrl);

  return `/api/image-proxy?url=${encodedUrl}&encoding=url`;
}
