import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  label: string;
  id: string;
  error?: string | null;
  success?: boolean;
  required?: boolean;
  helpText?: string;
  className?: string;
  containerClassName?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'number' | 'url' | 'tel' | 'password';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  disabled?: boolean;
}

export function InputField({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  success,
  required,
  helpText,
  placeholder,
  min,
  max,
  step,
  disabled,
  className,
  containerClassName
}: InputFieldProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Label 
        htmlFor={id} 
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            'w-full',
            hasError && 'border-destructive focus-visible:ring-destructive',
            hasSuccess && 'border-green-500 focus-visible:ring-green-500',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error || helpText ? `${id}-description` : undefined
          }
        />
        
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {(error || helpText) && (
        <div id={`${id}-description`} className="text-sm">
          {error ? (
            <span className="text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </span>
          ) : helpText ? (
            <span className="text-muted-foreground">{helpText}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function TextareaField({
  label,
  id,
  value,
  onChange,
  error,
  success,
  required,
  helpText,
  placeholder,
  rows = 3,
  disabled,
  className,
  containerClassName
}: TextareaFieldProps) {
  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Label 
        htmlFor={id}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>
      
      <div className="relative">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full resize-none',
            hasError && 'border-destructive focus-visible:ring-destructive',
            hasSuccess && 'border-green-500 focus-visible:ring-green-500',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error || helpText ? `${id}-description` : undefined
          }
        />
        
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-3">
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {(error || helpText) && (
        <div id={`${id}-description`} className="text-sm">
          {error ? (
            <span className="text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </span>
          ) : helpText ? (
            <span className="text-muted-foreground">{helpText}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function SelectField({
  label,
  id,
  value,
  onChange,
  error,
  success,
  required,
  helpText,
  placeholder,
  options,
  disabled,
  className,
  containerClassName
}: SelectFieldProps) {
  const hasError = !!error;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Label 
        htmlFor={id}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          required && "after:content-['*'] after:ml-0.5 after:text-destructive"
        )}
      >
        {label}
      </Label>
      
      <div className="relative">
        <Select
          value={value}
          onValueChange={onChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={id}
            className={cn(
              'w-full',
              hasError && 'border-destructive focus:ring-destructive',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              error || helpText ? `${id}-description` : undefined
            }
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-w-[var(--radix-select-trigger-width)] min-w-[300px]">
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {hasError && (
          <div className="absolute right-9 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        )}
      </div>

      {(error || helpText) && (
        <div id={`${id}-description`} className="text-sm">
          {error ? (
            <span className="text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {error}
            </span>
          ) : helpText ? (
            <span className="text-muted-foreground">{helpText}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Form section component for better organization
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Form grid for responsive layouts
interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };

  return (
    <div className={cn(`grid gap-4 ${gridClass[columns]}`, className)}>
      {children}
    </div>
  );
}