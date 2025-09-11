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
