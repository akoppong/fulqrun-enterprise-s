/**
 * Centralized date utilities for consistent date handling across the application
 * 
 * This module provides a standardized approach to:
 * - Date parsing and formatting
 * - Timezone handling
 * - Date validation
 * - ISO string conversion
 */

import { format, parseISO, isValid, isBefore, isAfter, addDays, subDays } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz';

/**
 * Date validation options interface
 */
export interface DateValidationOptions {
  allowPast?: boolean;
  allowFuture?: boolean;
  minDate?: Date | string;
  maxDate?: Date | string;
  required?: boolean;
  format?: 'ISO' | 'US' | 'EU' | 'custom';
  timezone?: string;
}

/**
 * Date validation result interface
 */
export interface DateValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedDate?: Date;
  isoString?: string;
  formattedDate?: string;
}

/**
 * Date utility class with static methods for consistent date operations
 */
export class DateUtils {
  private static readonly DEFAULT_FORMAT = 'yyyy-MM-dd';
  private static readonly DEFAULT_DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
  private static readonly ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";

  /**
   * Converts various date inputs to a valid Date object
   */
  static parseDate(dateInput: string | Date | number | null | undefined): Date | null {
    if (!dateInput) return null;

    try {
      if (dateInput instanceof Date) {
        return isValid(dateInput) ? dateInput : null;
      }

      if (typeof dateInput === 'number') {
        const date = new Date(dateInput);
        return isValid(date) ? date : null;
      }

      if (typeof dateInput === 'string') {
        // Try parsing ISO string first
        if (dateInput.includes('T') || dateInput.includes('Z')) {
          const date = parseISO(dateInput);
          return isValid(date) ? date : null;
        }

        // Try parsing as regular date string
        const date = new Date(dateInput);
        return isValid(date) ? date : null;
      }

      return null;
    } catch (error) {
      console.warn('DateUtils.parseDate: Failed to parse date:', dateInput, error);
      return null;
    }
  }

  /**
   * Converts a date to ISO string format
   */
  static toISOString(dateInput: string | Date | number | null | undefined): string | null {
    const date = this.parseDate(dateInput);
    return date ? date.toISOString() : null;
  }

  /**
   * Formats a date according to the specified format
   */
  static formatDate(
    dateInput: string | Date | number | null | undefined,
    formatStr: string = this.DEFAULT_FORMAT,
    timezone?: string
  ): string | null {
    const date = this.parseDate(dateInput);
    if (!date) return null;

    try {
      if (timezone) {
        const zonedDate = utcToZonedTime(date, timezone);
        return formatTz(zonedDate, formatStr, { timeZone: timezone });
      }
      return format(date, formatStr);
    } catch (error) {
      console.warn('DateUtils.formatDate: Failed to format date:', dateInput, error);
      return null;
    }
  }

  /**
   * Validates a date input against specified criteria
   */
  static validateDate(
    dateInput: string | Date | number | null | undefined,
    options: DateValidationOptions = {}
  ): DateValidationResult {
    const {
      allowPast = true,
      allowFuture = true,
      minDate,
      maxDate,
      required = false,
      timezone
    } = options;

    const result: DateValidationResult = {
      isValid: true,
      errors: []
    };

    // Check if date is provided when required
    if (required && !dateInput) {
      result.isValid = false;
      result.errors.push('Date is required');
      return result;
    }

    // Allow empty dates when not required
    if (!dateInput && !required) {
      return result;
    }

    // Parse the date
    const parsedDate = this.parseDate(dateInput);
    if (!parsedDate) {
      result.isValid = false;
      result.errors.push('Invalid date format');
      return result;
    }

    result.normalizedDate = parsedDate;
    result.isoString = parsedDate.toISOString();

    const now = new Date();

    // Check past/future restrictions
    if (!allowPast && isBefore(parsedDate, now)) {
      result.isValid = false;
      result.errors.push('Date cannot be in the past');
    }

    if (!allowFuture && isAfter(parsedDate, now)) {
      result.isValid = false;
      result.errors.push('Date cannot be in the future');
    }

    // Check minimum date
    if (minDate) {
      const minDateParsed = this.parseDate(minDate);
      if (minDateParsed && isBefore(parsedDate, minDateParsed)) {
        result.isValid = false;
        result.errors.push(`Date must be after ${this.formatDate(minDateParsed)}`);
      }
    }

    // Check maximum date
    if (maxDate) {
      const maxDateParsed = this.parseDate(maxDate);
      if (maxDateParsed && isAfter(parsedDate, maxDateParsed)) {
        result.isValid = false;
        result.errors.push(`Date must be before ${this.formatDate(maxDateParsed)}`);
      }
    }

    // Format the date for display
    if (timezone) {
      result.formattedDate = this.formatDate(parsedDate, this.DEFAULT_FORMAT, timezone);
    } else {
      result.formattedDate = this.formatDate(parsedDate, this.DEFAULT_FORMAT);
    }

    return result;
  }

  /**
   * Converts a date to the specified timezone
   */
  static toTimezone(
    dateInput: string | Date | number | null | undefined,
    timezone: string
  ): Date | null {
    const date = this.parseDate(dateInput);
    if (!date) return null;

    try {
      return utcToZonedTime(date, timezone);
    } catch (error) {
      console.warn('DateUtils.toTimezone: Failed to convert timezone:', dateInput, error);
      return null;
    }
  }

  /**
   * Converts a date from the specified timezone to UTC
   */
  static fromTimezone(
    dateInput: string | Date | number | null | undefined,
    timezone: string
  ): Date | null {
    const date = this.parseDate(dateInput);
    if (!date) return null;

    try {
      return zonedTimeToUtc(date, timezone);
    } catch (error) {
      console.warn('DateUtils.fromTimezone: Failed to convert from timezone:', dateInput, error);
      return null;
    }
  }

  /**
   * Adds days to a date
   */
  static addDays(
    dateInput: string | Date | number | null | undefined,
    days: number
  ): Date | null {
    const date = this.parseDate(dateInput);
    if (!date) return null;

    try {
      return addDays(date, days);
    } catch (error) {
      console.warn('DateUtils.addDays: Failed to add days:', dateInput, error);
      return null;
    }
  }

  /**
   * Subtracts days from a date
   */
  static subtractDays(
    dateInput: string | Date | number | null | undefined,
    days: number
  ): Date | null {
    const date = this.parseDate(dateInput);
    if (!date) return null;

    try {
      return subDays(date, days);
    } catch (error) {
      console.warn('DateUtils.subtractDays: Failed to subtract days:', dateInput, error);
      return null;
    }
  }

  /**
   * Checks if a date is within a specific range
   */
  static isDateInRange(
    dateInput: string | Date | number | null | undefined,
    startDate: string | Date | number,
    endDate: string | Date | number
  ): boolean {
    const date = this.parseDate(dateInput);
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    if (!date || !start || !end) return false;

    return !isBefore(date, start) && !isAfter(date, end);
  }

  /**
   * Returns the current date in ISO format
   */
  static now(): string {
    return new Date().toISOString();
  }

  /**
   * Returns today's date at midnight in ISO format
   */
  static today(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
  }

  /**
   * Returns tomorrow's date at midnight in ISO format
   */
  static tomorrow(): string {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.toISOString();
  }

  /**
   * Returns yesterday's date at midnight in ISO format
   */
  static yesterday(): string {
    const yesterday = subDays(new Date(), 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday.toISOString();
  }
}

/**
 * Common date validation presets
 */
export const DateValidationPresets = {
  futureDate: {
    allowPast: false,
    allowFuture: true,
    required: true,
    format: 'ISO' as const
  },
  pastDate: {
    allowPast: true,
    allowFuture: false,
    required: true,
    format: 'ISO' as const
  },
  anyDate: {
    allowPast: true,
    allowFuture: true,
    required: true,
    format: 'ISO' as const
  },
  optionalFutureDate: {
    allowPast: false,
    allowFuture: true,
    required: false,
    format: 'ISO' as const
  },
  dateOfBirth: {
    allowPast: true,
    allowFuture: false,
    maxDate: new Date(),
    minDate: new Date('1900-01-01'),
    required: true,
    format: 'ISO' as const
  }
} as const;

/**
 * React Hook for date validation
 */
export function useDateValidation(options: DateValidationOptions = {}) {
  return (dateInput: string | Date | number | null | undefined) => {
    return DateUtils.validateDate(dateInput, options);
  };
}

// Export default instance
export default DateUtils;