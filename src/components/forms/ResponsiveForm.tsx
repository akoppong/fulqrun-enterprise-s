import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ResponsiveGrid, ResponsiveStack, ResponsiveContainer } from '../layout/EnhancedResponsiveLayout';
import { AlertCircle, CheckCircle } from '@phosphor-icons/react';

interface ResponsiveFormProps {
  children: ReactNode;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  onSubmit?: (e: React.FormEvent) => void;
}

export const ResponsiveForm = forwardRef<HTMLFormElement, ResponsiveFormProps>(
  ({ children, className, columns = { default: 1, md: 2, lg: 3 }, gap = 'md', onSubmit }, ref) => {
    return (
      <form 
        ref={ref}
        className={cn('w-full', className)}
        onSubmit={onSubmit}
      >
        <ResponsiveGrid cols={columns} gap={gap}>
          {children}
        </ResponsiveGrid>
      </form>
    );
  }
);

ResponsiveForm.displayName = 'ResponsiveForm';

interface ResponsiveFormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  success?: string;
  required?: boolean;
  description?: string;
  className?: string;
  labelClassName?: string;
  span?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function ResponsiveFormField({
  label,
  children,
  error,
  success,
  required = false,
  description,
  className,
  labelClassName,
  span
}: ResponsiveFormFieldProps) {
  const spanClasses = span ? [
    span.default && `col-span-${span.default}`,
    span.sm && `sm:col-span-${span.sm}`,
    span.md && `md:col-span-${span.md}`,
    span.lg && `lg:col-span-${span.lg}`,
  ].filter(Boolean).join(' ') : '';

  return (
    <div className={cn('space-y-2', spanClasses, className)}>
      <Label className={cn('text-sm font-medium', labelClassName)}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle size={14} />
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="py-2 border-green-200 bg-green-50 text-green-800">
          <CheckCircle size={14} />
          <AlertDescription className="text-xs">
            {success}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface ResponsiveFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function ResponsiveFormSection({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultExpanded = true
}: ResponsiveFormSectionProps) {
  return (
    <div className={cn('col-span-full', className)}>
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="p-4">
          <ResponsiveGrid cols={{ default: 1, md: 2, lg: 3 }} gap="md">
            {children}
          </ResponsiveGrid>
        </div>
      </div>
    </div>
  );
}

interface ResponsiveFormActionsProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
  sticky?: boolean;
}

export function ResponsiveFormActions({
  children,
  className,
  align = 'right',
  sticky = false
}: ResponsiveFormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center', 
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn(
      'col-span-full pt-6 border-t border-border mt-6',
      sticky && 'sticky bottom-0 bg-background z-10 pb-4',
      className
    )}>
      <div className={cn(
        'flex flex-col sm:flex-row gap-3',
        alignClasses[align]
      )}>
        {children}
      </div>
    </div>
  );
}

// Enhanced input components with responsive behavior
interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const ResponsiveInput = forwardRef<HTMLInputElement, ResponsiveInputProps>(
  ({ className, error, success, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          'touch-target w-full',
          error && 'border-destructive focus:border-destructive',
          success && 'border-green-500 focus:border-green-500',
          className
        )}
        {...props}
      />
    );
  }
);

ResponsiveInput.displayName = 'ResponsiveInput';

interface ResponsiveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
  autoResize?: boolean;
}

export const ResponsiveTextarea = forwardRef<HTMLTextAreaElement, ResponsiveTextareaProps>(
  ({ className, error, success, autoResize = false, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          'touch-target w-full min-h-[120px]',
          error && 'border-destructive focus:border-destructive',
          success && 'border-green-500 focus:border-green-500',
          autoResize && 'resize-none',
          className
        )}
        {...props}
      />
    );
  }
);

ResponsiveTextarea.displayName = 'ResponsiveTextarea';

// Mobile-optimized select component
interface ResponsiveSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: ReactNode;
  error?: boolean;
  success?: boolean;
  className?: string;
}

export function ResponsiveSelect({
  value,
  onValueChange,
  placeholder,
  children,
  error,
  success,
  className
}: ResponsiveSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <div className={cn(
        'touch-target w-full',
        error && '[&_[data-radix-select-trigger]]:border-destructive',
        success && '[&_[data-radix-select-trigger]]:border-green-500',
        className
      )}>
        {children}
      </div>
    </Select>
  );
}

// Form validation hook
export function useResponsiveForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const setError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const setTouched = (field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = (rules: Partial<Record<keyof T, (value: any) => string | undefined>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    
    Object.keys(rules).forEach(field => {
      const rule = rules[field as keyof T];
      if (rule) {
        const error = rule(values[field as keyof T]);
        if (error) {
          newErrors[field as keyof T] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setError,
    setTouched,
    setIsSubmitting,
    validate,
    reset,
    hasErrors: Object.keys(errors).length > 0
  };
}

// Mobile-friendly form layout examples
export function MobileOptimizedForm() {
  return (
    <ResponsiveContainer maxWidth="lg" padding="md">
      <ResponsiveForm columns={{ default: 1, md: 2, lg: 3 }}>
        <ResponsiveFormSection 
          title="Basic Information" 
          description="Essential contact details"
        >
          <ResponsiveFormField 
            label="Full Name" 
            required
            span={{ default: 1, lg: 2 }}
          >
            <ResponsiveInput placeholder="Enter full name" />
          </ResponsiveFormField>

          <ResponsiveFormField label="Email" required>
            <ResponsiveInput type="email" placeholder="Enter email address" />
          </ResponsiveFormField>

          <ResponsiveFormField label="Phone">
            <ResponsiveInput type="tel" placeholder="Enter phone number" />
          </ResponsiveFormField>

          <ResponsiveFormField 
            label="Company" 
            span={{ default: 1, md: 2 }}
          >
            <ResponsiveInput placeholder="Enter company name" />
          </ResponsiveFormField>
        </ResponsiveFormSection>

        <ResponsiveFormSection 
          title="Additional Details" 
          description="Optional information"
        >
          <ResponsiveFormField 
            label="Notes" 
            span={{ default: 1, md: 2, lg: 3 }}
            description="Any additional information about this contact"
          >
            <ResponsiveTextarea 
              placeholder="Enter notes..."
              autoResize
            />
          </ResponsiveFormField>
        </ResponsiveFormSection>

        <ResponsiveFormActions align="between" sticky>
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary">
              Save Draft
            </Button>
            <Button type="submit">
              Save Contact
            </Button>
          </div>
        </ResponsiveFormActions>
      </ResponsiveForm>
    </ResponsiveContainer>
  );
}

import { useState } from 'react';