/**
 * Timezone utility for handling IST (Indian Standard Time, UTC+5:30)
 */

const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

/**
 * Format a date string in IST timezone
 * @param dateString - ISO date string from API
 * @param formatStr - date-fns format string (e.g., 'MMM dd, yyyy')
 * @returns Formatted date string in IST
 */
export function formatDateIST(dateString: string, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const { format } = require('date-fns');
    const date = new Date(dateString);
    // Convert to IST by adding the offset
    const istDate = new Date(date.getTime() + (IST_OFFSET - date.getTimezoneOffset() * 60 * 1000));
    return format(istDate, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Get current date in IST timezone
 * @returns Current date in IST
 */
export function getDateIST(): Date {
  const now = new Date();
  return new Date(now.getTime() + (IST_OFFSET - now.getTimezoneOffset() * 60 * 1000));
}

/**
 * Format datetime string with time in IST
 * @param dateTimeString - ISO datetime string from API
 * @param formatStr - date-fns format string (e.g., 'MMM dd, yyyy HH:mm')
 * @returns Formatted datetime string in IST
 */
export function formatDateTimeIST(dateTimeString: string, formatStr: string = 'MMM dd, yyyy HH:mm'): string {
  try {
    const { format } = require('date-fns');
    const date = new Date(dateTimeString);
    // Convert to IST
    const istDate = new Date(date.getTime() + (IST_OFFSET - date.getTimezoneOffset() * 60 * 1000));
    return format(istDate, formatStr);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return dateTimeString;
  }
}

/**
 * Display timezone info
 */
export const TIMEZONE_INFO = {
  name: 'IST (Indian Standard Time)',
  offset: '+05:30',
  abbr: 'IST',
};
