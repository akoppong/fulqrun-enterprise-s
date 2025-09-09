import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DateValidator, DateValidationOptions, DateInput } from '@/lib/date-validation';
import { cn } from '@/lib/utils';
import { CalendarIcon, WarningIcon, InfoIcon } from '@phosphor-icons/react';

interface DateInputProps {
  id?: string;
  name?: string;
  label?: string;
  value?: DateInput;
  onChange?: (value: string | null, isValid: boolean) => void;
  onValidationChange?: (isValid: boolean, error?: string, warnings?: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  validation?: DateValidationOptions;
  showCalendar?: boolean;
  showRelativeTime?: boolean;
  format?: 'display' | 'compact' | 'ISO';
  error?: string;
}

export function DateInput({
  id,
  name,
  label,
  value,
  onChange,
  onValidationChange,
  placeholder = 'Select date...',
  disabled = false,
  required = false,
  className,
  validation = {},
  showCalendar = true,
  showRelativeTime = false,
  format = 'display',
  error: externalError
}: DateInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [validationError, setValidationError] = useState<string>('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [normalizedDate, setNormalizedDate] = useState<Date | null>(null);

  // Initialize input value from prop
  useEffect(() => {
    if (value) {
      const result = DateValidator.validate(value, { ...validation, required });
      if (result.isValid && result.normalizedDate) {
        setInputValue(DateValidator.formatDate(result.normalizedDate, format));
        setNormalizedDate(result.normalizedDate);
      } else if (typeof value === 'string') {
        setInputValue(value); // Show original input for user to correct
        setNormalizedDate(null);
      }
    } else {
      setInputValue('');
      setNormalizedDate(null);
    }
  }, [value, format]);

  const validateInput = (inputValue: string) => {
    const result = DateValidator.validate(inputValue, { ...validation, required });
    
    setIsValid(result.isValid);
    setValidationError(result.error || '');
    setWarnings(result.warnings || []);
    setNormalizedDate(result.normalizedDate || null);

    // Notify parent components
    onValidationChange?.(result.isValid, result.error, result.warnings);
    onChange?.(result.isoString || null, result.isValid);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.trim() === '') {
      if (required) {
        setIsValid(false);
        setValidationError('Date is required');
        setWarnings([]);
        setNormalizedDate(null);
        onValidationChange?.(false, 'Date is required', []);
        onChange?.(null, false);
      } else {
        setIsValid(true);
        setValidationError('');
        setWarnings([]);
        setNormalizedDate(null);
        onValidationChange?.(true, undefined, []);
        onChange?.(null, true);
      }
      return;
    }

    // Debounce validation for better UX
    const timeoutId = setTimeout(() => validateInput(newValue), 300);
    return () => clearTimeout(timeoutId);
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const formattedValue = DateValidator.formatDate(date, format);
      setInputValue(formattedValue);
      setNormalizedDate(date);
      setIsPopoverOpen(false);
      
      // Validate the selected date
      validateInput(date.toISOString());
    }
  };

  const handleInputBlur = () => {
    validateInput(inputValue);
  };

  const displayError = externalError || validationError;
  const hasError = !isValid || !!externalError;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <div className="flex gap-2">
          <Input
            id={id}
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              hasError && 'border-destructive bg-destructive/5',
              isValid && inputValue && 'border-green-500 bg-green-50/50',
              'pr-10'
            )}
            aria-invalid={hasError}
            aria-describedby={
              displayError ? `${id}-error` : 
              warnings.length > 0 ? `${id}-warnings` : undefined
            }
          />
          
          {showCalendar && !disabled && (
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3"
                  type="button"
                  disabled={disabled}
                  aria-label="Open calendar"
                >
                  <CalendarIcon size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={normalizedDate || undefined}
                  onSelect={handleCalendarSelect}
                  disabled={(date) => {
                    const result = DateValidator.validate(date, validation);
                    return !result.isValid;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Validation status indicator */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {hasError && <WarningIcon className="h-4 w-4 text-destructive" />}
          {isValid && inputValue && !hasError && (
            <div className="h-2 w-2 bg-green-500 rounded-full" />
          )}
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <Alert variant="destructive" className="py-2" id={`${id}-error`}>
          <WarningIcon className="h-4 w-4" />
          <AlertDescription className="text-sm">{displayError}</AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {warnings.length > 0 && !hasError && (
        <Alert className="py-2" id={`${id}-warnings`}>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {warnings.map((warning, index) => (
              <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                {warning}
              </Badge>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Relative time display */}
      {showRelativeTime && normalizedDate && isValid && (
        <div className="text-xs text-muted-foreground">
          {DateValidator.formatDate(normalizedDate, 'display')} 
          <span className="ml-2 italic">
            ({new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
              Math.round((normalizedDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
              'day'
            )})
          </span>
        </div>
      )}

      {/* Format info for development */}
      {process.env.NODE_ENV === 'development' && normalizedDate && (
        <details className="text-xs text-muted-foreground">
          <summary>Debug Info</summary>
          <div className="mt-1 space-y-1 font-mono text-xs">
            <div>ISO: {normalizedDate.toISOString()}</div>
            <div>Local: {normalizedDate.toLocaleDateString()}</div>
            <div>Timestamp: {normalizedDate.getTime()}</div>
          </div>
        </details>
      )}
    </div>
  );
}

// Specialized date inputs for common use cases
export function OpportunityCloseDateInput(props: Omit<DateInputProps, 'validation'>) {
  return (
    <DateInput
      {...props}
      validation={{
        allowPast: false,
        allowFuture: true,
        required: true,
        maxDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years
      }}
      showRelativeTime={true}
      label={props.label || 'Expected Close Date'}
    />
  );
}

export function BusinessDateInput(props: Omit<DateInputProps, 'validation'>) {
  return (
    <DateInput
      {...props}
      validation={{
        allowPast: true,
        allowFuture: true,
        minDate: new Date('1900-01-01'),
        maxDate: new Date('2100-12-31'),
        required: props.required
      }}
      label={props.label || 'Date'}
    />
  );
}

export function BirthDateInput(props: Omit<DateInputProps, 'validation'>) {
  return (
    <DateInput
      {...props}
      validation={{
        allowPast: true,
        allowFuture: false,
        minDate: new Date('1900-01-01'),
        maxDate: new Date(),
        required: props.required
      }}
      label={props.label || 'Date of Birth'}
    />
  );
}

export function EventDateInput(props: Omit<DateInputProps, 'validation' | 'showRelativeTime'>) {
  return (
    <DateInput
      {...props}
      validation={{
        allowPast: true,
        allowFuture: true,
        required: props.required
      }}
      showRelativeTime={true}
      label={props.label || 'Event Date'}
    />
  );
}