import { useState, useCallback, useEffect } from 'react';
import { DateValidator, DateValidationOptions, DateInput } from '@/lib/date-validation';
import { DataNormalizer, DataSchema, NormalizationOptions } from '@/lib/data-normalizer';

/**
 * Hook for comprehensive date validation with normalization
 */
export function useDateValidation(options: DateValidationOptions = {}) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string[]>>({});
  
  const validateDate = useCallback((
    fieldName: string, 
    value: DateInput, 
    fieldOptions?: DateValidationOptions
  ) => {
    const result = DateValidator.validate(value, { ...options, ...fieldOptions });
    
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: result.error || ''
    }));
    
    setValidationWarnings(prev => ({
      ...prev,
      [fieldName]: result.warnings || []
    }));
    
    return result;
  }, [options]);
  
  const normalizeDate = useCallback((value: DateInput) => {
    return DateValidator.normalizeForStorage(value);
  }, []);
  
  const formatDate = useCallback((value: DateInput, format?: 'display' | 'compact') => {
    return DateValidator.normalizeForDisplay(value, format);
  }, []);
  
  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));
      setValidationWarnings(prev => ({ ...prev, [fieldName]: [] }));
    } else {
      setValidationErrors({});
      setValidationWarnings({});
    }
  }, []);
  
  return {
    validateDate,
    normalizeDate,
    formatDate,
    clearValidation,
    validationErrors,
    validationWarnings,
    hasErrors: Object.values(validationErrors).some(error => error),
    getFieldError: (fieldName: string) => validationErrors[fieldName] || '',
    getFieldWarnings: (fieldName: string) => validationWarnings[fieldName] || []
  };
}

/**
 * Hook for form-wide data normalization and validation
 */
export function useDataNormalization<T extends Record<string, any>>(
  schema: DataSchema,
  normalizationOptions: NormalizationOptions = {}
) {
  const [normalizationErrors, setNormalizationErrors] = useState<Array<{ field: string; error: string }>>([]);
  const [normalizationWarnings, setNormalizationWarnings] = useState<Array<{ field: string; warning: string }>>([]);
  const [normalizedData, setNormalizedData] = useState<T | null>(null);
  
  const normalizeFormData = useCallback((data: T) => {
    const result = DataNormalizer.normalizeObject(data, schema, normalizationOptions);
    
    setNormalizedData(result.normalized);
    setNormalizationErrors(result.errors);
    setNormalizationWarnings(result.warnings);
    
    return result;
  }, [schema, normalizationOptions]);
  
  const clearNormalization = useCallback(() => {
    setNormalizedData(null);
    setNormalizationErrors([]);
    setNormalizationWarnings([]);
  }, []);
  
  const getFieldNormalizationError = useCallback((fieldName: string) => {
    return normalizationErrors.find(error => error.field === fieldName)?.error || '';
  }, [normalizationErrors]);
  
  const getFieldNormalizationWarning = useCallback((fieldName: string) => {
    return normalizationWarnings.find(warning => warning.field === fieldName)?.warning || '';
  }, [normalizationWarnings]);
  
  return {
    normalizeFormData,
    clearNormalization,
    normalizedData,
    normalizationErrors,
    normalizationWarnings,
    hasNormalizationErrors: normalizationErrors.length > 0,
    hasNormalizationWarnings: normalizationWarnings.length > 0,
    getFieldNormalizationError,
    getFieldNormalizationWarning
  };
}

/**
 * Hook for managing date ranges with validation
 */
export function useDateRangeValidation(options: DateValidationOptions = {}) {
  const [rangeError, setRangeError] = useState<string>('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  
  const validateRange = useCallback((start: DateInput, end: DateInput) => {
    const result = DateValidator.createRangeValidator(start, end);
    
    if (!result.isValid) {
      setRangeError(result.error || 'Invalid date range');
      setStartDate(null);
      setEndDate(null);
      return false;
    }
    
    setRangeError('');
    setStartDate(result.normalizedStart || null);
    setEndDate(result.normalizedEnd || null);
    return true;
  }, []);
  
  const clearRangeValidation = useCallback(() => {
    setRangeError('');
    setStartDate(null);
    setEndDate(null);
  }, []);
  
  return {
    validateRange,
    clearRangeValidation,
    rangeError,
    startDate,
    endDate,
    hasRangeError: !!rangeError,
    isValidRange: !rangeError && startDate && endDate
  };
}

/**
 * Hook for auto-saving with date normalization
 */
export function useAutoSaveWithValidation<T extends Record<string, any>>(
  key: string,
  schema: DataSchema,
  saveDelay: number = 1000
) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  
  const { normalizeFormData, normalizationErrors } = useDataNormalization<T>(schema);
  
  const saveData = useCallback(async (data: T) => {
    try {
      setIsSaving(true);
      setSaveError('');
      
      const normalized = normalizeFormData(data);
      
      if (normalized.errors.length > 0) {
        throw new Error(`Validation failed: ${normalized.errors.map(e => e.error).join(', ')}`);
      }
      
      // Save to KV store (simulated)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLastSaved(new Date());
      return normalized.normalized;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Save failed');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [normalizeFormData]);
  
  const autoSave = useCallback(
    debounce(saveData, saveDelay),
    [saveData, saveDelay]
  );
  
  return {
    saveData,
    autoSave,
    lastSaved,
    isSaving,
    saveError,
    hasValidationErrors: normalizationErrors.length > 0,
    validationErrors: normalizationErrors
  };
}

/**
 * Hook for managing multiple date fields in forms
 */
export function useMultipleDateValidation(
  fields: Record<string, DateValidationOptions> = {}
) {
  const [fieldValidations, setFieldValidations] = useState<Record<string, {
    isValid: boolean;
    error?: string;
    warnings?: string[];
    normalizedValue?: string;
  }>>({});
  
  const validateField = useCallback((fieldName: string, value: DateInput) => {
    const options = fields[fieldName] || {};
    const result = DateValidator.validate(value, options);
    
    setFieldValidations(prev => ({
      ...prev,
      [fieldName]: {
        isValid: result.isValid,
        error: result.error,
        warnings: result.warnings,
        normalizedValue: result.isoString
      }
    }));
    
    return result;
  }, [fields]);
  
  const validateAllFields = useCallback((data: Record<string, DateInput>) => {
    const results: Record<string, any> = {};
    let allValid = true;
    
    for (const [fieldName, value] of Object.entries(data)) {
      if (fields[fieldName]) {
        const result = validateField(fieldName, value);
        results[fieldName] = result;
        if (!result.isValid) allValid = false;
      }
    }
    
    return { allValid, results };
  }, [validateField, fields]);
  
  const clearAllValidations = useCallback(() => {
    setFieldValidations({});
  }, []);
  
  const getNormalizedData = useCallback(() => {
    const normalized: Record<string, string | null> = {};
    
    for (const [fieldName, validation] of Object.entries(fieldValidations)) {
      if (validation.isValid && validation.normalizedValue) {
        normalized[fieldName] = validation.normalizedValue;
      } else {
        normalized[fieldName] = null;
      }
    }
    
    return normalized;
  }, [fieldValidations]);
  
  return {
    validateField,
    validateAllFields,
    clearAllValidations,
    getNormalizedData,
    fieldValidations,
    allFieldsValid: Object.values(fieldValidations).every(v => v.isValid),
    hasAnyErrors: Object.values(fieldValidations).some(v => !v.isValid),
    getFieldError: (fieldName: string) => fieldValidations[fieldName]?.error,
    getFieldWarnings: (fieldName: string) => fieldValidations[fieldName]?.warnings || [],
    isFieldValid: (fieldName: string) => fieldValidations[fieldName]?.isValid ?? true
  };
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Export commonly used validation configurations
export const CommonDateFieldConfigs = {
  opportunityCloseDate: {
    allowPast: false,
    allowFuture: true,
    required: true,
    maxDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
  },
  
  createdAt: {
    allowPast: true,
    allowFuture: false,
    required: true
  },
  
  updatedAt: {
    allowPast: true,
    allowFuture: true,
    required: true
  },
  
  eventDate: {
    allowPast: true,
    allowFuture: true,
    required: true
  },
  
  birthDate: {
    allowPast: true,
    allowFuture: false,
    minDate: new Date('1900-01-01'),
    maxDate: new Date(),
    required: false
  }
} as const;