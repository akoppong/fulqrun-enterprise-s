import { format, parse, isValid, parseISO, startOfDay, endOfDay, addDays, subDays, differenceInDays, differenceInHours, differenceInMinutes, formatDistanceToNow, isAfter, isBefore, isSameDay } from 'date-fns';
import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';

// Re-export commonly used date-fns functions
export { addDays, subDays, isValid, parseISO, startOfDay, endOfDay, differenceInDays, differenceInHours, differenceInMinutes, formatDistanceToNow, isAfter, isBefore, isSameDay, format, parse };

/**
 * Supported date formats for parsing and validation
 */
export const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',
  US: 'MM/dd/yyyy',
  EU: 'dd/MM/yyyy',
  DATETIME_ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
  DATETIME_LOCAL: 'yyyy-MM-dd HH:mm:ss',
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_SHORT: 'MMM dd',
  TIME_12: 'h:mm a',
  TIME_24: 'HH:mm',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss XXX'
} as const;

/**
 * Common timezone identifiers
 */
export const TIMEZONES = {
  UTC: 'UTC',
  US_EASTERN: 'America/New_York',
  US_CENTRAL: 'America/Chicago',
  US_MOUNTAIN: 'America/Denver',
  US_PACIFIC: 'America/Los_Angeles',
  EUROPE_LONDON: 'Europe/London',
  EUROPE_PARIS: 'Europe/Paris',
  ASIA_TOKYO: 'Asia/Tokyo',
  AUSTRALIA_SYDNEY: 'Australia/Sydney'
} as const;

/**
 * Get the user's local timezone
 */
export function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Parse a date string with multiple format fallbacks
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  // Try ISO format first
  let parsed = parseISO(trimmed);
  if (isValid(parsed)) return parsed;

  // Try common formats
  const formats = [
    DATE_FORMATS.ISO,
    DATE_FORMATS.US,
    DATE_FORMATS.EU,
    DATE_FORMATS.DATETIME_LOCAL,
    'yyyy-MM-dd HH:mm',
    'MM-dd-yyyy',
    'dd-MM-yyyy',
    'M/d/yyyy',
    'd/M/yyyy'
  ];

  for (const formatStr of formats) {
    try {
      parsed = parse(trimmed, formatStr, new Date());
      if (isValid(parsed)) return parsed;
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Format a date with timezone support
 */
export function formatDate(
  date: Date | string | null | undefined,
  formatStr: string = DATE_FORMATS.DISPLAY,
  timezone?: string
): string {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return '';

  if (timezone) {
    const zonedDate = toZonedTime(parsedDate, timezone);
    return formatTz(zonedDate, formatStr, { timeZone: timezone });
  }

  return format(parsedDate, formatStr);
}

/**
 * Convert a date to UTC
 */
export function toUTC(date: Date | string, timezone?: string): Date | null {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return null;

  const tz = timezone || getLocalTimezone();
  return fromZonedTime(parsedDate, tz);
}

/**
 * Convert a UTC date to a specific timezone
 */
export function fromUTC(date: Date | string, timezone?: string): Date | null {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return null;

  const tz = timezone || getLocalTimezone();
  return toZonedTime(parsedDate, tz);
}

/**
 * Get the start of day in a specific timezone
 */
export function getStartOfDay(date: Date | string, timezone?: string): Date | null {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return null;

  if (timezone) {
    const zonedDate = toZonedTime(parsedDate, timezone);
    const startOfDayZoned = startOfDay(zonedDate);
    return fromZonedTime(startOfDayZoned, timezone);
  }

  return startOfDay(parsedDate);
}

/**
 * Get the end of day in a specific timezone
 */
export function getEndOfDay(date: Date | string, timezone?: string): Date | null {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return null;

  if (timezone) {
    const zonedDate = toZonedTime(parsedDate, timezone);
    const endOfDayZoned = endOfDay(zonedDate);
    return fromZonedTime(endOfDayZoned, timezone);
  }

  return endOfDay(parsedDate);
}

/**
 * Calculate business days between two dates
 */
export function getBusinessDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;
  
  if (!start || !end || !isValid(start) || !isValid(end)) return 0;

  let businessDays = 0;
  let currentDate = new Date(start);

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      businessDays++;
    }
    currentDate = addDays(currentDate, 1);
  }

  return businessDays;
}

/**
 * Calculate age from a date
 */
export function calculateAge(birthDate: Date | string, referenceDate?: Date | string): number {
  const birth = typeof birthDate === 'string' ? parseDate(birthDate) : birthDate;
  const reference = typeof referenceDate === 'string' ? parseDate(referenceDate) : referenceDate || new Date();
  
  if (!birth || !reference || !isValid(birth) || !isValid(reference)) return 0;

  const daysDiff = differenceInDays(reference, birth);
  return Math.floor(daysDiff / 365.25);
}

/**
 * Get relative time description
 */
export function getRelativeTime(date: Date | string, baseDate?: Date): string {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return '';

  return formatDistanceToNow(parsedDate, { 
    addSuffix: true,
    ...(baseDate && { baseDate })
  });
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean {
  const checkDate = typeof date === 'string' ? parseDate(date) : date;
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;

  if (!checkDate || !start || !end || !isValid(checkDate) || !isValid(start) || !isValid(end)) {
    return false;
  }

  return isAfter(checkDate, start) && isBefore(checkDate, end);
}

/**
 * Generate date range
 */
export function generateDateRange(
  startDate: Date | string,
  endDate: Date | string,
  step: number = 1
): Date[] {
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;

  if (!start || !end || !isValid(start) || !isValid(end)) return [];

  const dates: Date[] = [];
  let currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, step);
  }

  return dates;
}

/**
 * Get fiscal year from date
 */
export function getFiscalYear(date: Date | string, fiscalYearStartMonth: number = 4): number {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return new Date().getFullYear();

  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth() + 1; // JavaScript months are 0-indexed

  return month >= fiscalYearStartMonth ? year : year - 1;
}

/**
 * Get quarter from date
 */
export function getQuarter(date: Date | string): number {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return 1;

  return Math.floor(parsedDate.getMonth() / 3) + 1;
}

/**
 * Get week number
 */
export function getWeekNumber(date: Date | string): number {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return 1;

  const firstDayOfYear = new Date(parsedDate.getFullYear(), 0, 1);
  const pastDaysOfYear = differenceInDays(parsedDate, firstDayOfYear);
  
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

/**
 * Validate date against constraints
 */
export interface DateConstraints {
  minDate?: Date | string;
  maxDate?: Date | string;
  allowWeekends?: boolean;
  allowedDaysOfWeek?: number[];
  timezone?: string;
}

export function validateDateConstraints(
  date: Date | string,
  constraints: DateConstraints
): { isValid: boolean; errors: string[] } {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  const errors: string[] = [];

  if (!parsedDate || !isValid(parsedDate)) {
    return { isValid: false, errors: ['Invalid date format'] };
  }

  // Min date check
  if (constraints.minDate) {
    const minDate = typeof constraints.minDate === 'string' 
      ? parseDate(constraints.minDate) 
      : constraints.minDate;
    
    if (minDate && isBefore(parsedDate, minDate)) {
      errors.push(`Date must be on or after ${formatDate(minDate)}`);
    }
  }

  // Max date check
  if (constraints.maxDate) {
    const maxDate = typeof constraints.maxDate === 'string' 
      ? parseDate(constraints.maxDate) 
      : constraints.maxDate;
    
    if (maxDate && isAfter(parsedDate, maxDate)) {
      errors.push(`Date must be on or before ${formatDate(maxDate)}`);
    }
  }

  // Weekend check
  if (constraints.allowWeekends === false) {
    const dayOfWeek = parsedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      errors.push('Weekends are not allowed');
    }
  }

  // Allowed days check
  if (constraints.allowedDaysOfWeek && constraints.allowedDaysOfWeek.length > 0) {
    const dayOfWeek = parsedDate.getDay();
    if (!constraints.allowedDaysOfWeek.includes(dayOfWeek)) {
      errors.push('This day of the week is not allowed');
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? parseDate(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseDate(endDate) : endDate;

  if (!start || !end || !isValid(start) || !isValid(end)) return '';

  const days = differenceInDays(end, start);
  const hours = differenceInHours(end, start);
  const minutes = differenceInMinutes(end, start);

  if (days > 0) {
    const remainingHours = hours - (days * 24);
    return remainingHours > 0 
      ? `${days}d ${remainingHours}h`
      : `${days}d`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes - (hours * 60);
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  return `${minutes}m`;
}

/**
 * Get timezone offset in hours
 */
export function getTimezoneOffset(timezone: string, date?: Date): number {
  const targetDate = date || new Date();
  const utcDate = new Date(targetDate.toISOString());
  const zonedDate = toZonedTime(utcDate, timezone);
  
  return (zonedDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
}

/**
 * Convert date to ISO string with timezone
 */
export function toISOStringWithTimezone(date: Date | string, timezone?: string): string {
  const parsedDate = typeof date === 'string' ? parseDate(date) : date;
  if (!parsedDate || !isValid(parsedDate)) return '';

  if (timezone) {
    const zonedDate = toZonedTime(parsedDate, timezone);
    return formatTz(zonedDate, DATE_FORMATS.DATETIME_ISO, { timeZone: timezone });
  }

  return parsedDate.toISOString();
}

/**
 * Create a date picker value object
 */
export interface DatePickerValue {
  date: Date | null;
  formatted: string;
  iso: string;
  isValid: boolean;
  timezone?: string;
}

export function createDatePickerValue(
  value: string | Date | null,
  timezone?: string
): DatePickerValue {
  const date = typeof value === 'string' ? parseDate(value) : value;
  const isValid = date !== null && isValid(date);

  return {
    date,
    formatted: isValid ? formatDate(date, DATE_FORMATS.DISPLAY, timezone) : '',
    iso: isValid ? toISOStringWithTimezone(date!, timezone) : '',
    isValid,
    timezone
  };
}