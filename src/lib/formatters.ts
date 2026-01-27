/**
 * Common formatting utilities for reports and data display
 */

/**
 * Format number as Thai currency (฿)
 */
export const formatCurrency = (value: number): string => {
    return value.toLocaleString('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Format number with no decimal places
 */
export const formatNumber = (value: number): string => {
    return value.toLocaleString('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

/**
 * Format date string to Thai short format (DD MMM YY)
 */
export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
    });
};

/**
 * Format date string to Thai month format (MMMM YYYY)
 */
export const formatMonth = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        month: 'long',
        year: 'numeric',
    });
};

/**
 * Format number as percentage with 1 decimal place
 */
export const formatPercent = (value: number): string => {
    return value.toFixed(1) + '%';
};
