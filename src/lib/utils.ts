import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
    if (isNaN(dateObj.getTime())) {
      return fallback;
    }
    
    return options ? dateObj.toLocaleDateString(undefined, options) : dateObj.toLocaleDateString();
  } catch {
    return fallback;
  }
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
 * Checks if a date value is valid
 * @param date - Date string, Date object, or any value that can be passed to new Date()
 * @returns true if the date is valid, false otherwise
 */
export function isValidDate(date: string | Date | number | null | undefined): boolean {
  if (date === null || date === undefined) {
    return false;
  }

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}
