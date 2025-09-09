import { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Check, Warning, X } from '@phosphor-icons/react';

export interface ValidatedInputProps {
  id: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, error: string | null) => void;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    email?: boolean;
    url?: boolean;
    custom?: (value: string) => string | null;
  };
  validateOn?: 'change' | 'blur' | 'submit';
  debounceMs?: number;
  showValidationState?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string | null;
  success?: boolean;
}

export function ValidatedInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onValidation,
  validation,
  validateOn = 'blur',
  debounceMs = 300,
  showValidationState = true,
  disabled = false,
  className,
  error: externalError,
  success = false,
  ...props
}: ValidatedInputProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const error = externalError || internalError;
  const isValid = !error && touched;
  const showSuccess = success || (isValid && value.length > 0);

  const validate = useCallback((inputValue: string): string | null => {
    if (!validation) return null;

    // Required validation
    if (validation.required && !inputValue.trim()) {
      return `${label || 'Field'} is required`;
    }

    // Skip other validations if empty and not required
    if (!inputValue.trim() && !validation.required) {
      return null;
    }

    // Length validations
    if (validation.minLength && inputValue.length < validation.minLength) {
      return `${label || 'Field'} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && inputValue.length > validation.maxLength) {
      return `${label || 'Field'} cannot exceed ${validation.maxLength} characters`;
    }

    // Email validation
    if (validation.email || type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        return 'Please enter a valid email address';
      }
    }

    // URL validation
    if (validation.url || type === 'url') {
      try {
        new URL(inputValue);
      } catch {
        return 'Please enter a valid URL';
      }
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(inputValue)) {
      return `${label || 'Field'} format is invalid`;
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(inputValue);
      if (customError) return customError;
    }

    return null;
  }, [validation, label, type]);

  const performValidation = useCallback((inputValue: string, immediate = false) => {
    const doValidation = () => {
      setIsValidating(true);
      const validationError = validate(inputValue);
      setInternalError(validationError);
      setIsValidating(false);
      onValidation?.(validationError === null, validationError);
    };

    if (immediate || debounceMs === 0) {
      doValidation();
    } else {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(doValidation, debounceMs);
    }
  }, [validate, onValidation, debounceMs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (validateOn === 'change' || (touched && internalError)) {
      performValidation(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validateOn === 'blur' || validateOn === 'change') {
      performValidation(value, true);
    }
  };

  const handleFocus = () => {
    if (error) {
      setInternalError(null);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Expose validation method for external use
  useEffect(() => {
    if (validateOn === 'submit') {
      // Store validation function on the element for form submission
      const element = document.getElementById(id);
      if (element) {
        (element as any).validate = () => performValidation(value, true);
      }
    }
  }, [id, performValidation, value, validateOn]);

  const inputClasses = cn(
    'pr-10', // Space for validation icon
    error && 'border-destructive focus-visible:ring-destructive',
    showSuccess && 'border-green-500 focus-visible:ring-green-500',
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className={error ? 'text-destructive' : ''}>
          {label}
          {validation?.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        
        {showValidationState && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidating ? (
              <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            ) : error ? (
              <X className="w-4 h-4 text-destructive" />
            ) : showSuccess ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="py-2" id={`${id}-error`}>
          <Warning className="w-4 h-4" />
          <AlertDescription className="text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}