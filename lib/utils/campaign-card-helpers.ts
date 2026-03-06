/**
 * Shared utility functions for campaign card components.
 * Used by ActiveCampaignCard and future card variants.
 */

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatCurrencySymbol(currency: string): string {
  if (currency === 'ZAR') return 'R';
  if (currency === 'USD') return '$';
  return currency;
}

export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDeliverableLabel(d: { platform: string; contentType: string; quantity: number }): string {
  const qty = d.quantity || 1;
  const platform = d.platform.charAt(0).toUpperCase() + d.platform.slice(1);
  const type = d.contentType.replace(/_/g, ' ');
  return `${qty} ${platform} ${type}${qty > 1 ? 's' : ''}`;
}
