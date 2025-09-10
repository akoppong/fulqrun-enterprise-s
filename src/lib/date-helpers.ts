/**
 * Date Utility Functions
 * Centralized date handling to ensure consistency across the application
 */

export type SerializableDate = string; // ISO 8601 string format
export type DateInput = Date | string | number | null | undefined;

/**
 * Converts any date input to a consistent ISO string format
 */
export function toISOString(date: DateInput): SerializableDate {
  if (!date) return new Date().toISOString();
  
  if (typeof date === 'string') {
    // Handle ISO strings, timestamps, and date strings
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      console.warn('Invalid date string provided:', date);
      return new Date().toISOString();
    }
    return parsed.toISOString();
  }
  
  if (typeof date === 'number') {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      console.warn('Invalid timestamp provided:', date);
      return new Date().toISOString();
    }
    return parsed.toISOString();
  }
  
  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      console.warn('Invalid Date object provided:', date);
      return new Date().toISOString();
    }
    return date.toISOString();
  }
  
  return new Date().toISOString();
}

/**
 * Converts ISO string to Date object safely
 */
export function fromISOString(isoString: SerializableDate): Date {
  if (!isoString) return new Date();
  
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid ISO string provided:', isoString);
    return new Date();
  }
  
  return date;
}

/**
 * Safely gets timestamp from various date formats
 */
export function safeGetTime(date: DateInput): number {
  if (!date) return Date.now();
  
  try {
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
    }
    
    if (typeof date === 'number') {
      return date;
    }
    
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? Date.now() : date.getTime();
    }
    
    return Date.now();
  } catch (error) {
    console.warn('Error parsing date:', error);
    return Date.now();
  }
}

/**
 * Format date consistently for display
 */
export function formatDisplayDate(date: DateInput, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const dateObj = date instanceof Date ? date : fromISOString(toISOString(date));
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }[format];
  
  try {
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Calculate days between two dates
 */
export function daysBetween(startDate: DateInput, endDate: DateInput): number {
  const start = fromISOString(toISOString(startDate));
  const end = fromISOString(toISOString(endDate));
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is in the past
 */
export function isInPast(date: DateInput): boolean {
  const dateObj = fromISOString(toISOString(date));
  return dateObj.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isInFuture(date: DateInput): boolean {
  const dateObj = fromISOString(toISOString(date));
  return dateObj.getTime() > Date.now();
}