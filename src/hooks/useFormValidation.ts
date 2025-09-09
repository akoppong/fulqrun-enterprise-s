import { useState, useCallback, useMemo } from 'react';
import { FormValidator, ValidationSchema, ValidationError } from '@/lib/validation';

interface UseFormValidationOptions {
  schema: ValidationSchema;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  reValidateMode?: 'onChange' | 'onBlur';
}

interface UseFormValidationReturn {
  errors: Record<string, string>;
  isValid: boolean;
  isValidating: boolean;
  touched: Record<string, boolean>;
  validate: (data: Record<string, any>) => Promise<boolean>;
  validateField: (field: string, value: any, allData?: Record<string, any>) => Promise<boolean>;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  getFieldError: (field: string) => string | null;
  hasFieldError: (field: string) => boolean;
  reset: () => void;
}

export function useFormValidation({
  schema,
  mode = 'onSubmit',
  reValidateMode = 'onChange'
}: UseFormValidationOptions): UseFormValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validator = useMemo(() => new FormValidator(schema), [schema]);

  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key]);
  }, [errors]);

  const validate = useCallback(async (data: Record<string, any>): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      const result = validator.validate(data);
      
      const newErrors: Record<string, string> = {};
      result.errors.forEach(error => {
        newErrors[error.field] = error.message;
      });
      
      setErrors(newErrors);
      
      // Mark all fields as touched
      const newTouched: Record<string, boolean> = {};
      Object.keys(schema).forEach(field => {
        newTouched[field] = true;
      });
      setTouched(prev => ({ ...prev, ...newTouched }));
      
      return result.isValid;
    } finally {
      setIsValidating(false);
    }
  }, [validator, schema]);

  const validateField = useCallback(async (
    field: string, 
    value: any, 
    allData?: Record<string, any>
  ): Promise<boolean> => {
    if (!schema[field]) return true;

    const fieldSchema = { [field]: schema[field] };
    const fieldValidator = new FormValidator(fieldSchema);
    const data = allData || { [field]: value };
    
    const result = fieldValidator.validate(data);
    const error = result.errors.find(e => e.field === field);
    
    setErrors(prev => ({
      ...prev,
      [field]: error ? error.message : ''
    }));

    return !error;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  const setFieldTouched = useCallback((field: string, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
  }, []);

  const getFieldError = useCallback((field: string): string | null => {
    return errors[field] || null;
  }, [errors]);

  const hasFieldError = useCallback((field: string): boolean => {
    return !!(errors[field] && touched[field]);
  }, [errors, touched]);

  const reset = useCallback(() => {
    setErrors({});
    setTouched({});
    setIsValidating(false);
  }, []);

  return {
    errors,
    isValid,
    isValidating,
    touched,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldTouched,
    getFieldError,
    hasFieldError,
    reset
  };
}

// Convenience hook for common form patterns
export function useFormField(
  fieldName: string,
  validation: UseFormValidationReturn,
  value: any,
  allFormData?: Record<string, any>
) {
  const handleBlur = useCallback(() => {
    validation.setFieldTouched(fieldName, true);
    validation.validateField(fieldName, value, allFormData);
  }, [fieldName, validation, value, allFormData]);

  const handleChange = useCallback((newValue: any) => {
    if (validation.touched[fieldName]) {
      validation.validateField(fieldName, newValue, { ...allFormData, [fieldName]: newValue });
    }
  }, [fieldName, validation, allFormData]);

  return {
    error: validation.hasFieldError(fieldName) ? validation.getFieldError(fieldName) : null,
    hasError: validation.hasFieldError(fieldName),
    isTouched: validation.touched[fieldName],
    onBlur: handleBlur,
    onChange: handleChange
  };
}

// Hook for multi-step form validation
export function useMultiStepValidation(stepSchemas: Record<string, ValidationSchema>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<string, Record<string, string>>>({});
  
  const stepNames = Object.keys(stepSchemas);
  const currentStepName = stepNames[currentStep];
  const currentSchema = stepSchemas[currentStepName];

  const currentStepValidation = useFormValidation({ 
    schema: currentSchema || {},
    mode: 'onBlur'
  });

  const validateStep = useCallback(async (stepName: string, data: Record<string, any>): Promise<boolean> => {
    const schema = stepSchemas[stepName];
    if (!schema) return true;

    const validator = new FormValidator(schema);
    const result = validator.validate(data);
    
    const newErrors: Record<string, string> = {};
    result.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });
    
    setStepErrors(prev => ({
      ...prev,
      [stepName]: newErrors
    }));

    return result.isValid;
  }, [stepSchemas]);

  const hasStepErrors = useCallback((stepName: string): boolean => {
    const errors = stepErrors[stepName] || {};
    return Object.keys(errors).some(key => errors[key]);
  }, [stepErrors]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < stepNames.length) {
      setCurrentStep(step);
    }
  }, [stepNames.length]);

  const nextStep = useCallback(() => {
    if (currentStep < stepNames.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, stepNames.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setStepErrors({});
    currentStepValidation.reset();
  }, [currentStepValidation]);

  return {
    currentStep,
    currentStepName,
    stepNames,
    currentStepValidation,
    stepErrors,
    validateStep,
    hasStepErrors,
    goToStep,
    nextStep,
    prevStep,
    reset,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === stepNames.length - 1,
    totalSteps: stepNames.length
  };
}

// Hook for form submission with validation
export function useValidatedForm<T extends Record<string, any>>(
  schema: ValidationSchema,
  onSubmit: (data: T) => Promise<void> | void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const validation = useFormValidation({ schema, mode: 'onSubmit' });

  const handleSubmit = useCallback(async (data: T, e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const isValid = await validation.validate(data);
      
      if (!isValid) {
        throw new Error('Please fix validation errors before submitting');
      }

      await onSubmit(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during submission';
      setSubmitError(message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validation, onSubmit]);

  return {
    ...validation,
    isSubmitting,
    submitError,
    handleSubmit,
    clearSubmitError: () => setSubmitError(null)
  };
}