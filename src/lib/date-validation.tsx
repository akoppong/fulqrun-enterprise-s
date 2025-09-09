/**
 * Date Validation Middleware
 * Ensures consistent date formats and validation across all FulQrun CRM components
 * Now powered by advanced date-utils with timezone support
 */

import React from 'react';
import {
  parseDate,
  formatDate as formatDateUtil,
  validateDateConstraints,
  getBusinessDaysBetween,
  calculateAge,
  getRelativeTime,
  isDateInRange,
  getStartOfDay,
  getEndOfDay,
  DATE_FORMATS,
  TIMEZONES,
  DateConstraints,
  getLocalTimezone,
  addDays
} from './date-utils';

export interface DateValidationOptions extends DateConstraints {
  allowPast?: boolean;
  allowFuture?: boolean;
  required?: boolean;
  format?: keyof typeof DATE_FORMATS;
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
    format: 'DISPLAY',
    timezone: getLocalTimezone()
  };

  /**
   * Validates and normalizes a date input using advanced date-utils
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

    // Parse the input date using advanced parser
    let dateObj: Date | null;
    try {
      if (input instanceof Date) {
        dateObj = input;
      } else if (typeof input === 'string') {
        dateObj = parseDate(input);
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
    if (!dateObj || isNaN(dateObj.getTime())) {
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

    // Use advanced constraint validation
    const constraintResult = validateDateConstraints(dateObj, {
      minDate: opts.minDate,
      maxDate: opts.maxDate,
      allowWeekends: opts.allowWeekends,
      allowedDaysOfWeek: opts.allowedDaysOfWeek,
      timezone: opts.timezone
    });

    if (!constraintResult.isValid) {
      result.error = constraintResult.errors[0] || 'Invalid date';
      return result;
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
    const formatKey = opts.format || 'DISPLAY';
    const formatStr = DATE_FORMATS[formatKey] || DATE_FORMATS.DISPLAY;
    
    result.isValid = true;
    result.normalizedDate = dateObj;
    result.isoString = dateObj.toISOString();
    result.localString = formatDateUtil(dateObj, formatStr, opts.timezone);
    result.timestamp = dateObj.getTime();

    return result;
  }

  /**
   * Formats a date according to specified format with timezone support
   */
  static formatDate(
    date: Date,
    format: keyof typeof DATE_FORMATS | 'local' | 'timestamp' = 'DISPLAY',
    timezone?: string
  ): string {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    if (format === 'local') {
      return date.toLocaleDateString();
    }
    
    if (format === 'timestamp') {
      return date.getTime().toString();
    }

    const formatStr = DATE_FORMATS[format as keyof typeof DATE_FORMATS] || DATE_FORMATS.DISPLAY;
    return formatDateUtil(date, formatStr, timezone);
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
  static normalizeForDisplay(input: DateInput, format: keyof typeof DATE_FORMATS = 'DISPLAY'): string {
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
 * Enhanced utility functions using advanced date-utils
 */
export class DateUtils {
  /**
   * Gets business days between two dates using optimized calculation
   */
  static getBusinessDaysBetween(startDate: Date, endDate: Date): number {
    return getBusinessDaysBetween(startDate, endDate);
  }

  /**
   * Adds business days to a date
   */
  static addBusinessDays(date: Date, days: number): Date {
    let result = new Date(date);
    let remainingDays = Math.abs(days);
    const increment = days > 0 ? 1 : -1;

    while (remainingDays > 0) {
      result = addDays(result, increment);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        remainingDays--;
      }
    }

    return result;
  }

  /**
   * Gets the start of day for a date with timezone support
   */
  static startOfDay(date: Date, timezone?: string): Date | null {
    return getStartOfDay(date, timezone);
  }

  /**
   * Gets the end of day for a date with timezone support
   */
  static endOfDay(date: Date, timezone?: string): Date | null {
    return getEndOfDay(date, timezone);
  }

  /**
   * Checks if a date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    const startOfToday = getStartOfDay(today);
    const startOfDate = getStartOfDay(date);
    
    return startOfToday?.getTime() === startOfDate?.getTime();
  }

  /**
   * Gets relative time string using advanced formatting
   */
  static getRelativeTime(date: Date): string {
    return getRelativeTime(date);
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate: Date, referenceDate?: Date): number {
    return calculateAge(birthDate, referenceDate);
  }

  /**
   * Check if date is within range
   */
  static isInRange(date: Date, startDate: Date, endDate: Date): boolean {
    return isDateInRange(date, startDate, endDate);
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

// Export commonly used validation schemas with new format options
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
    required: true,
    allowWeekends: false
  } as DateValidationOptions,
  
  opportunityCloseDate: {
    allowPast: false,
    allowFuture: true,
    minDate: new Date(),
    maxDate: DateUtils.addBusinessDays(new Date(), 730), // 2 years business days
    required: true,
    allowWeekends: false
  } as DateValidationOptions,

  // New timezone-aware validations
  meetingDate: {
    allowPast: false,
    allowFuture: true,
    minDate: new Date(),
    maxDate: addDays(new Date(), 365),
    required: true,
    timezone: getLocalTimezone()
  } as DateValidationOptions,

  contractDate: {
    allowPast: true,
    allowFuture: true,
    minDate: new Date('2000-01-01'),
    required: true,
    format: 'ISO'
  } as DateValidationOptions
};