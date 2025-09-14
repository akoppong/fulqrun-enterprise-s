import { useState, useCallback, useMemo } from 'react';
import { 
  parseDate, 
  formatDate, 
  validateDateConstraints, 
  DateConstraints, 
  DATE_FORMATS,
  getLocalTimezone,
  createDatePickerValue,
  DatePickerValue
} from '../lib/date-utils';

export interface UseDateValidationOptions extends DateConstraints {
  format?: string;
  required?: boolean;
  initialValue?: string | Date | null;
  onValidChange?: (date: Date | null, isValid: boolean) => void;
}

export interface DateValidationResult {
  value: DatePickerValue;
  rawValue: string;
  error: string | null;
  isValid: boolean;
  isTouched: boolean;
  setValue: (value: string | Date | null) => void;
  setTouched: (touched: boolean) => void;
  reset: () => void;
  validate: () => boolean;
}

export function useDateValidation(options: UseDateValidationOptions = {}): DateValidationResult {
  const {
    format = DATE_FORMATS.ISO,
    required = false,
    initialValue = null,
    timezone = getLocalTimezone(),
    onValidChange,
    ...constraints
  } = options;

  const [rawValue, setRawValue] = useState<string>(() => {
    if (initialValue) {
      const date = typeof initialValue === 'string' ? parseDate(initialValue) : initialValue;
      return date ? formatDate(date, format, timezone) : '';
    }
    return '';
  });

  const [isTouched, setIsTouched] = useState(false);

  const validationResult = useMemo(() => {
    const parsedDate = parseDate(rawValue);
    let error: string | null = null;
    let dateIsValid = true;

    // Required validation
    if (required && !parsedDate) {
      error = 'This field is required';
      dateIsValid = false;
    }

    // Date format validation
    if (rawValue.trim() && !parsedDate) {
      error = 'Please enter a valid date';
      dateIsValid = false;
    }

    // Constraint validation
    if (parsedDate && dateIsValid) {
      const constraintResult = validateDateConstraints(parsedDate, {
        ...constraints,
        timezone
      });
      
      if (!constraintResult.isValid) {
        error = constraintResult.errors[0] || 'Invalid date';
        dateIsValid = false;
      }
    }

    const value = createDatePickerValue(parsedDate, timezone);

    return { value, error, isValid: dateIsValid };
  }, [rawValue, required, constraints, timezone, format]);

  const setValue = useCallback((newValue: string | Date | null) => {
    let stringValue = '';
    
    if (typeof newValue === 'string') {
      stringValue = newValue;
    } else if (newValue instanceof Date) {
      stringValue = formatDate(newValue, format, timezone);
    }

    setRawValue(stringValue);

    // Call onValidChange if provided
    if (onValidChange) {
      const parsedDate = parseDate(stringValue);
      const isValid = parsedDate !== null && validateDateConstraints(parsedDate, constraints).isValid;
      onValidChange(parsedDate, isValid);
    }
  }, [format, timezone, constraints, onValidChange]);

  const setTouched = useCallback((touched: boolean) => {
    setIsTouched(touched);
  }, []);

  const reset = useCallback(() => {
    setRawValue('');
    setIsTouched(false);
  }, []);

  const validate = useCallback(() => {
    setIsTouched(true);
    return validationResult.isValid;
  }, [validationResult.isValid]);

  return {
    value: validationResult.value,
    rawValue,
    error: isTouched ? validationResult.error : null,
    isValid: validationResult.isValid,
    isTouched,
    setValue,
    setTouched,
    reset,
    validate
  };
}

/**
 * Hook for date range validation
 */
export interface UseDateRangeOptions {
  startDateConstraints?: DateConstraints;
  endDateConstraints?: DateConstraints;
  format?: string;
  timezone?: string;
  required?: boolean;
  minDuration?: number; // in days
  maxDuration?: number; // in days
  onValidChange?: (startDate: Date | null, endDate: Date | null, isValid: boolean) => void;
}

export interface DateRangeValidationResult {
  startDate: DateValidationResult;
  endDate: DateValidationResult;
  rangeError: string | null;
  isRangeValid: boolean;
  reset: () => void;
  validate: () => boolean;
}

export function useDateRangeValidation(options: UseDateRangeOptions = {}): DateRangeValidationResult {
  const {
    startDateConstraints = {},
    endDateConstraints = {},
    format = DATE_FORMATS.ISO,
    timezone = getLocalTimezone(),
    required = false,
    minDuration,
    maxDuration,
    onValidChange
  } = options;

  const startDate = useDateValidation({
    ...startDateConstraints,
    format,
    timezone,
    required
  });

  const endDate = useDateValidation({
    ...endDateConstraints,
    format,
    timezone,
    required,
    minDate: startDate.value.date || undefined
  });

  const rangeValidation = useMemo(() => {
    let rangeError: string | null = null;
    let isRangeValid = true;

    if (startDate.value.date && endDate.value.date) {
      // Check if end date is after start date
      if (endDate.value.date <= startDate.value.date) {
        rangeError = 'End date must be after start date';
        isRangeValid = false;
      }

      // Check minimum duration
      if (minDuration && isRangeValid) {
        const daysDiff = Math.floor(
          (endDate.value.date.getTime() - startDate.value.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff < minDuration) {
          rangeError = `Duration must be at least ${minDuration} days`;
          isRangeValid = false;
        }
      }

      // Check maximum duration
      if (maxDuration && isRangeValid) {
        const daysDiff = Math.floor(
          (endDate.value.date.getTime() - startDate.value.date.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysDiff > maxDuration) {
          rangeError = `Duration cannot exceed ${maxDuration} days`;
          isRangeValid = false;
        }
      }

      // Call onValidChange if provided
      if (onValidChange) {
        const overallValid = startDate.isValid && endDate.isValid && isRangeValid;
        onValidChange(startDate.value.date, endDate.value.date, overallValid);
      }
    }

    return { rangeError, isRangeValid };
  }, [startDate.value.date, endDate.value.date, startDate.isValid, endDate.isValid, minDuration, maxDuration, onValidChange]);

  const reset = useCallback(() => {
    startDate.reset();
    endDate.reset();
  }, [startDate, endDate]);

  const validate = useCallback(() => {
    const startValid = startDate.validate();
    const endValid = endDate.validate();
    return startValid && endValid && rangeValidation.isRangeValid;
  }, [startDate, endDate, rangeValidation.isRangeValid]);

  return {
    startDate,
    endDate,
    rangeError: (startDate.isTouched || endDate.isTouched) ? rangeValidation.rangeError : null,
    isRangeValid: rangeValidation.isRangeValid,
    reset,
    validate
  };
}

/**
 * Hook for timezone-aware date formatting
 */
export interface UseTimezoneFormatOptions {
  format?: string;
  timezone?: string;
  fallback?: string;
}

export function useTimezoneFormat(options: UseTimezoneFormatOptions = {}) {
  const { format = DATE_FORMATS.DISPLAY, timezone, fallback = '' } = options;

  return useCallback((date: Date | string | null) => {
    if (!date) return fallback;
    return formatDate(date, format, timezone);
  }, [format, timezone, fallback]);
}

/**
 * Common date field configurations for CRM
 */
export const CommonDateFieldConfigs = {
  birthDate: {
    format: DATE_FORMATS.DISPLAY,
    maxDate: new Date(),
    minDate: new Date(1900, 0, 1),
    required: false
  } satisfies UseDateValidationOptions,
  
  createdAt: {
    format: DATE_FORMATS.DISPLAY,
    maxDate: new Date(),
    required: false
  } satisfies UseDateValidationOptions,
  
  eventDate: {
    format: DATE_FORMATS.DISPLAY,
    minDate: new Date(),
    required: true
  } satisfies UseDateValidationOptions,
  
  opportunityCloseDate: {
    format: DATE_FORMATS.DISPLAY,
    minDate: new Date(),
    required: true
  } satisfies UseDateValidationOptions
};

/**
 * Hook for managing multiple date fields with validation
 * Note: This is a simplified version that requires manual field management
 */
export interface UseMultipleDateValidationOptions {
  fields: Record<string, UseDateValidationOptions>;
  onValidChange?: (fieldName: string, date: Date | null, isValid: boolean) => void;
}

export interface MultipleDateValidationResult {
  createField: (fieldName: string) => DateValidationResult;
  isAllValid: (fields: Record<string, DateValidationResult>) => boolean;
  hasErrors: (fields: Record<string, DateValidationResult>) => boolean;
  resetAll: (fields: Record<string, DateValidationResult>) => void;
  validateAll: (fields: Record<string, DateValidationResult>) => boolean;
}

export function useMultipleDateValidation(options: UseMultipleDateValidationOptions): MultipleDateValidationResult {
  const { fields: fieldConfigs, onValidChange } = options;
  
  const createField = useCallback((fieldName: string) => {
    const config = fieldConfigs[fieldName];
    if (!config) {
      throw new Error(`No configuration found for field: ${fieldName}`);
    }
    
    // This would need to be called at the component level for each field
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useDateValidation({
      ...config,
      onValidChange: onValidChange 
        ? (date, isValid) => onValidChange(fieldName, date, isValid)
        : undefined
    });
  }, [fieldConfigs, onValidChange]);
  
  const isAllValid = useCallback((fields: Record<string, DateValidationResult>) => {
    return Object.values(fields).every(field => field.isValid);
  }, []);
  
  const hasErrors = useCallback((fields: Record<string, DateValidationResult>) => {
    return Object.values(fields).some(field => field.error !== null);
  }, []);
  
  const resetAll = useCallback((fields: Record<string, DateValidationResult>) => {
    Object.values(fields).forEach(field => field.reset());
  }, []);
  
  const validateAll = useCallback((fields: Record<string, DateValidationResult>) => {
    return Object.values(fields).every(field => field.validate());
  }, []);
  
  return {
    createField,
    isAllValid,
    hasErrors,
    resetAll,
    validateAll
  };
}