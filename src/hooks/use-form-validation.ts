import { useState, useCallback, useEffect } from 'react';
import { FormValidator, ValidationSchema, ValidationError } from '@/lib/validation';

export interface UseFormValidationOptions {
  schema: ValidationSchema;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'all';
  revalidateMode?: 'onChange' | 'onBlur';
  debounceMs?: number;
}

export interface FormValidationState {
  errors: ValidationError[];
  isValid: boolean;
  isValidating: boolean;
  touchedFields: Set<string>;
  isDirty: boolean;
}

export function useFormValidation(options: UseFormValidationOptions) {
  const { schema, mode = 'onBlur', revalidateMode = 'onChange', debounceMs = 300 } = options;
  
  const [state, setState] = useState<FormValidationState>({
    errors: [],
    isValid: true,
    isValidating: false,
    touchedFields: new Set(),
    isDirty: false
  });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const validator = new FormValidator(schema);

  const validateForm = useCallback((data: Record<string, any>, immediate = false) => {
    const doValidation = () => {
      setState(prev => ({ ...prev, isValidating: true }));
      
      const result = validator.validate(data);
      
      setState(prev => ({
        ...prev,
        errors: result.errors,
        isValid: result.isValid,
        isValidating: false
      }));
      
      return result;
    };

    if (immediate || debounceMs === 0) {
      return doValidation();
    }

    // Debounce validation
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      doValidation();
      setDebounceTimer(null);
    }, debounceMs);

    setDebounceTimer(timer);
    return { isValid: true, errors: [] }; // Return optimistic result during debounce
  }, [validator, debounceMs, debounceTimer]);

  const validateField = useCallback((field: string, value: any, allData: Record<string, any>) => {
    const fieldSchema = { [field]: schema[field] };
    if (!fieldSchema[field]) return { isValid: true, error: null };

    const fieldValidator = new FormValidator(fieldSchema);
    const result = fieldValidator.validate({ ...allData, [field]: value });
    
    setState(prev => {
      const newErrors = prev.errors.filter(error => error.field !== field);
      if (!result.isValid) {
        newErrors.push(...result.errors);
      }
      
      return {
        ...prev,
        errors: newErrors,
        isValid: newErrors.length === 0
      };
    });

    return {
      isValid: result.isValid,
      error: result.errors[0]?.message || null
    };
  }, [schema]);

  const markFieldTouched = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, field]),
      isDirty: true
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: [],
      isValid: true
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter(error => error.field !== field)
    }));
  }, []);

  const getFieldError = useCallback((field: string) => {
    const error = state.errors.find(error => error.field === field);
    return error?.message || null;
  }, [state.errors]);

  const hasFieldError = useCallback((field: string) => {
    return state.errors.some(error => error.field === field);
  }, [state.errors]);

  const isFieldTouched = useCallback((field: string) => {
    return state.touchedFields.has(field);
  }, [state.touchedFields]);

  const reset = useCallback(() => {
    setState({
      errors: [],
      isValid: true,
      isValidating: false,
      touchedFields: new Set(),
      isDirty: false
    });
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    ...state,
    validateForm,
    validateField,
    markFieldTouched,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    reset,
    // Convenience methods
    shouldShowError: (field: string) => hasFieldError(field) && (mode === 'all' || isFieldTouched(field)),
    getDisplayError: (field: string) => {
      const hasError = hasFieldError(field);
      const shouldShow = mode === 'all' || isFieldTouched(field);
      return hasError && shouldShow ? getFieldError(field) : null;
    }
  };
}