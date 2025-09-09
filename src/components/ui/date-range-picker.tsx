import React, { useState, useCallback } from 'react';
import { Label } from './label';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Calendar } from './calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { CalendarDays, ArrowRight, RotateCcw } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useDateRangeValidation, UseDateRangeOptions } from '@/hooks/useDateValidation';
import { 
  DATE_FORMATS, 
  formatDate as formatDateUtil,
  getLocalTimezone,
  formatDuration
} from '@/lib/date-utils';
import { EnhancedDateInput } from './enhanced-date-input';

export interface DateRangePickerProps {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  onChange?: (startDate: Date | null, endDate: Date | null) => void;
  onValidation?: (isValid: boolean, errors: { start?: string; end?: string; range?: string }) => void;
  
  // Validation options
  validationOptions?: UseDateRangeOptions;
  
  // Display options
  format?: keyof typeof DATE_FORMATS;
  timezone?: string;
  showTimezone?: boolean;
  showDuration?: boolean;
  
  // Labels
  startLabel?: string;
  endLabel?: string;
  label?: string;
  helpText?: string;
  
  // Preset ranges
  showPresets?: boolean;
  customPresets?: Array<{
    label: string;
    startDate: Date;
    endDate: Date;
  }>;
  
  // Layout
  variant?: 'default' | 'inline' | 'compact';
  
  // Props
  className?: string;
  disabled?: boolean;
}

const DEFAULT_PRESETS = [
  {
    label: 'Today',
    startDate: new Date(),
    endDate: new Date()
  },
  {
    label: 'Yesterday',
    startDate: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    })(),
    endDate: (() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    })()
  },
  {
    label: 'Last 7 Days',
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 7);
      return date;
    })(),
    endDate: new Date()
  },
  {
    label: 'Last 30 Days',
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date;
    })(),
    endDate: new Date()
  },
  {
    label: 'This Month',
    startDate: (() => {
      const date = new Date();
      date.setDate(1);
      return date;
    })(),
    endDate: new Date()
  },
  {
    label: 'Last Month',
    startDate: (() => {
      const date = new Date();
      date.setMonth(date.getMonth() - 1, 1);
      return date;
    })(),
    endDate: (() => {
      const date = new Date();
      date.setDate(0);
      return date;
    })()
  }
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  onValidation,
  validationOptions = {},
  format = 'ISO',
  timezone,
  showTimezone = false,
  showDuration = true,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  label,
  helpText,
  showPresets = true,
  customPresets,
  variant = 'default',
  className,
  disabled = false
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone || getLocalTimezone());

  // Use date range validation hook
  const {
    startDate: startDateValidation,
    endDate: endDateValidation,
    rangeError,
    isRangeValid,
    reset
  } = useDateRangeValidation({
    ...validationOptions,
    format,
    timezone: selectedTimezone,
    onValidChange: (start, end, valid) => {
      if (onChange) {
        onChange(start, end);
      }
      if (onValidation) {
        const errors: { start?: string; end?: string; range?: string } = {};
        if (startDateValidation.error) errors.start = startDateValidation.error;
        if (endDateValidation.error) errors.end = endDateValidation.error;
        if (rangeError) errors.range = rangeError;
        onValidation(valid, errors);
      }
    }
  });

  // Handle external value changes
  React.useEffect(() => {
    if (startDate !== undefined) {
      startDateValidation.setValue(startDate);
    }
    if (endDate !== undefined) {
      endDateValidation.setValue(endDate);
    }
  }, [startDate, endDate]);

  const handleCalendarSelect = useCallback((range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      startDateValidation.setValue(range.from);
    }
    if (range?.to) {
      endDateValidation.setValue(range.to);
      setCalendarOpen(false);
    }
  }, [startDateValidation, endDateValidation]);

  const handlePresetSelect = useCallback((preset: typeof DEFAULT_PRESETS[0]) => {
    startDateValidation.setValue(preset.startDate);
    endDateValidation.setValue(preset.endDate);
  }, [startDateValidation, endDateValidation]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const presets = customPresets || DEFAULT_PRESETS;

  // Calculate duration if both dates are valid
  const duration = React.useMemo(() => {
    if (startDateValidation.value.date && endDateValidation.value.date && isRangeValid) {
      return formatDuration(startDateValidation.value.date, endDateValidation.value.date);
    }
    return null;
  }, [startDateValidation.value.date, endDateValidation.value.date, isRangeValid]);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <EnhancedDateInput
          value={startDateValidation.rawValue}
          onChange={(date, formatted) => startDateValidation.setValue(formatted)}
          variant="compact"
          format={format}
          timezone={selectedTimezone}
          placeholder={`Start (${format})`}
          error={startDateValidation.error}
          disabled={disabled}
        />
        
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        
        <EnhancedDateInput
          value={endDateValidation.rawValue}
          onChange={(date, formatted) => endDateValidation.setValue(formatted)}
          variant="compact"
          format={format}
          timezone={selectedTimezone}
          placeholder={`End (${format})`}
          error={endDateValidation.error}
          disabled={disabled}
        />
        
        {rangeError && (
          <span className="text-sm text-destructive">{rangeError}</span>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn('space-y-4', className)}>
        {label && <Label>{label}</Label>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnhancedDateInput
            label={startLabel}
            value={startDateValidation.rawValue}
            onChange={(date, formatted) => startDateValidation.setValue(formatted)}
            format={format}
            timezone={selectedTimezone}
            error={startDateValidation.error}
            disabled={disabled}
            validationOptions={validationOptions?.startDateConstraints}
          />
          
          <EnhancedDateInput
            label={endLabel}
            value={endDateValidation.rawValue}
            onChange={(date, formatted) => endDateValidation.setValue(formatted)}
            format={format}
            timezone={selectedTimezone}
            error={endDateValidation.error}
            disabled={disabled}
            validationOptions={validationOptions?.endDateConstraints}
          />
        </div>
        
        {rangeError && (
          <p className="text-sm text-destructive">{rangeError}</p>
        )}
        
        {showDuration && duration && (
          <p className="text-sm text-muted-foreground">Duration: {duration}</p>
        )}
        
        {helpText && !rangeError && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {label && <Label>{label}</Label>}
      
      <div className="flex items-center space-x-2 flex-wrap gap-2">
        {/* Calendar Popover */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={disabled}>
              <CalendarDays className="w-4 h-4 mr-2" />
              {startDateValidation.value.date && endDateValidation.value.date ? (
                `${formatDateUtil(startDateValidation.value.date, DATE_FORMATS.DISPLAY_SHORT, selectedTimezone)} - ${formatDateUtil(endDateValidation.value.date, DATE_FORMATS.DISPLAY_SHORT, selectedTimezone)}`
              ) : (
                'Select Date Range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              {/* Preset Panel */}
              {showPresets && (
                <div className="border-r p-3 space-y-1">
                  <div className="text-sm font-medium mb-2">Quick Select</div>
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Calendar Panel */}
              <div className="p-3">
                <Calendar
                  mode="range"
                  selected={{
                    from: startDateValidation.value.date || undefined,
                    to: endDateValidation.value.date || undefined
                  }}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={disabled || (!startDateValidation.value.date && !endDateValidation.value.date)}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Individual Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EnhancedDateInput
          label={startLabel}
          value={startDateValidation.rawValue}
          onChange={(date, formatted) => startDateValidation.setValue(formatted)}
          format={format}
          timezone={selectedTimezone}
          showTimezone={showTimezone}
          error={startDateValidation.error}
          disabled={disabled}
          disableCalendar
          validationOptions={validationOptions?.startDateConstraints}
        />
        
        <EnhancedDateInput
          label={endLabel}
          value={endDateValidation.rawValue}
          onChange={(date, formatted) => endDateValidation.setValue(formatted)}
          format={format}
          timezone={selectedTimezone}
          showTimezone={showTimezone}
          error={endDateValidation.error}
          disabled={disabled}
          disableCalendar
          validationOptions={validationOptions?.endDateConstraints}
        />
      </div>
      
      {/* Status and Help Messages */}
      <div className="space-y-1">
        {rangeError && (
          <p className="text-sm text-destructive">{rangeError}</p>
        )}
        
        {showDuration && duration && !rangeError && (
          <p className="text-sm text-muted-foreground">Duration: {duration}</p>
        )}
        
        {helpText && !rangeError && (
          <p className="text-sm text-muted-foreground">{helpText}</p>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;