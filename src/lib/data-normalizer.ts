/**
 * Data Normalization Service
 * Ensures consistent data formats across the FulQrun CRM system
 */

import { DateValidator, DateInput } from './date-validation';

export interface NormalizationOptions {
  normalizeEmptyStrings?: boolean;
  normalizeNumbers?: boolean;
  normalizeDates?: boolean;
  trimStrings?: boolean;
  removeExtraSpaces?: boolean;
  lowercaseEmails?: boolean;
  normalizePhoneNumbers?: boolean;
  normalizeUrls?: boolean;
}

export interface FieldTypeConfig {
  type: 'string' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'currency' | 'percentage' | 'boolean';
  required?: boolean;
  normalize?: boolean;
  validation?: any;
}

export interface DataSchema {
  [fieldName: string]: FieldTypeConfig;
}

export class DataNormalizer {
  private static readonly DEFAULT_OPTIONS: NormalizationOptions = {
    normalizeEmptyStrings: true,
    normalizeNumbers: true,
    normalizeDates: true,
    trimStrings: true,
    removeExtraSpaces: true,
    lowercaseEmails: true,
    normalizePhoneNumbers: true,
    normalizeUrls: true
  };

  /**
   * Normalizes an object based on its schema
   */
  static normalizeObject<T extends Record<string, any>>(
    data: T,
    schema: DataSchema,
    options: NormalizationOptions = {}
  ): { 
    normalized: T; 
    errors: Array<{ field: string; error: string }>; 
    warnings: Array<{ field: string; warning: string }>; 
  } {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const normalized = { ...data };
    const errors: Array<{ field: string; error: string }> = [];
    const warnings: Array<{ field: string; warning: string }> = [];

    for (const [fieldName, fieldConfig] of Object.entries(schema)) {
      const value = this.getNestedValue(data, fieldName);
      
      try {
        const result = this.normalizeField(value, fieldConfig, opts);
        this.setNestedValue(normalized, fieldName, result.value);
        
        if (result.error) {
          errors.push({ field: fieldName, error: result.error });
        }
        
        if (result.warning) {
          warnings.push({ field: fieldName, warning: result.warning });
        }
      } catch (error) {
        errors.push({ 
          field: fieldName, 
          error: `Normalization failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        });
      }
    }

    return { normalized, errors, warnings };
  }

  /**
   * Normalizes a single field based on its configuration
   */
  private static normalizeField(
    value: any,
    config: FieldTypeConfig,
    options: NormalizationOptions
  ): { value: any; error?: string; warning?: string } {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      if (config.required) {
        return { value: null, error: 'Field is required' };
      }
      return { value: null };
    }

    // Handle empty strings
    if (typeof value === 'string' && value.trim() === '') {
      if (config.required) {
        return { value: null, error: 'Field is required' };
      }
      return { value: options.normalizeEmptyStrings ? null : value };
    }

    if (!config.normalize) {
      return { value };
    }

    switch (config.type) {
      case 'string':
        return this.normalizeString(value, options);
      
      case 'number':
        return this.normalizeNumber(value, options);
      
      case 'date':
        return this.normalizeDate(value, options, config.validation);
      
      case 'email':
        return this.normalizeEmail(value, options);
      
      case 'phone':
        return this.normalizePhoneNumber(value, options);
      
      case 'url':
        return this.normalizeUrl(value, options);
      
      case 'currency':
        return this.normalizeCurrency(value, options);
      
      case 'percentage':
        return this.normalizePercentage(value, options);
      
      case 'boolean':
        return this.normalizeBoolean(value, options);
      
      default:
        return { value };
    }
  }

  private static normalizeString(value: any, options: NormalizationOptions): { value: any; warning?: string } {
    if (typeof value !== 'string') {
      return { value: String(value), warning: 'Value was converted to string' };
    }

    let normalized = value;

    if (options.trimStrings) {
      normalized = normalized.trim();
    }

    if (options.removeExtraSpaces) {
      normalized = normalized.replace(/\s+/g, ' ');
    }

    return { value: normalized };
  }

  private static normalizeNumber(value: any, options: NormalizationOptions): { value: any; error?: string; warning?: string } {
    if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        return { value: null, error: 'Invalid number value' };
      }
      return { value };
    }

    if (typeof value === 'string') {
      // Remove common formatting characters
      const cleanValue = value.replace(/[,$%\s]/g, '');
      const parsed = parseFloat(cleanValue);
      
      if (isNaN(parsed)) {
        return { value: null, error: 'Cannot convert to number' };
      }

      return { value: parsed, warning: value !== cleanValue ? 'Number formatting was removed' : undefined };
    }

    return { value: null, error: 'Invalid number input type' };
  }

  private static normalizeDate(value: any, options: NormalizationOptions, validation?: any): { value: any; error?: string; warning?: string } {
    const result = DateValidator.validate(value as DateInput, validation);
    
    if (!result.isValid) {
      return { value: null, error: result.error };
    }

    const warning = result.warnings && result.warnings.length > 0 ? result.warnings[0] : undefined;
    
    return { 
      value: result.isoString,
      warning
    };
  }

  private static normalizeEmail(value: any, options: NormalizationOptions): { value: any; error?: string; warning?: string } {
    if (typeof value !== 'string') {
      return { value: null, error: 'Email must be a string' };
    }

    let normalized = value.trim();

    if (options.lowercaseEmails) {
      normalized = normalized.toLowerCase();
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      return { value: null, error: 'Invalid email format' };
    }

    return { 
      value: normalized,
      warning: normalized !== value ? 'Email was normalized' : undefined
    };
  }

  private static normalizePhoneNumber(value: any, options: NormalizationOptions): { value: any; warning?: string } {
    if (typeof value !== 'string') {
      return { value: String(value), warning: 'Phone number converted to string' };
    }

    if (!options.normalizePhoneNumbers) {
      return { value };
    }

    // Remove all non-digit characters except + at the beginning
    let normalized = value.replace(/[^\d+]/g, '');
    
    // Handle US phone numbers
    if (normalized.length === 10 && !normalized.startsWith('+')) {
      normalized = `+1${normalized}`;
    } else if (normalized.length === 11 && normalized.startsWith('1')) {
      normalized = `+${normalized}`;
    } else if (!normalized.startsWith('+') && normalized.length > 10) {
      normalized = `+${normalized}`;
    }

    return { 
      value: normalized,
      warning: normalized !== value ? 'Phone number was normalized' : undefined
    };
  }

  private static normalizeUrl(value: any, options: NormalizationOptions): { value: any; error?: string; warning?: string } {
    if (typeof value !== 'string') {
      return { value: null, error: 'URL must be a string' };
    }

    let normalized = value.trim();

    if (options.normalizeUrls) {
      // Add protocol if missing
      if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized}`;
      }

      // Convert to lowercase (except path and query)
      try {
        const url = new URL(normalized);
        url.hostname = url.hostname.toLowerCase();
        url.protocol = url.protocol.toLowerCase();
        normalized = url.toString();
      } catch (error) {
        return { value: null, error: 'Invalid URL format' };
      }
    }

    return { 
      value: normalized,
      warning: normalized !== value ? 'URL was normalized' : undefined
    };
  }

  private static normalizeCurrency(value: any, options: NormalizationOptions): { value: any; error?: string; warning?: string } {
    if (typeof value === 'number') {
      // Round to 2 decimal places for currency
      const rounded = Math.round(value * 100) / 100;
      return { 
        value: rounded,
        warning: rounded !== value ? 'Currency value was rounded to 2 decimal places' : undefined
      };
    }

    if (typeof value === 'string') {
      // Remove currency symbols and formatting
      const cleanValue = value.replace(/[$,€£¥₹\s]/g, '');
      const parsed = parseFloat(cleanValue);
      
      if (isNaN(parsed)) {
        return { value: null, error: 'Cannot convert to currency value' };
      }

      const rounded = Math.round(parsed * 100) / 100;
      return { 
        value: rounded,
        warning: 'Currency formatting was removed and value was rounded'
      };
    }

    return { value: null, error: 'Invalid currency input type' };
  }

  private static normalizePercentage(value: any, options: NormalizationOptions): { value: any; error?: string; warning?: string } {
    if (typeof value === 'number') {
      // Ensure percentage is between 0 and 1 for internal storage
      if (value > 1 && value <= 100) {
        return { value: value / 100, warning: 'Percentage converted from 0-100 scale to 0-1 scale' };
      }
      return { value };
    }

    if (typeof value === 'string') {
      const cleanValue = value.replace(/[%\s]/g, '');
      const parsed = parseFloat(cleanValue);
      
      if (isNaN(parsed)) {
        return { value: null, error: 'Cannot convert to percentage value' };
      }

      // Convert to 0-1 scale if it appears to be in 0-100 scale
      const normalized = parsed > 1 && parsed <= 100 ? parsed / 100 : parsed;
      
      return { 
        value: normalized,
        warning: 'Percentage formatting was removed and value was normalized to 0-1 scale'
      };
    }

    return { value: null, error: 'Invalid percentage input type' };
  }

  private static normalizeBoolean(value: any, options: NormalizationOptions): { value: any; warning?: string } {
    if (typeof value === 'boolean') {
      return { value };
    }

    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      
      if (['true', 'yes', '1', 'on', 'enabled', 'active'].includes(lowerValue)) {
        return { value: true, warning: 'String converted to boolean true' };
      }
      
      if (['false', 'no', '0', 'off', 'disabled', 'inactive'].includes(lowerValue)) {
        return { value: false, warning: 'String converted to boolean false' };
      }
    }

    if (typeof value === 'number') {
      return { 
        value: value !== 0, 
        warning: 'Number converted to boolean (0 = false, non-zero = true)'
      };
    }

    return { value: Boolean(value), warning: 'Value converted to boolean using JavaScript truthiness' };
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

// Common schema definitions for FulQrun CRM entities
export const CRMDataSchemas = {
  Opportunity: {
    title: { type: 'string', required: true, normalize: true },
    description: { type: 'string', required: false, normalize: true },
    value: { type: 'currency', required: true, normalize: true },
    expectedCloseDate: { type: 'date', required: true, normalize: true },
    createdAt: { type: 'date', required: true, normalize: true },
    updatedAt: { type: 'date', required: true, normalize: true },
    probability: { type: 'percentage', required: false, normalize: true }
  } as DataSchema,

  Company: {
    name: { type: 'string', required: true, normalize: true },
    website: { type: 'url', required: false, normalize: true },
    email: { type: 'email', required: false, normalize: true },
    phone: { type: 'phone', required: false, normalize: true },
    revenue: { type: 'currency', required: false, normalize: true },
    employees: { type: 'number', required: false, normalize: true },
    createdAt: { type: 'date', required: true, normalize: true },
    updatedAt: { type: 'date', required: true, normalize: true }
  } as DataSchema,

  Contact: {
    firstName: { type: 'string', required: true, normalize: true },
    lastName: { type: 'string', required: true, normalize: true },
    email: { type: 'email', required: true, normalize: true },
    phone: { type: 'phone', required: false, normalize: true },
    title: { type: 'string', required: true, normalize: true },
    createdAt: { type: 'date', required: true, normalize: true },
    updatedAt: { type: 'date', required: true, normalize: true }
  } as DataSchema,

  Lead: {
    source: { type: 'string', required: true, normalize: true },
    score: { type: 'number', required: false, normalize: true },
    temperature: { type: 'string', required: false, normalize: true },
    lastContactDate: { type: 'date', required: false, normalize: true },
    createdAt: { type: 'date', required: true, normalize: true },
    updatedAt: { type: 'date', required: true, normalize: true }
  } as DataSchema,

  CustomerSegment: {
    name: { type: 'string', required: true, normalize: true },
    description: { type: 'string', required: true, normalize: true },
    'criteria.revenue.min': { type: 'currency', required: false, normalize: true },
    'criteria.revenue.max': { type: 'currency', required: false, normalize: true },
    'characteristics.avgDealSize': { type: 'currency', required: true, normalize: true },
    'characteristics.avgSalesCycle': { type: 'number', required: true, normalize: true },
    createdAt: { type: 'date', required: true, normalize: true },
    updatedAt: { type: 'date', required: true, normalize: true }
  } as DataSchema
};

// Utility functions for common operations
export function normalizeOpportunityData(opportunity: any) {
  return DataNormalizer.normalizeObject(opportunity, CRMDataSchemas.Opportunity);
}

export function normalizeCompanyData(company: any) {
  return DataNormalizer.normalizeObject(company, CRMDataSchemas.Company);
}

export function normalizeContactData(contact: any) {
  return DataNormalizer.normalizeObject(contact, CRMDataSchemas.Contact);
}

export function normalizeLeadData(lead: any) {
  return DataNormalizer.normalizeObject(lead, CRMDataSchemas.Lead);
}

export function normalizeSegmentData(segment: any) {
  return DataNormalizer.normalizeObject(segment, CRMDataSchemas.CustomerSegment);
}