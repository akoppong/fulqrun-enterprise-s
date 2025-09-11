import { DateValidator, DateValidationOptions, DateInput } from './date-validation';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, data?: any) => string | null;
  email?: boolean;
  url?: boolean;
  date?: DateValidationOptions | boolean;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class FormValidator {
  private schema: ValidationSchema;
  private errors: ValidationError[] = [];
  private data: any;

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  validate(data: Record<string, any>): { isValid: boolean; errors: ValidationError[] } {
    this.errors = [];
    this.data = data; // Store data for custom validators

    for (const [field, rule] of Object.entries(this.schema)) {
      const value = this.getNestedValue(data, field);
      this.validateField(field, value, rule);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private validateField(field: string, value: any, rule: ValidationRule): void {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
      this.addError(field, `${this.formatFieldName(field)} is required`);
      return;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        this.addError(field, `${this.formatFieldName(field)} must be at least ${rule.minLength} characters long`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        this.addError(field, `${this.formatFieldName(field)} cannot exceed ${rule.maxLength} characters`);
      }
    }

    // Numeric validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        this.addError(field, `${this.formatFieldName(field)} must be at least ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        this.addError(field, `${this.formatFieldName(field)} cannot exceed ${rule.max}`);
      }
    }

    // Email validation
    if (rule.email && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.addError(field, `${this.formatFieldName(field)} must be a valid email address`);
      }
    }

    // URL validation
    if (rule.url && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        this.addError(field, `${this.formatFieldName(field)} must be a valid URL`);
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        this.addError(field, `${this.formatFieldName(field)} format is invalid`);
      }
    }

    // Date validation
    if (rule.date) {
      const dateOptions = typeof rule.date === 'boolean' ? {} : rule.date;
      const dateResult = DateValidator.validate(value as DateInput, dateOptions);
      if (!dateResult.isValid && dateResult.error) {
        this.addError(field, dateResult.error);
      }
      
      // Add warnings as info messages (non-blocking)
      if (dateResult.warnings && dateResult.warnings.length > 0) {
        dateResult.warnings.forEach(warning => {
          // Store warnings separately or handle as needed
          console.warn(`Date validation warning for ${field}: ${warning}`);
        });
      }
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value, this.data);
      if (customError) {
        this.addError(field, customError);
      }
    }
  }

  private addError(field: string, message: string): void {
    this.errors.push({ field, message });
  }

  private formatFieldName(field: string): string {
    // Convert dot notation to readable format
    const parts = field.split('.');
    const lastPart = parts[parts.length - 1];
    
    // Convert camelCase to Title Case
    return lastPart.replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  getFieldErrors(field: string): string[] {
    return this.errors
      .filter(error => error.field === field)
      .map(error => error.message);
  }

  hasFieldError(field: string): boolean {
    return this.errors.some(error => error.field === field);
  }

  getFirstFieldError(field: string): string | null {
    const error = this.errors.find(error => error.field === field);
    return error ? error.message : null;
  }
}

// Common validation schemas
export const segmentValidationSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    custom: (value: string) => {
      if (value && /^\s+|\s+$/.test(value)) {
        return 'Segment name cannot start or end with spaces';
      }
      if (value && /\s{2,}/.test(value)) {
        return 'Segment name cannot contain consecutive spaces';
      }
      return null;
    }
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  'criteria.revenue.min': {
    min: 0,
    custom: (value: number, data?: any) => {
      if (value !== undefined && data?.criteria?.revenue?.max !== undefined && value >= data.criteria.revenue.max) {
        return 'Minimum revenue must be less than maximum revenue';
      }
      return null;
    }
  },
  'criteria.revenue.max': {
    min: 1,
    custom: (value: number, data?: any) => {
      if (value !== undefined && data?.criteria?.revenue?.min !== undefined && value <= data.criteria.revenue.min) {
        return 'Maximum revenue must be greater than minimum revenue';
      }
      return null;
    }
  },
  'characteristics.avgDealSize': {
    required: true,
    min: 0,
    max: 1000000000
  },
  'characteristics.avgSalesCycle': {
    required: true,
    min: 1,
    max: 365
  },
  'strategy.touchpoints': {
    required: true,
    min: 1,
    max: 50
  }
};

export const opportunityValidationSchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  description: {
    maxLength: 1000
  },
  value: {
    required: true,
    min: 0,
    max: 1000000000
  },
  expectedCloseDate: {
    required: true,
    date: {
      allowPast: false,
      allowFuture: true,
      required: true,
      maxDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years from now
    }
  }
};

export const companyValidationSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 200
  },
  industry: {
    required: true
  },
  size: {
    required: true
  },
  revenue: {
    min: 0,
    max: 10000000000
  },
  website: {
    url: true
  },
  email: {
    email: true
  }
};

// Utility functions
export function createFieldValidator(schema: ValidationSchema) {
  const validator = new FormValidator(schema);
  
  return {
    validate: (data: Record<string, any>) => validator.validate(data),
    validateField: (field: string, value: any, allData?: Record<string, any>) => {
      const fieldSchema = { [field]: schema[field] };
      const fieldValidator = new FormValidator(fieldSchema);
      const result = fieldValidator.validate(allData || { [field]: value });
      return {
        isValid: result.isValid,
        error: result.errors[0]?.message || null
      };
    },
    getFieldErrors: (field: string, data: Record<string, any>) => {
      const result = validator.validate(data);
      return validator.getFieldErrors(field);
    }
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}