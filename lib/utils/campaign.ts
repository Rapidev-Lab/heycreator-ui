export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    ZAR: "R",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbols[currency] || currency;
};

interface TimestampLike {
  toDate(): Date;
}

function isTimestamp(value: unknown): value is TimestampLike {
  return typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as TimestampLike).toDate === 'function';
}

export const formatDate = (date: unknown): string => {
  if (!date) return "";
  // Handle Firestore Timestamp
  let dateValue: Date;
  if (isTimestamp(date)) {
    dateValue = date.toDate();
  } else if (date instanceof Date) {
    dateValue = date;
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateValue = new Date(date);
  } else {
    return "";
  }
  return dateValue.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
