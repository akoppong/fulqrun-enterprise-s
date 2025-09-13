/**
 * Enhanced validation utilities for opportunity forms
 */

export interface ValidationRule {
  field: string;
  validator: (value: any, formData?: any) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Core validation rules for opportunity forms
 */
export const opportunityValidationRules: ValidationRule[] = [
  // Required field validations
  {
    field: 'title',
    validator: (value: string) => Boolean(value && value.trim()),
    message: 'Opportunity title is required',
    severity: 'error'
  },
  {
    field: 'title',
    validator: (value: string) => !value || value.length >= 3,
    message: 'Title should be at least 3 characters long',
    severity: 'warning'
  },
  {
    field: 'companyId',
    validator: (value: string) => Boolean(value && value.trim()),
    message: 'Company selection is required',
    severity: 'error'
  },
  {
    field: 'value',
    validator: (value: string | number) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return !isNaN(numValue) && numValue > 0;
    },
    message: 'Valid deal value greater than zero is required',
    severity: 'error'
  },
  {
    field: 'value',
    validator: (value: string | number) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return isNaN(numValue) || numValue <= 10000000;
    },
    message: 'Deal value seems unusually high. Please verify.',
    severity: 'warning'
  },
  {
    field: 'expectedCloseDate',
    validator: (value: string) => Boolean(value && value.trim()),
    message: 'Expected close date is required',
    severity: 'error'
  },
  {
    field: 'expectedCloseDate',
    validator: (value: string) => {
      if (!value) return true;
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    message: 'Close date cannot be in the past',
    severity: 'error'
  },
  {
    field: 'expectedCloseDate',
    validator: (value: string) => {
      if (!value) return true;
      const date = new Date(value);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      return date <= oneYearFromNow;
    },
    message: 'Close date is more than a year away',
    severity: 'warning'
  },
  {
    field: 'probability',
    validator: (value: string | number) => {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
    },
    message: 'Probability must be between 0% and 100%',
    severity: 'error'
  },
  {
    field: 'ownerId',
    validator: (value: string) => Boolean(value && value.trim()),
    message: 'Opportunity owner is required',
    severity: 'error'
  }
];

/**
 * Business logic validation rules
 */
export const businessLogicRules: ValidationRule[] = [
  {
    field: 'contactId',
    validator: (contactId: string, formData: any) => {
      if (!contactId || !formData?.companyId || !formData?.availableContacts) {
        return true; // Skip if no contact selected or no company
      }
      const contact = formData.availableContacts.find((c: any) => c.id === contactId);
      return !contact || contact.companyId === formData.companyId;
    },
    message: 'Selected contact does not belong to the selected company',
    severity: 'error'
  }
];

/**
 * Duplicate check rules
 */
export const duplicateCheckRules: ValidationRule[] = [
  {
    field: 'title',
    validator: (title: string, formData: any) => {
      if (!title || !formData?.companyId || !formData?.existingOpportunities) {
        return true;
      }
      
      const duplicate = formData.existingOpportunities.find((opp: any) => 
        opp.id !== formData.editingId &&
        opp.title.toLowerCase() === title.toLowerCase() &&
        opp.companyId === formData.companyId
      );
      
      return !duplicate;
    },
    message: 'An opportunity with this title already exists for this company',
    severity: 'warning'
  }
];

/**
 * Validates form data against all rules
 */
export function validateOpportunityForm(formData: any, context: any = {}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Combine all rule sets
  const allRules = [
    ...opportunityValidationRules,
    ...businessLogicRules,
    ...duplicateCheckRules
  ];

  // Create enhanced form data with context
  const enhancedFormData = {
    ...formData,
    ...context
  };

  // Run validation rules
  allRules.forEach(rule => {
    const fieldValue = formData[rule.field];
    const isValid = rule.validator(fieldValue, enhancedFormData);

    if (!isValid) {
      const error: ValidationError = {
        field: rule.field,
        message: rule.message,
        severity: rule.severity
      };

      if (rule.severity === 'error') {
        errors.push(error);
      } else {
        warnings.push(error);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates a specific field
 */
export function validateField(fieldName: string, value: any, formData: any = {}, context: any = {}): ValidationError[] {
  const fieldRules = [
    ...opportunityValidationRules,
    ...businessLogicRules,
    ...duplicateCheckRules
  ].filter(rule => rule.field === fieldName);

  const errors: ValidationError[] = [];
  const enhancedFormData = { ...formData, ...context };

  fieldRules.forEach(rule => {
    const isValid = rule.validator(value, enhancedFormData);
    if (!isValid) {
      errors.push({
        field: rule.field,
        message: rule.message,
        severity: rule.severity
      });
    }
  });

  return errors;
}

/**
 * Real-time field validation hook
 */
export function useFieldValidation(fieldName: string, value: any, formData: any = {}, context: any = {}) {
  const errors = validateField(fieldName, value, formData, context);
  return {
    hasError: errors.some(e => e.severity === 'error'),
    hasWarning: errors.some(e => e.severity === 'warning'),
    errors: errors.filter(e => e.severity === 'error'),
    warnings: errors.filter(e => e.severity === 'warning'),
    allErrors: errors
  };
}

/**
 * Form completion progress calculation
 */
export function calculateFormProgress(formData: any): number {
  const requiredFields = ['title', 'companyId', 'value', 'expectedCloseDate', 'ownerId'];
  const optionalFields = ['description', 'contactId', 'industry', 'leadSource', 'tags'];

  const completedRequired = requiredFields.filter(field => {
    const value = formData[field];
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value && String(value).trim());
  }).length;

  const completedOptional = optionalFields.filter(field => {
    const value = formData[field];
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value && String(value).trim());
  }).length;

  // Required fields count for 70% of progress, optional for 30%
  const requiredProgress = (completedRequired / requiredFields.length) * 70;
  const optionalProgress = (completedOptional / optionalFields.length) * 30;

  return Math.round(requiredProgress + optionalProgress);
}

/**
 * Check if form has critical errors that prevent saving
 */
export function hasCriticalErrors(validationResult: ValidationResult): boolean {
  return validationResult.errors.length > 0;
}

/**
 * Get form validation summary for display
 */
export function getValidationSummary(validationResult: ValidationResult): {
  status: 'error' | 'warning' | 'success';
  message: string;
  count: number;
} {
  const { errors, warnings } = validationResult;

  if (errors.length > 0) {
    return {
      status: 'error',
      message: `${errors.length} error${errors.length > 1 ? 's' : ''} must be fixed`,
      count: errors.length
    };
  }

  if (warnings.length > 0) {
    return {
      status: 'warning',
      message: `${warnings.length} warning${warnings.length > 1 ? 's' : ''}`,
      count: warnings.length
    };
  }

  return {
    status: 'success',
    message: 'Ready to save',
    count: 0
  };
}

/**
 * CSS classes for field validation states
 */
export const getFieldValidationClass = (fieldName: string, validationResult: ValidationResult): string => {
  const fieldErrors = validationResult.errors.filter(e => e.field === fieldName);
  const fieldWarnings = validationResult.warnings.filter(e => e.field === fieldName);

  if (fieldErrors.length > 0) {
    return 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500';
  }

  if (fieldWarnings.length > 0) {
    return 'border-yellow-300 bg-yellow-50 focus:border-yellow-500 focus:ring-yellow-500';
  }

  return 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500';
};