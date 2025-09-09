import React, { useState, useCallback, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { CalendarDays, Clock, Globe } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useDateValidation, UseDateValidationOptions } from '@/hooks/useDateValidation';
import { 
  DATE_FORMATS, 
  TIMEZONES, 
  getLocalTimezone, 
  formatDate as formatDateUtil,
  parseDate
} from '@/lib/date-utils';

export interface EnhancedDateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string | Date | null;
  onChange?: (date: Date | null, formattedValue: string) => void;
  onValidation?: (isValid: boolean, error: string | null) => void;
  
  // Validation options
  validationOptions?: UseDateValidationOptions;
  
  // Display options
  format?: keyof typeof DATE_FORMATS;
  timezone?: string;
  showTimezone?: boolean;
  showCalendarButton?: boolean;
  showTimeInput?: boolean;
  
  // Labels and help text
  label?: string;
  helpText?: string;
  placeholder?: string;
  
  // Styling
  variant?: 'default' | 'compact';
  error?: string;
  
  // Calendar options
  disableCalendar?: boolean;
  calendarProps?: any;
}

export const EnhancedDateInput: React.FC<EnhancedDateInputProps> = ({
  value,
  onChange,
  onValidation,
  validationOptions = {},
  format = 'ISO',
  timezone,
  showTimezone = false,
  showCalendarButton = true,
  showTimeInput = false,
  label,
  helpText,
  placeholder,
  variant = 'default',
  error: externalError,
  disableCalendar = false,
  calendarProps,
  className,
  ...inputProps
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone || getLocalTimezone());
  const [timeValue, setTimeValue] = useState('00:00');

  // Use date validation hook
  const {
    value: dateValue,
    rawValue,
    error: validationError,
    isValid,
    setValue,
    setTouched
  } = useDateValidation({
    ...validationOptions,
    format,
    timezone: selectedTimezone,
    onValidChange: (date, valid) => {
      if (onChange) {
        const formattedValue = date ? formatDateUtil(date, DATE_FORMATS[format], selectedTimezone) : '';
        onChange(date, formattedValue);
      }
      if (onValidation) {
        onValidation(valid, validationError);
      }
    }
  });

  // Handle external value changes
  useEffect(() => {
    if (value !== undefined) {
      setValue(value);
    }
  }, [value, setValue]);

  // Update time input when date changes
  useEffect(() => {
    if (dateValue.date && showTimeInput) {
      const timeStr = formatDateUtil(dateValue.date, DATE_FORMATS.TIME_24, selectedTimezone);
      setTimeValue(timeStr);
    }
  }, [dateValue.date, selectedTimezone, showTimeInput]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setTouched(true);
  }, [setValue, setTouched]);

  const handleInputBlur = useCallback(() => {
    setTouched(true);
  }, [setTouched]);

  const handleCalendarSelect = useCallback((selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If time input is shown, combine date and time
      if (showTimeInput && timeValue) {
        const [hours, minutes] = timeValue.split(':').map(Number);
        const combinedDate = new Date(selectedDate);
        combinedDate.setHours(hours, minutes, 0, 0);
        setValue(combinedDate);
      } else {
        setValue(selectedDate);
      }
      setCalendarOpen(false);
    }
  }, [setValue, showTimeInput, timeValue]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeValue = e.target.value;
    setTimeValue(newTimeValue);
    
    if (dateValue.date) {
      const [hours, minutes] = newTimeValue.split(':').map(Number);
      const combinedDate = new Date(dateValue.date);
      combinedDate.setHours(hours, minutes, 0, 0);
      setValue(combinedDate);
    }
  }, [dateValue.date, setValue]);

  const handleTimezoneChange = useCallback((newTimezone: string) => {
    setSelectedTimezone(newTimezone);
    // Revalidate with new timezone
    if (dateValue.date) {
      setValue(dateValue.date);
    }
  }, [dateValue.date, setValue]);

  // Error message priority: external > validation > none
  const displayError = externalError || validationError;
  const hasError = Boolean(displayError);

  // Format display value
  const displayValue = React.useMemo(() => {
    if (rawValue) return rawValue;
    if (dateValue.date && isValid) {
      const formatted = formatDateUtil(dateValue.date, DATE_FORMATS[format], selectedTimezone);
      return showTimeInput ? `${formatted} ${timeValue}` : formatted;
    }
    return '';
  }, [rawValue, dateValue.date, isValid, format, selectedTimezone, showTimeInput, timeValue]);

  const commonTimezones = [
    { value: TIMEZONES.UTC, label: 'UTC' },
    { value: TIMEZONES.US_EASTERN, label: 'Eastern (US)' },
    { value: TIMEZONES.US_CENTRAL, label: 'Central (US)' },
    { value: TIMEZONES.US_MOUNTAIN, label: 'Mountain (US)' },
    { value: TIMEZONES.US_PACIFIC, label: 'Pacific (US)' },
    { value: TIMEZONES.EUROPE_LONDON, label: 'London' },
    { value: TIMEZONES.EUROPE_PARIS, label: 'Paris' },
    { value: TIMEZONES.ASIA_TOKYO, label: 'Tokyo' },
    { value: TIMEZONES.AUSTRALIA_SYDNEY, label: 'Sydney' },
    { value: getLocalTimezone(), label: 'Local' }
  ];

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Input
          {...inputProps}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder || `Enter date (${format})`}
          className={cn(
            'flex-1',
            hasError && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        
        {showCalendarButton && !disableCalendar && (
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <CalendarDays className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateValue.date}
                onSelect={handleCalendarSelect}
                {...calendarProps}
              />
            </PopoverContent>
          </Popover>
        )}
        
        {displayError && (
          <span className="text-sm text-destructive">{displayError}</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn(hasError && 'text-destructive')}>
          {label}
          {validationOptions?.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Input
            {...inputProps}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={placeholder || `Enter date (${format})`}
            className={cn(
              'flex-1',
              hasError && 'border-destructive focus-visible:ring-destructive'
            )}
          />
          
          {showCalendarButton && !disableCalendar && (
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="px-3">
                  <CalendarDays className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue.date}
                  onSelect={handleCalendarSelect}
                  {...calendarProps}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
        
        {/* Time Input Row */}
        {showTimeInput && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-32"
            />
          </div>
        )}
        
        {/* Timezone Selection Row */}
        {showTimezone && (
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedTimezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {commonTimezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {/* Help Text and Errors */}
      <div className="space-y-1">
        {displayError && (
          <p className="text-sm text-destructive">{displayError}</p>
        )}
        
        {helpText && !displayError && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
        
        {isValid && dateValue.date && (
          <p className="text-xs text-muted-foreground">
            Parsed: {formatDateUtil(dateValue.date, DATE_FORMATS.DISPLAY_LONG, selectedTimezone)}
            {showTimezone && ` (${selectedTimezone})`}
          </p>
        )}
      </div>
    </div>
  );
};

export default EnhancedDateInput;