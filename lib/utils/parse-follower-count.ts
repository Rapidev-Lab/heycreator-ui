/**
 * Centralized follower/subscriber count parser.
 *
 * Handles all formats seen across platform APIs:
 *  - Raw numbers: 150000
 *  - Comma-separated strings: "150,000"
 *  - Abbreviated strings: "1.5M", "350K", "2B"
 *  - Mixed: "1,500K"
 */
export function parseFollowerCount(value: any): number {
  if (typeof value === 'number') return Math.round(value);

  if (typeof value === 'string') {
    // Remove commas and whitespace
    const cleaned = value.replace(/[,\s]/g, '');
    const lower = cleaned.toLowerCase();

    // Extract leading number (including decimals)
    const numMatch = lower.match(/^([0-9.]+)/);
    if (!numMatch) return 0;

    const num = parseFloat(numMatch[1]);
    if (isNaN(num)) return 0;

    // Apply suffix multiplier
    if (lower.includes('b')) return Math.round(num * 1_000_000_000);
    if (lower.includes('m')) return Math.round(num * 1_000_000);
    if (lower.includes('k')) return Math.round(num * 1_000);

    return Math.round(num);
  }

  return 0;
}
