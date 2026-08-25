/**
 * ================================================================================
 * FILE: formatters.js
 * ================================================================================
 * PURPOSE: Utility functions for formatting data across the application
 * IMPORT: import { formatAmount, formatDate, getInitials } from '@/utils';
 * ================================================================================
 */

// ==================== CURRENCY & NUMBER FORMATTING ====================

/**
 * Format amount in Indian Rupee format
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Whether to show ₹ symbol (default: true)
 * @returns {string} Formatted amount
 * @example
 * formatAmount(125000)           // '₹1,25,000'
 * formatAmount(125000, false)    // '1,25,000'
 * formatAmount(null)             // '₹0'
 */
export const formatAmount = (amount, showSymbol = true) => {
    if (amount === null || amount === undefined) return showSymbol ? '₹0' : '0';

    const formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
    }).format(amount);
    return showSymbol ? `₹${formatted}` : formatted;
};

// Alias for backward compatibility
export const formatCurrency = formatAmount;

/**
 * Format amount in compact form (e.g., 1.8L, 25K)
 * @param {number} amount - Amount to format
 * @returns {string} Compact formatted amount
 * @example
 * formatAmountCompact(1500000)   // '₹15L'
 * formatAmountCompact(25000)     // '₹25K'
 * formatAmountCompact(50000000)  // '₹5Cr'
 */
export const formatAmountCompact = (amount) => {
    if (amount === null || amount === undefined) return '-';

    if (amount >= 10000000) {
        const val = amount / 10000000;
        return `₹${val % 1 === 0 ? val : val.toFixed(2)}Cr`;
    } else if (amount >= 100000) {
        const val = amount / 100000;
        return `₹${val % 1 === 0 ? val : val.toFixed(2)}L`;
    } else if (amount >= 1000) {
        const val = amount / 1000;
        return `₹${val % 1 === 0 ? val : val.toFixed(1)}K`;
    }
    return formatAmount(amount);
};

// Alias for backward compatibility
export const formatShortNumber = formatAmountCompact;

/**
 * Format number with Indian number system (lakhs, crores)
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 * @example
 * formatNumber(1234567)    // '12,34,567'
 * formatNumber(1000)       // '1,000'
 */
export const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';

    // Convert string to number if needed, removing commas
    const value = typeof num === 'string'
        ? parseFloat(num.toString().replace(/,/g, ''))
        : num;

    if (isNaN(value)) return num; // Return original if not a number

    return new Intl.NumberFormat('en-IN').format(value);
};

// ==================== DATE FORMATTING ====================

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} format - 'short' | 'medium' | 'long' | 'relative' | 'input'
 * @returns {string} - Formatted date
 * @example
 * formatDate('2026-02-05')                // '5 Feb 2026'
 * formatDate('2026-02-05', 'long')        // 'Thursday, 5 February 2026'
 * formatDate('2026-02-05', 'input')       // '2026-02-05'
 * formatDate('2026-02-05', 'relative')    // '2 days ago'
 * formatDate(null, 'input')               // '' (empty string for input format)
 */
export const formatDate = (date, format = 'short') => {
    // For 'input' format, return empty string for null/undefined/invalid dates
    // This prevents "undefined--" in date picker inputs
    if (!date) {
        return format === 'input' ? '' : '-';
    }

    const d = new Date(date);
    if (isNaN(d.getTime())) {
        return format === 'input' ? '' : '-';
    }

    switch (format) {
        case 'long':
            return d.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        case 'medium':
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        case 'short':
            return d.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        case 'input': {
            // Use local date components to avoid timezone shift
            // toISOString() converts to UTC which can shift the date by 1 day in IST
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`; // YYYY-MM-DD
        }
        case 'relative':
            return getRelativeTime(d);
        default:
            return d.toLocaleDateString('en-IN');
    }
};

/**
 * Get relative time (e.g., "2 days ago", "in 3 months")
 * @param {Date|string} date - Date to compare
 * @returns {string} - Relative time string
 * @example
 * getRelativeTime(new Date('2026-02-03'))  // '2 days ago'
 * getRelativeTime(new Date('2026-03-01'))  // 'in 24 days'
 * getRelativeTime(new Date())              // 'just now'
 */
export const getRelativeTime = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const now = new Date();
    const diff = d - now;
    const absDiff = Math.abs(diff);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const isPast = diff < 0;
    const prefix = isPast ? '' : 'in ';
    const suffix = isPast ? ' ago' : '';

    if (years > 0) return `${prefix}${years} year${years > 1 ? 's' : ''}${suffix}`;
    if (months > 0) return `${prefix}${months} month${months > 1 ? 's' : ''}${suffix}`;
    if (days > 0) return `${prefix}${days} day${days > 1 ? 's' : ''}${suffix}`;
    if (hours > 0) return `${prefix}${hours} hour${hours > 1 ? 's' : ''}${suffix}`;
    if (minutes > 0) return `${prefix}${minutes} minute${minutes > 1 ? 's' : ''}${suffix}`;
    return 'just now';
};
