/**
 * Date Validation Middleware
 * Ensures consistent date formats and validation across all FulQrun CRM components
 */

import React from 'react';

export interface DateValidationOptions {
  allowPast?: boolean;
  allowFuture?: boolean;
  minDate?: Date | string;
  maxDate?: Date | string;
  required?: boolean;
  format?: 'ISO' | 'local' | 'timestamp';
  timezone?: string;
}

export interface DateValidationResult {
  isValid: boolean;
  normalizedDate?: Date;
  isoString?: string;
  localString?: string;
  timestamp?: number;
  error?: string;
  warnings?: string[];
}

export type DateInput = string | Date | number | null | undefined;

export class DateValidator {
  private static readonly DEFAULT_OPTIONS: DateValidationOptions = {
    allowPast: true,
    allowFuture: true,
    required: false,
    format: 'ISO',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  /**
   * Validates and normalizes a date input
   */
  static validate(
    input: DateInput,
    options: DateValidationOptions = {}
  ): DateValidationResult {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const result: DateValidationResult = { isValid: false, warnings: [] };

    // Handle null/undefined values
    if (input === null || input === undefined || input === '') {
      if (opts.required) {
        result.error = 'Date is required';
        return result;
      }
      result.isValid = true;
      return result;
    }

    // Parse the input date
    let dateObj: Date;
    try {
      if (input instanceof Date) {
        dateObj = new Date(input);
      } else if (typeof input === 'string') {
        // Handle various string formats
        dateObj = this.parseStringDate(input);
      } else if (typeof input === 'number') {
        // Handle timestamp (assume milliseconds if > 10^10, otherwise seconds)
        const timestamp = input > 10000000000 ? input : input * 1000;
        dateObj = new Date(timestamp);
      } else {
        throw new Error('Invalid date input type');
      }
    } catch (error) {
      result.error = `Invalid date format: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return result;
    }

    // Validate the parsed date
    if (isNaN(dateObj.getTime())) {
      result.error = 'Invalid date value';
      return result;
    }

    // Check past/future constraints
    const now = new Date();
    if (!opts.allowPast && dateObj < now) {
      result.error = 'Date cannot be in the past';
      return result;
    }

    if (!opts.allowFuture && dateObj > now) {
      result.error = 'Date cannot be in the future';
      return result;
    }

    // Check min/max date constraints
    if (opts.minDate) {
      const minDate = opts.minDate instanceof Date ? opts.minDate : new Date(opts.minDate);
      if (dateObj < minDate) {
        result.error = `Date must be after ${this.formatDate(minDate, 'local')}`;
        return result;
      }
    }

    if (opts.maxDate) {
      const maxDate = opts.maxDate instanceof Date ? opts.maxDate : new Date(opts.maxDate);
      if (dateObj > maxDate) {
        result.error = `Date must be before ${this.formatDate(maxDate, 'local')}`;
        return result;
      }
    }

    // Add warnings for edge cases
    const yearDiff = Math.abs(now.getFullYear() - dateObj.getFullYear());
    if (yearDiff > 100) {
      result.warnings?.push('Date is more than 100 years from current date');
    }

    if (dateObj.getFullYear() < 1900) {
      result.warnings?.push('Date is before 1900');
    }

    if (dateObj.getFullYear() > 2100) {
      result.warnings?.push('Date is after 2100');
    }

    // Success - populate all formats
    result.isValid = true;
    result.normalizedDate = dateObj;
    result.isoString = dateObj.toISOString();
    result.localString = dateObj.toLocaleDateString();
    result.timestamp = dateObj.getTime();

    return result;
  }

  /**
   * Parses string dates with various format support
   */
  private static parseStringDate(dateString: string): Date {
    const cleanString = dateString.trim();

    // ISO format (preferred)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(cleanString)) {
      return new Date(cleanString);
    }

    // Date only (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanString)) {
      return new Date(cleanString + 'T00:00:00.000Z');
    }

    // US format (MM/DD/YYYY)
    const usMatch = cleanString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (usMatch) {
      const [, month, day, year] = usMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    // European format (DD/MM/YYYY)
    const euMatch = cleanString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (euMatch) {
      const [, day, month, year] = euMatch;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      // Validate that the parsed date components match input
      if (date.getDate() === Number(day) && date.getMonth() === Number(month) - 1) {
        return date;
      }
    }

    // Fallback to native Date parsing
    const fallbackDate = new Date(cleanString);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }

    throw new Error(`Unsupported date format: ${cleanString}`);
  }

  /**
   * Formats a date according to specified format
   */
  static formatDate(
    date: Date,
    format: 'ISO' | 'local' | 'timestamp' | 'display' | 'compact' = 'ISO',
    timezone?: string
  ): string {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    switch (format) {
      case 'ISO':
        return date.toISOString();
      
      case 'local':
        return date.toLocaleDateString();
      
      case 'timestamp':
        return date.getTime().toString();
      
      case 'display':
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: timezone
        });
      
      case 'compact':
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: timezone
        });
      
      default:
        return date.toISOString();
    }
  }

  /**
   * Normalizes dates to consistent ISO format for storage
   */
  static normalizeForStorage(input: DateInput): string | null {
    const result = this.validate(input);
    return result.isValid && result.isoString ? result.isoString : null;
  }

  /**
   * Normalizes dates for display to users
   */
  static normalizeForDisplay(input: DateInput, format: 'display' | 'compact' = 'display'): string {
    const result = this.validate(input);
    if (!result.isValid || !result.normalizedDate) {
      return 'Invalid Date';
    }
    return this.formatDate(result.normalizedDate, format);
  }

  /**
   * Creates a date range validator
   */
  static createRangeValidator(startDate: DateInput, endDate: DateInput): {
    isValid: boolean;
    error?: string;
    normalizedStart?: string;
    normalizedEnd?: string;
  } {
    const startResult = this.validate(startDate, { required: true });
    const endResult = this.validate(endDate, { required: true });

    if (!startResult.isValid) {
      return { isValid: false, error: `Start date: ${startResult.error}` };
    }

    if (!endResult.isValid) {
      return { isValid: false, error: `End date: ${endResult.error}` };
    }

    if (startResult.normalizedDate! >= endResult.normalizedDate!) {
      return { isValid: false, error: 'Start date must be before end date' };
    }

    return {
      isValid: true,
      normalizedStart: startResult.isoString,
      normalizedEnd: endResult.isoString
    };
  }
}

/**
 * Utility functions for common date operations
 */
export class DateUtils {
  /**
   * Gets business days between two dates
   */
  static getBusinessDaysBetween(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Adds business days to a date
   */
  static addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date);
    let remainingDays = Math.abs(days);
    const increment = days > 0 ? 1 : -1;

    while (remainingDays > 0) {
      result.setDate(result.getDate() + increment);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        remainingDays--;
      }
    }

    return result;
  }

  /**
   * Gets the start of day for a date
   */
  static startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Gets the end of day for a date
   */
  static endOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Checks if a date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return this.startOfDay(date).getTime() === this.startOfDay(today).getTime();
  }

  /**
   * Gets relative time string (e.g., "2 days ago", "in 3 weeks")
   */
  static getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
    if (diffDays > 7 && diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    if (diffDays < -7 && diffDays >= -30) return `${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;
    
    return this.formatDate(date, 'compact');
  }

  private static formatDate(date: Date, format: string): string {
    return DateValidator.formatDate(date, format as any);
  }
}

/**
 * React hook for date validation
 */
export function useDateValidation(options: DateValidationOptions = {}) {
  return {
    validate: (input: DateInput) => DateValidator.validate(input, options),
    normalize: (input: DateInput) => DateValidator.normalizeForStorage(input),
    display: (input: DateInput, format?: 'display' | 'compact') => 
      DateValidator.normalizeForDisplay(input, format),
    createRangeValidator: DateValidator.createRangeValidator,
    utils: DateUtils
  };
}

/**
 * Higher-order component for automatic date validation
 */
export function withDateValidation<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  dateFields: string[] = [],
  validationOptions: DateValidationOptions = {}
): React.ComponentType<T> {
  return function DateValidatedComponent(props: T) {
    const validatedProps = { ...props };
    
    dateFields.forEach(field => {
      const value = (props as any)[field];
      if (value !== undefined) {
        const result = DateValidator.validate(value, validationOptions);
        if (result.isValid && result.isoString) {
          (validatedProps as any)[field] = result.isoString;
        }
      }
    });

    return React.createElement(Component, validatedProps);
  };
}

// Export commonly used validation schemas
export const CommonDateValidations = {
  futureDate: {
    allowPast: false,
    allowFuture: true,
    required: true
  } as DateValidationOptions,
  
  pastDate: {
    allowPast: true,
    allowFuture: false,
    required: true
  } as DateValidationOptions,
  
  businessDate: {
    allowPast: true,
    allowFuture: true,
    minDate: new Date('1900-01-01'),
    maxDate: new Date('2100-12-31'),
    required: true
  } as DateValidationOptions,
  
  opportunityCloseDate: {
    allowPast: false,
    allowFuture: true,
    minDate: new Date(),
    maxDate: DateUtils.addBusinessDays(new Date(), 730), // 2 years business days
    required: true
  } as DateValidationOptions
};