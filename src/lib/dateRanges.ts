// Date range presets and utilities

import type { DateRange } from './data/types';

/**
 * Format date to YYYY-MM-DD string (local timezone)
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get start and end dates for predefined ranges
 */
export const DATE_RANGES = {
  TODAY: {
    label: 'วันนี้',
    labelEn: 'Today',
    getValue: (): DateRange => {
      const today = new Date();
      const dateStr = formatDateString(today);
      return {
        start: dateStr,
        end: dateStr,
      };
    },
  },
  THIS_WEEK: {
    label: 'สัปดาห์นี้',
    labelEn: 'This Week',
    getValue: (): DateRange => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - dayOfWeek);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return {
        start: formatDateString(startOfWeek),
        end: formatDateString(endOfWeek),
      };
    },
  },
  THIS_MONTH: {
    label: 'เดือนนี้',
    labelEn: 'This Month',
    getValue: (): DateRange => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      return {
        start: formatDateString(startOfMonth),
        end: formatDateString(endOfMonth),
      };
    },
  },
  THIS_QUARTER: {
    label: 'ไตรมาสนี้',
    labelEn: 'This Quarter',
    getValue: (): DateRange => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;

      const startOfQuarter = new Date(today.getFullYear(), quarterStartMonth, 1);
      const endOfQuarter = new Date(today.getFullYear(), quarterStartMonth + 3, 0);

      return {
        start: formatDateString(startOfQuarter),
        end: formatDateString(endOfQuarter),
      };
    },
  },
  THIS_YEAR: {
    label: 'ปีนี้',
    labelEn: 'This Year',
    getValue: (): DateRange => {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);

      return {
        start: formatDateString(startOfYear),
        end: formatDateString(endOfYear),
      };
    },
  },
  LAST_7_DAYS: {
    label: '7 วันที่ผ่านมา',
    labelEn: 'Last 7 Days',
    getValue: (): DateRange => {
      const today = new Date();
      const last7Days = new Date(today);
      last7Days.setDate(today.getDate() - 6);

      return {
        start: formatDateString(last7Days),
        end: formatDateString(today),
      };
    },
  },
  LAST_30_DAYS: {
    label: '30 วันที่ผ่านมา',
    labelEn: 'Last 30 Days',
    getValue: (): DateRange => {
      const today = new Date();
      const last30Days = new Date(today);
      last30Days.setDate(today.getDate() - 29);

      return {
        start: formatDateString(last30Days),
        end: formatDateString(today),
      };
    },
  },
  LAST_MONTH: {
    label: 'เดือนที่แล้ว',
    labelEn: 'Last Month',
    getValue: (): DateRange => {
      const today = new Date();
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      return {
        start: formatDateString(startOfLastMonth),
        end: formatDateString(endOfLastMonth),
      };
    },
  },
  CUSTOM: {
    label: 'กำหนดเอง',
    labelEn: 'Custom',
    getValue: (): DateRange => {
      // Return today as default
      const today = new Date();
      const dateStr = formatDateString(today);
      return {
        start: dateStr,
        end: dateStr,
      };
    },
  },
} as const;

export type DateRangeKey = keyof typeof DATE_RANGES;

/**
 * Get DateRange by key
 */
export function getDateRange(key: DateRangeKey): DateRange {
  return DATE_RANGES[key].getValue();
}

/**
 * Format date string to Thai format (DD/MM/YYYY)
 */
export function formatDateThai(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date string to display format (DD MMM YYYY)
 */
export function formatDateDisplay(dateString: string, locale: 'th' | 'en' = 'th'): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  const localeStr = locale === 'th' ? 'th-TH' : 'en-US';
  return date.toLocaleDateString(localeStr, options);
}

/**
 * Calculate difference in days between two dates
 */
export function daysDifference(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Add days to a date
 */
export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Subtract days from a date
 */
export function subtractDays(dateString: string, days: number): string {
  return addDays(dateString, -days);
}

/**
 * Add months to a date
 */
export function addMonths(dateString: string, months: number): string {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

/**
 * Subtract months from a date
 */
export function subtractMonths(dateString: string, months: number): string {
  return addMonths(dateString, -months);
}

/**
 * Get start of month for a given date
 */
export function getStartOfMonth(dateString: string): string {
  const date = new Date(dateString);
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  return startOfMonth.toISOString().split('T')[0];
}

/**
 * Get end of month for a given date
 */
export function getEndOfMonth(dateString: string): string {
  const date = new Date(dateString);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return endOfMonth.toISOString().split('T')[0];
}
