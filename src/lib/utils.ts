import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DateValidator } from './date-validation'
import { DATE_FORMATS } from './date-utils'

/**
 * Utility function to combine Tailwind CSS classes with clsx and tailwind-merge
 * 
 * This function combines class strings/conditionals using clsx, then merges
 * any conflicting Tailwind classes using tailwind-merge to prevent conflicts.
 * 
 * @param inputs - Array of class values (strings, objects, arrays, etc.)
 * @returns Merged class string with conflicts resolved
 * 
 * @example
 * ```tsx
 * cn('px-2 py-1', isActive && 'bg-blue-500', 'px-4') // 'py-1 bg-blue-500 px-4'
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a valid Date object
 */
export function isValidDateObject(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * Type guard to check if a value is an object (and not null or array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard to check if a value is an array
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * Safely parses a JSON string, returning null for invalid JSON
 */
export function safeJSONParse<T = unknown>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return null;
  }
}

/**
 * Safely stringifies an object, handling circular references
 */
export function safeJSONStringify(obj: unknown): string | null {
  try {
    return JSON.stringify(obj);
  } catch {
    // Handle circular references by creating a simpler representation
    try {
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Simple circular reference detection
          if (key && typeof value === 'object') {
            return '[Circular]';
          }
        }
        return value;
      });
    } catch {
      return null;
    }
  }
}

/**
 * Safely formats a date value, handling invalid dates gracefully
 * @param date - Date string, Date object, or any value that can be passed to new Date()
 * @param fallback - Fallback string to return for invalid dates (default: 'Invalid Date')
 * @param options - Intl.DateTimeFormat options for formatting
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(
  date: string | Date | number | null | undefined,
  fallback: string = 'Invalid Date',
  options?: Intl.DateTimeFormatOptions
): string {
  if (date === null || date === undefined) {
    return fallback;
  }

  try {
    const dateObj = new Date(date);
    if (!isValidDateObject(dateObj)) {
      return fallback;
    }
    
    return options ? dateObj.toLocaleDateString(undefined, options) : dateObj.toLocaleDateString();
  } catch {
    return fallback;
  }
}

/**
 * Enhanced date formatting using the date validation middleware
 * @param date - Date input
 * @param format - Format type
 * @param fallback - Fallback string
 * @returns Formatted date string
 */
export function formatDateSafe(
  date: string | Date | number | null | undefined,
  format: keyof typeof DATE_FORMATS | 'local' | 'timestamp' = 'DISPLAY',
  fallback: string = 'Invalid Date'
): string {
  const result = DateValidator.validate(date);
  if (!result.isValid || !result.normalizedDate) {
    return fallback;
  }
  return DateValidator.formatDate(result.normalizedDate, format);
}

/**
 * Safely gets the time value from a date, returning 0 for invalid dates
 * @param date - Date string, Date object, or any value that can be passed to new Date()
 * @returns Time in milliseconds or 0 for invalid dates
 */
export function safeGetTime(date: string | Date | number | null | undefined): number {
  if (date === null || date === undefined) {
    return 0;
  }

  try {
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? 0 : date.getTime();
    }
    
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? 0 : dateObj.getTime();
  } catch {
    return 0;
  }
}

/**
 * Enhanced date validation using the middleware
 * @param date - Date input
 * @returns true if the date is valid, false otherwise
 */
export function isValidDate(date: string | Date | number | null | undefined): boolean {
  return DateValidator.validate(date).isValid;
}

/**
 * Normalizes a date for consistent storage
 * @param date - Date input
 * @returns ISO string or null for invalid dates
 */
export function normalizeDateForStorage(date: string | Date | number | null | undefined): string | null {
  return DateValidator.normalizeForStorage(date);
}

/**
 * Format currency values
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format numbers with thousand separators
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format distance to now (e.g., "2 hours ago", "in 3 days")
 */
export function formatDistanceToNow(date: Date | string | number): string {
  const now = new Date();
  const targetDate = new Date(date);
  
  if (!isValidDateObject(targetDate)) {
    return 'unknown time';
  }
  
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInMinutes = Math.floor(Math.abs(diffInMs) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  const isPast = diffInMs > 0;
  const suffix = isPast ? 'ago' : 'from now';
  const prefix = isPast ? '' : 'in ';
  
  if (diffInMinutes < 1) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${prefix}${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ${suffix}`.trim();
  } else if (diffInHours < 24) {
    return `${prefix}${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ${suffix}`.trim();
  } else if (diffInDays < 30) {
    return `${prefix}${diffInDays} day${diffInDays !== 1 ? 's' : ''} ${suffix}`.trim();
  } else {
    return targetDate.toLocaleDateString();
  }
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Generate a random ID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}
