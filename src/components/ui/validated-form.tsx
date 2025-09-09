import { useState, useRef, useCallback, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormValidation } from '@/hooks/use-form-validation';
import { ValidationSchema } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { Warning, CheckCircle } from '@phosphor-icons/react';

export interface ValidatedFormProps {
  schema: ValidationSchema;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>, { setSubmitting, setError }: {
    setSubmitting: (submitting: boolean) => void;
    setError: (error: string | null) => void;
  }) => Promise<void> | void;
  onValidChange?: (isValid: boolean) => void;
  submitText?: string;
  resetText?: string;
  showReset?: boolean;
  disabled?: boolean;
  className?: string;
  children: (helpers: FormHelpers) => React.ReactNode;
  validateOnChange?: boolean;
  showSuccessMessage?: boolean;
  successMessage?: string;
}

export interface FormHelpers {
  data: Record<string, any>;
  setData: (key: string, value: any) => void;
  updateData: (updates: Record<string, any>) => void;
  getFieldError: (field: string) => string | null;
  hasFieldError: (field: string) => boolean;
  isFieldTouched: (field: string) => boolean;
  markFieldTouched: (field: string) => void;
  clearFieldError: (field: string) => void;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitError: string | null;
  isSuccess: boolean;
}

export function ValidatedForm({
  schema,
  initialData = {},
  onSubmit,
  onValidChange,
  submitText = 'Submit',
  resetText = 'Reset',
  showReset = true,
  disabled = false,
  className,
  children,
  validateOnChange = false,
  showSuccessMessage = false,
  successMessage = 'Form submitted successfully!',
}: ValidatedFormProps) {
  const [data, setDataState] = useState<Record<string, any>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const validation = useFormValidation({
    schema,
    mode: validateOnChange ? 'onChange' : 'onBlur',
    debounceMs: 300,
  });

  const setData = useCallback((key: string, value: any) => {
    setDataState(prev => {
      const newData = { ...prev, [key]: value };
      
      // Validate on change if enabled
      if (validateOnChange) {
        validation.validateForm(newData);
      } else if (validation.isFieldTouched(key)) {
        // Always revalidate touched fields
        validation.validateField(key, value, newData);
      }
      
      return newData;
    });
    
    // Mark field as touched and dirty
    validation.markFieldTouched(key);
    setIsSuccess(false); // Clear success state on change
    setSubmitError(null); // Clear submit error on change
  }, [validateOnChange, validation]);

  const updateData = useCallback((updates: Record<string, any>) => {
    setDataState(prev => {
      const newData = { ...prev, ...updates };
      
      // Validate updated fields
      Object.keys(updates).forEach(key => {
        validation.markFieldTouched(key);
      });
      
      if (validateOnChange) {
        validation.validateForm(newData);
      }
      
      return newData;
    });
    
    setIsSuccess(false);
    setSubmitError(null);
  }, [validateOnChange, validation]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || disabled) return;

    // Clear previous states
    setSubmitError(null);
    setIsSuccess(false);

    // Mark all fields as touched for validation display
    Object.keys(schema).forEach(field => {
      validation.markFieldTouched(field);
    });

    // Perform final validation
    const validationResult = validation.validateForm(data, true);
    
    if (!validationResult.isValid) {
      // Focus first invalid field
      const firstError = validationResult.errors[0];
      if (firstError) {
        const element = document.getElementById(firstError.field);
        element?.focus();
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      await onSubmit(data, {
        setSubmitting: setIsSubmitting,
        setError: setSubmitError
      });
      
      if (!submitError) {
        setIsSuccess(true);
        if (showSuccessMessage) {
          // Auto-hide success message after 3 seconds
          setTimeout(() => setIsSuccess(false), 3000);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDataState(initialData);
    validation.reset();
    setSubmitError(null);
    setIsSuccess(false);
  };

  // Notify parent of validation changes
  if (onValidChange && validation.isValid !== undefined) {
    onValidChange(validation.isValid && !isSubmitting);
  }

  const formHelpers: FormHelpers = {
    data,
    setData,
    updateData,
    getFieldError: validation.getFieldError,
    hasFieldError: validation.hasFieldError,
    isFieldTouched: validation.isFieldTouched,
    markFieldTouched: validation.markFieldTouched,
    clearFieldError: validation.clearFieldError,
    isSubmitting,
    isValid: validation.isValid,
    isDirty: validation.isDirty,
    submitError,
    isSuccess,
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn('space-y-6', className)}
      noValidate
    >
      {/* Success Message */}
      {isSuccess && showSuccessMessage && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Error */}
      {submitError && (
        <Alert variant="destructive">
          <Warning className="w-4 h-4" />
          <AlertDescription>
            {submitError}
          </AlertDescription>
        </Alert>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {children(formHelpers)}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={disabled || isSubmitting || (!validateOnChange && !validation.isValid)}
            className="flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              submitText
            )}
          </Button>
          
          {showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={disabled || isSubmitting || !validation.isDirty}
              className="flex-1 sm:flex-none"
            >
              {resetText}
            </Button>
          )}
        </div>

        {/* Validation Summary */}
        {validation.errors.length > 0 && validation.isDirty && (
          <div className="text-sm text-muted-foreground sm:text-right">
            {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
    </form>
  );
}