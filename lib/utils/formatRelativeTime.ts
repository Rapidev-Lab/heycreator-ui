/**
 * Formats a date into a human-readable relative time string.
 *
 * - Less than 1 hour: "just now"
 * - 1–23 hours: "x hours ago"
 * - 1–7 days: "x days ago"
 * - Over 7 days: actual date (e.g., "Feb 10, 2026")
 *
 * Reusable across the app wherever relative timestamps are needed.
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  if (diffDays <= 7) return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
