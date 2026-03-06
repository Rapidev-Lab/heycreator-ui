/**
 * Calculate human-readable duration between two dates
 * Returns duration in the most appropriate unit (days, weeks, months, years)
 */
export function calculateDuration(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  // Check for invalid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid dates';
  }

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Handle negative or zero duration
  if (diffDays <= 0) {
    return 'Invalid duration';
  }

  // Less than 7 days: show in days
  if (diffDays === 1) {
    return '1 day';
  }
  if (diffDays < 7) {
    return `${diffDays} days`;
  }

  // 7-29 days: show in weeks
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    if (remainingDays === 0) {
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }

    // If there are remaining days, show both
    if (weeks === 1) {
      return `1 week, ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
    }
    return `${weeks} weeks, ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
  }

  // 30-364 days: show in months
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;

    if (remainingDays < 7) {
      return months === 1 ? '1 month' : `${months} months`;
    }

    const remainingWeeks = Math.floor(remainingDays / 7);
    if (months === 1) {
      return `1 month, ${remainingWeeks} ${remainingWeeks === 1 ? 'week' : 'weeks'}`;
    }
    return `${months} months, ${remainingWeeks} ${remainingWeeks === 1 ? 'week' : 'weeks'}`;
  }

  // 365+ days: show in years and months
  const years = Math.floor(diffDays / 365);
  const remainingDays = diffDays % 365;
  const remainingMonths = Math.floor(remainingDays / 30);

  if (remainingMonths === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  const yearText = years === 1 ? '1 year' : `${years} years`;
  const monthText = remainingMonths === 1 ? '1 month' : `${remainingMonths} months`;
  return `${yearText}, ${monthText}`;
}

/**
 * Get a short version of duration (without remaining days/weeks)
 */
export function calculateDurationShort(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid dates';
  }

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Invalid duration';
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }

  const years = Math.floor(diffDays / 365);
  return years === 1 ? '1 year' : `${years} years`;
}
