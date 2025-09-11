import { useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Check, Warning, X } from '@phosphor-icons/react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface ValidatedSelectProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onValidation?: (isValid: boolean, error: string | null) => void;
  options: SelectOption[];
  validation?: {
    required?: boolean;
    custom?: (value: string) => string | null;
  };
  validateOn?: 'change' | 'blur' | 'submit';
  showValidationState?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string | null;
  success?: boolean;
}

export function ValidatedSelect({
  id,
  label,
  placeholder = 'Select an option',
  value,
  onChange,
  onValidation,
  options,
  validation,
  validateOn = 'blur',
  showValidationState = true,
  disabled = false,
  className,
  error: externalError,
  success = false,
  ...props
}: ValidatedSelectProps) {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  const error = externalError || internalError;
  const isValid = !error && touched;
  const showSuccess = success || (isValid && value);

  const validate = useCallback((inputValue: string): string | null => {
    if (!validation) return null;

    // Required validation
    if (validation.required && !inputValue) {
      return `${label || 'Field'} is required`;
    }

    // Skip other validations if empty and not required
    if (!inputValue && !validation.required) {
      return null;
    }

    // Check if value exists in options
    const validValues = options.map(option => option.value);
    if (inputValue && !validValues.includes(inputValue)) {
      return `Selected value is not valid`;
    }

    // Custom validation
    if (validation.custom) {
      const customError = validation.custom(inputValue);
      if (customError) return customError;
    }

    return null;
  }, [validation, label, options]);

  const performValidation = useCallback((inputValue: string) => {
    setIsValidating(true);
    const validationError = validate(inputValue);
    setInternalError(validationError);
    setIsValidating(false);
    onValidation?.(validationError === null, validationError);
  }, [validate, onValidation]);

  const handleChange = (newValue: string) => {
    onChange(newValue);

    if (validateOn === 'change' || (touched && internalError)) {
      performValidation(newValue);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !touched) {
      setTouched(true);
      if (validateOn === 'blur' || validateOn === 'change') {
        performValidation(value);
      }
    }
  };

  const triggerClasses = cn(
    'relative',
    error && 'border-destructive focus:ring-destructive',
    showSuccess && 'border-green-500 focus:ring-green-500',
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
        <Select
          value={value}
          onValueChange={handleChange}
          onOpenChange={handleOpenChange}
          disabled={disabled}
          {...props}
        >
          <SelectTrigger
            id={id}
            className={triggerClasses}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <SelectValue placeholder={placeholder} />
            
            {showValidationState && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2">
                {isValidating ? (
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                ) : error ? (
                  <X className="w-4 h-4 text-destructive" />
                ) : showSuccess ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : null}
              </div>
            )}
          </SelectTrigger>
          
          <SelectContent>
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                <div className="flex flex-col">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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