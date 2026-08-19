export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
};

export const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const daysBetween = (startDateStr: string, endDateStr: string): number => {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const isDateWithinWindow = (dateStr: string, windowStart: string, windowEnd: string): boolean => {
  return dateStr >= windowStart && dateStr <= windowEnd;
};

export const formatDateDisplay = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
